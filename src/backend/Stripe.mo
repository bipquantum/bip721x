import Types "Types";

import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Cycles "mo:base/ExperimentalCycles";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";

import IdempotentProxy "canister:idempotent_proxy_canister";

import SubscriptionManager "SubscriptionManager";

module {

  public type HeaderField = Types.HeaderField;
  public type HttpRequest = Types.HttpRequest;
  public type HttpResponse = Types.HttpResponse;

  // TODO: Replace with your actual Stripe secret key
  let STRIPE_SECRET_KEY = "sk_test_51SUiIVEq6YsoiR2BKN5V88opI4i8dySeKzBYcoq312Bgw67IVcsE7UYMJohCMSuivhiEy9fMqnGrcgkCDe8bpCsf00V0SqIbvK"; // HARDCODED FOR NOW

  // Map Stripe Payment Link IDs to Plan IDs
  // TODO: Update these with your actual Payment Link IDs from Stripe
  func mapPaymentLinkToPlanId(paymentLinkId: Text) : ?Text {
    switch (paymentLinkId) {
      case "plink_1SUqfIEq6YsoiR2BzqKaTpQB" { ?"premium_monthly" };
      // Add more mappings here as you create more payment links
      // case "plink_xxxxx" { ?"pro_yearly" };
      case _ { null };
    };
  };

  // Check if request should be upgraded for webhook handling
  public func shouldUpgradeRequest(req: HttpRequest) : Bool {
    (req.url == "/stripe-webhook" or req.url == "/stripe-webhook/") and req.method == "POST";
  };

  // Handle webhook POST request (called from http_request_update)
  public func handleWebhook(req: HttpRequest, subscriptionManager: SubscriptionManager.SubscriptionManager) : async HttpResponse {
    // Only handle POST to /stripe-webhook
    if (req.method != "POST" or (req.url != "/stripe-webhook" and req.url != "/stripe-webhook/")) {
      return {
        status_code = 404;
        headers = [("content-type", "text/plain")];
        body = Text.encodeUtf8("Not Found");
        upgrade = null;
      };
    };

    // Parse the webhook body
    let ?bodyText = Text.decodeUtf8(req.body) else {
      Debug.print("Failed to decode webhook body");
      return errorResponse("Invalid webhook body");
    };

    Debug.print("Received Stripe webhook: " # bodyText);

    // Extract event ID from the webhook body
    let ?eventId = extractEventId(bodyText) else {
      Debug.print("Failed to extract event ID from webhook");
      return errorResponse("Missing event ID");
    };

    Debug.print("Extracted event ID: " # eventId);

    // Verify the event by fetching it from Stripe
    switch (await verifyStripeEvent(eventId)) {
      case (#err(msg)) {
        Debug.print("Event verification failed: " # msg);
        return errorResponse("Event verification failed");
      };
      case (#ok(eventData)) {
        Debug.print("Event verified successfully");

        // Process the event based on type
        switch (await processStripeEvent(eventData, subscriptionManager)) {
          case (#err(msg)) {
            Debug.print("Event processing failed: " # msg);
            return errorResponse("Event processing failed");
          };
          case (#ok()) {
            Debug.print("Event processed successfully");
            return {
              status_code = 200;
              headers = [("content-type", "application/json")];
              body = Text.encodeUtf8("{\"received\":true}");
              upgrade = null;
            };
          };
        };
      };
    };
  };

  // Helper: Extract event ID from webhook JSON
  func extractEventId(json: Text) : ?Text {
    // Look for "id":"evt_xxxxx"
    let ?idPos = textIndexOf(json, "\"id\"") else return null;
    let afterId = textSubstring(json, idPos + 4, json.size());
    let ?colonPos = textIndexOf(afterId, ":") else return null;
    let afterColon = textSubstring(afterId, colonPos + 1, afterId.size());

    // Skip whitespace and opening quote
    let chars = Iter.toArray(afterColon.chars());
    var startPos : ?Nat = null;
    label findQuote for (i in Iter.range(0, chars.size() - 1)) {
      if (chars[i] != ' ' and chars[i] != '\t' and chars[i] != '\n' and chars[i] != '\r') {
        if (chars[i] == '\"') {
          startPos := ?(i + 1);
        };
        break findQuote;
      };
    };

    let ?start = startPos else return null;

    // Extract until closing quote
    var result = "";
    var i = start;
    while (i < chars.size() and chars[i] != '\"') {
      result #= Text.fromChar(chars[i]);
      i += 1;
    };

    if (result == "") { null } else { ?result };
  };

  // Helper: Verify event with Stripe API
  func verifyStripeEvent(eventId: Text) : async Result.Result<Text, Text> {
    Cycles.add<system>(1_000_000_000);

    let response = await IdempotentProxy.proxy_http_request({
      url = "https://api.stripe.com/v1/events/" # eventId;
      method = #get;
      max_response_bytes = null;
      body = null;
      transform = null;
      headers = [
        { name = "idempotency-key"; value = "idempotency_key_001"       },
        { name = "content-type"   ; value = "application/json"          },
        { name = "Authorization"; value = "Bearer " # STRIPE_SECRET_KEY },
      ];
    });

    let ?responseText = Text.decodeUtf8(response.body) else {
      return #err("Failed to decode Stripe API response");
    };

    Debug.print("Stripe API response: " # responseText);

    // Check if response contains an error
    switch (textIndexOf(responseText, "\"error\"")) {
      case (?_) { #err("Stripe API returned an error") };
      case null { #ok(responseText) };
    };
  };

  // Helper: Process verified Stripe event
  func processStripeEvent(eventData: Text, subscriptionManager: SubscriptionManager.SubscriptionManager) : async Result.Result<(), Text> {
    // Check event type
    let ?eventType = extractJsonField(eventData, "type") else {
      return #err("Failed to extract event type");
    };

    Debug.print("Processing event type: " # eventType);

    if (eventType == "checkout.session.completed") {
      // Extract session data
      // Stripe event structure: {"data":{"object":{"client_reference_id":"...","metadata":{"plan_id":"..."}}}}
      let ?clientReferenceId = extractJsonField(eventData, "client_reference_id") else {
        return #err("Missing client_reference_id");
      };

      // Try to get plan_id from metadata first (won't work with Payment Links)
      let planIdOpt = extractJsonField(eventData, "plan_id");

      let metadataPlanId = switch (planIdOpt) {
        case (?planId) { planId };
        case null {
          // Stripe Payment Links don't support metadata on checkout sessions
          // So we map payment_link ID to plan_id instead
          Debug.print("metadata.plan_id not found (expected for Payment Links)");

          // Get payment_link field
          let ?paymentLink = extractJsonField(eventData, "payment_link") else {
            return #err("Missing payment_link field in checkout session");
          };

          Debug.print("Payment link ID: " # paymentLink);

          // Map payment link to plan ID
          let ?mappedPlanId = mapPaymentLinkToPlanId(paymentLink) else {
            Debug.print("Error: Payment link not mapped to any plan");
            Debug.print("Add mapping in Stripe.mo mapPaymentLinkToPlanId()");
            return #err("Unknown payment link: " # paymentLink);
          };

          Debug.print("Mapped to plan ID: " # mappedPlanId);
          mappedPlanId
        };
      };

      Debug.print("Client reference ID: " # clientReferenceId);
      Debug.print("Plan ID: " # metadataPlanId);

      // Convert client_reference_id to Principal
      let userPrincipal = Principal.fromText(clientReferenceId);

      // Activate subscription
      switch (await* subscriptionManager.activateStripeSubscription(userPrincipal, metadataPlanId)) {
        case (#err(msg)) {
          Debug.print("Failed to activate subscription: " # msg);
          return #err("Subscription activation failed: " # msg);
        };
        case (#ok()) {
          Debug.print("Successfully activated subscription");
        };
      };

      #ok();
    } else {
      Debug.print("Ignoring event type: " # eventType);
      #ok();
    };
  };

  // Helper: Extract field from JSON
  func extractJsonField(json: Text, field: Text) : ?Text {
    let pattern = "\"" # field # "\"";
    let ?fieldPos = textIndexOf(json, pattern) else return null;
    let afterField = textSubstring(json, fieldPos + pattern.size(), json.size());
    let ?colonPos = textIndexOf(afterField, ":") else return null;
    let afterColon = textSubstring(afterField, colonPos + 1, afterField.size());

    let chars = Iter.toArray(afterColon.chars());
    var startPos : ?Nat = null;
    label findQuote2 for (i in Iter.range(0, chars.size() - 1)) {
      if (chars[i] != ' ' and chars[i] != '\t' and chars[i] != '\n' and chars[i] != '\r') {
        if (chars[i] == '\"') {
          startPos := ?(i + 1);
        };
        break findQuote2;
      };
    };

    let ?start = startPos else return null;

    var result = "";
    var i = start;
    while (i < chars.size() and chars[i] != '\"') {
      result #= Text.fromChar(chars[i]);
      i += 1;
    };

    if (result == "") { null } else { ?result };
  };

  // Helper: Error response
  func errorResponse(msg: Text) : HttpResponse {
    {
      status_code = 400;
      headers = [("content-type", "text/plain")];
      body = Text.encodeUtf8(msg);
      upgrade = null;
    };
  };

  // Text utilities
  func textIndexOf(text: Text, pattern: Text) : ?Nat {
    let textChars = Iter.toArray(text.chars());
    let patternChars = Iter.toArray(pattern.chars());

    if (patternChars.size() == 0 or patternChars.size() > textChars.size()) {
      return null;
    };

    var i = 0;
    while (i <= textChars.size() - patternChars.size()) {
      var match = true;
      var j = 0;
      while (j < patternChars.size()) {
        if (textChars[i + j] != patternChars[j]) {
          match := false;
          j := patternChars.size();
        };
        j += 1;
      };
      if (match) {
        return ?i;
      };
      i += 1;
    };
    null;
  };

  func textSubstring(text: Text, start: Nat, end: Nat) : Text {
    let chars = Iter.toArray(text.chars());
    if (start >= chars.size()) return "";
    let endIdx = if (end > chars.size()) chars.size() else end;
    var result = "";
    var i = start;
    while (i < endIdx) {
      result #= Text.fromChar(chars[i]);
      i += 1;
    };
    result;
  };

};
