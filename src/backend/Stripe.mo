import Result "mo:base/Result";
import Debug "mo:base/Debug";
import Cycles "mo:base/ExperimentalCycles";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import Int "mo:base/Int";

import IC "ic:aaaaa-aa";

module {

  // Verify Stripe subscription status
  // Returns #ok if subscription is active and paid, #err otherwise
  public func verifySubscriptionPayment(subscriptionId: Text, secretKey: Text) : async Result.Result<(), Text> {
    Cycles.add<system>(20_854_438_800);

    let response = await IC.http_request({
      url = "https://api.stripe.com/v1/subscriptions/" # subscriptionId;
      method = #get;
      max_response_bytes = null;
      is_replicated = ?false; // single replica is fine
      body = null;
      transform = null;
      headers = [
        { name = "content-type"   ; value = "application/json"     },
        { name = "Authorization"  ; value = "Bearer " # secretKey  },
      ];
    });

    let ?responseText = Text.decodeUtf8(response.body) else {
      return #err("Failed to decode Stripe API response");
    };

    Debug.print("Stripe subscription check response: " # responseText);

    // Check if response contains an error
    switch (textIndexOf(responseText, "\"error\"")) {
      case (?_) { return #err("Stripe API returned an error") };
      case null {};
    };

    // Extract subscription status
    let ?status = extractJsonField(responseText, "status") else {
      return #err("Failed to extract subscription status");
    };

    Debug.print("Stripe subscription status: " # status);

    // Check if subscription is in a valid paid state
    // - active: Currently active and paid
    // - trialing: In trial period (still valid)
    if (status == "active" or status == "trialing") {
      #ok;
    } else {
      #err("Subscription is not active: status = " # status);
    };
  };

  // Cancel a Stripe subscription at the end of the current billing period
  public func cancelSubscription(subscriptionId: Text, secretKey: Text) : async Result.Result<(), Text> {
    Cycles.add<system>(20_854_438_800);

    // Use POST to /v1/subscriptions/{id} with cancel_at_period_end=true
    let body = "cancel_at_period_end=true";
    let response = await IC.http_request({
      url = "https://api.stripe.com/v1/subscriptions/" # subscriptionId;
      method = #post;
      max_response_bytes = null;
      is_replicated = ?false; // single replica is fine
      body = ?Text.encodeUtf8(body);
      transform = null;
      headers = [
        { name = "content-type"   ; value = "application/x-www-form-urlencoded" },
        { name = "Authorization"  ; value = "Bearer " # secretKey               },
      ];
    });

    let ?responseText = Text.decodeUtf8(response.body) else {
      return #err("Failed to decode Stripe API response");
    };

    Debug.print("Stripe cancel subscription response: " # responseText);

    // Check if response contains an error
    switch (textIndexOf(responseText, "\"error\"")) {
      case (?_) { #err("Stripe API returned an error: " # responseText) };
      case null { #ok };
    };
  };

  // Set a scheduled cancellation date on a Stripe subscription
  // cancelAt is a Unix timestamp in seconds
  public func setCancelAt(subscriptionId: Text, cancelAtSeconds: Int, secretKey: Text) : async Result.Result<(), Text> {
    Cycles.add<system>(20_854_438_800);

    // POST to /v1/subscriptions/{id} with cancel_at parameter
    let body = "cancel_at=" # Int.toText(cancelAtSeconds);
    let response = await IC.http_request({
      url = "https://api.stripe.com/v1/subscriptions/" # subscriptionId;
      method = #post;
      max_response_bytes = null;
      is_replicated = ?false; // single replica is fine
      body = ?Text.encodeUtf8(body);
      transform = null;
      headers = [
        { name = "content-type"   ; value = "application/x-www-form-urlencoded" },
        { name = "Authorization"  ; value = "Bearer " # secretKey               },
      ];
    });

    let ?responseText = Text.decodeUtf8(response.body) else {
      return #err("Failed to decode Stripe API response");
    };

    Debug.print("Stripe set cancel_at response: " # responseText);

    // Check if response contains an error
    switch (textIndexOf(responseText, "\"error\"")) {
      case (?_) { #err("Stripe API returned an error: " # responseText) };
      case null { #ok };
    };
  };

  // Checkout session info extracted from Stripe event
  public type CheckoutInfo = {
    clientReferenceId: Text;  // User principal as text
    subscriptionId: Text;     // Stripe subscription ID
    planId: ?Text;            // Plan ID from metadata (if present)
    paymentLink: ?Text;       // Payment link ID (if present, for lookup)
  };

  // Parse checkout.session.completed event and extract relevant info
  // Returns null if event type is not checkout.session.completed
  public func getCheckoutInfo(eventData: Text) : Result.Result<?CheckoutInfo, Text> {
    // Check event type - use extractEventType to get root-level type
    let ?eventType = extractEventType(eventData) else {
      return #err("Failed to extract event type");
    };

    if (eventType != "checkout.session.completed") {
      return #ok(null); // Not a checkout event, ignore
    };

    // Extract required fields
    let ?clientReferenceId = extractJsonField(eventData, "client_reference_id") else {
      return #err("Missing client_reference_id");
    };

    let ?subscriptionId = extractJsonField(eventData, "subscription") else {
      return #err("Missing subscription ID in checkout session");
    };

    // Extract optional fields
    let planId = extractJsonField(eventData, "plan_id");
    let paymentLink = extractJsonField(eventData, "payment_link");

    #ok(?{
      clientReferenceId;
      subscriptionId;
      planId;
      paymentLink;
    });
  };

  // Verify event with Stripe API - returns the full event data if valid
  public func verifyStripeEvent(eventId: Text, secretKey: Text) : async Result.Result<Text, Text> {
    Cycles.add<system>(20_854_438_800);

    let response = await IC.http_request({
      url = "https://api.stripe.com/v1/events/" # eventId;
      method = #get;
      max_response_bytes = null;
      is_replicated = ?false; // single replica is fine
      body = null;
      transform = null;
      headers = [
        { name = "content-type"   ; value = "application/json"    },
        { name = "Authorization"  ; value = "Bearer " # secretKey },
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

  // Public helper: Extract field from JSON
  // Searches for "field": pattern to ensure we match field names, not values
  public func extractJsonField(json: Text, field: Text) : ?Text {
    // Search for "field" followed by optional whitespace and colon
    let pattern = "\"" # field # "\"";
    let jsonChars = Iter.toArray(json.chars());
    let patternChars = Iter.toArray(pattern.chars());

    if (patternChars.size() == 0 or patternChars.size() > jsonChars.size()) {
      return null;
    };

    // Find pattern where it's followed by : (field name, not value)
    var searchPos = 0;
    label searchLoop while (searchPos <= jsonChars.size() - patternChars.size()) {
      // Check if pattern matches at this position
      var match = true;
      var j = 0;
      while (j < patternChars.size()) {
        if (jsonChars[searchPos + j] != patternChars[j]) {
          match := false;
          j := patternChars.size();
        };
        j += 1;
      };

      if (match) {
        // Found the pattern, now check if followed by : (with optional whitespace)
        var checkPos = searchPos + patternChars.size();
        // Skip whitespace
        while (checkPos < jsonChars.size() and (jsonChars[checkPos] == ' ' or jsonChars[checkPos] == '\t' or jsonChars[checkPos] == '\n' or jsonChars[checkPos] == '\r')) {
          checkPos += 1;
        };
        // Check for colon
        if (checkPos < jsonChars.size() and jsonChars[checkPos] == ':') {
          // This is a field name, extract the value
          let afterColon = textSubstring(json, checkPos + 1, json.size());
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

          let ?start = startPos else {
            // Not a string value, continue searching
            searchPos += 1;
            continue searchLoop;
          };

          var result = "";
          var i = start;
          while (i < chars.size() and chars[i] != '\"') {
            result #= Text.fromChar(chars[i]);
            i += 1;
          };

          if (result != "") {
            return ?result;
          };
        };
      };
      searchPos += 1;
    };
    null;
  };

  // Public helper: Extract event ID from webhook JSON
  public func extractEventId(json: Text) : ?Text {
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

  // Extract the root-level event type from Stripe webhook JSON
  // The root "type" field is the last occurrence in the JSON
  public func extractEventType(json: Text) : ?Text {
    let pattern = "\"type\"";
    let ?lastPos = textLastIndexOf(json, pattern) else return null;
    let afterField = textSubstring(json, lastPos + pattern.size(), json.size());
    let ?colonPos = textIndexOf(afterField, ":") else return null;
    let afterColon = textSubstring(afterField, colonPos + 1, afterField.size());

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

    var result = "";
    var i = start;
    while (i < chars.size() and chars[i] != '\"') {
      result #= Text.fromChar(chars[i]);
      i += 1;
    };

    if (result == "") { null } else { ?result };
  };

  // Text utilities (private)
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

  // Find the last occurrence of a pattern in text
  func textLastIndexOf(text: Text, pattern: Text) : ?Nat {
    let textChars = Iter.toArray(text.chars());
    let patternChars = Iter.toArray(pattern.chars());

    if (patternChars.size() == 0 or patternChars.size() > textChars.size()) {
      return null;
    };

    var lastMatch : ?Nat = null;
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
        lastMatch := ?i;
      };
      i += 1;
    };
    lastMatch;
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
