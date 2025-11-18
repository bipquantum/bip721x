import Types          "Types";
import Model          "Model";
import Conversions    "intprop/Conversions";
import ChatBot        "ChatBot";
import ChatBotHistory "ChatBotHistory";
import TradeManager   "TradeManager";
import XRCTypes       "XRCTypes";
import Share          "Share";
import MigrationTypes "migrations/Types";
import Migrations     "migrations/Migrations";

import BIP721Ledger  "canister:bip721_ledger";
import ExchangeRate  "canister:exchange_rate";
import IdempotentProxy "canister:idempotent_proxy_canister";

import Result        "mo:base/Result";
import Principal     "mo:base/Principal";
import Debug         "mo:base/Debug";
import Option        "mo:base/Option";
import Cycles        "mo:base/ExperimentalCycles";
import Time          "mo:base/Time";
import Blob          "mo:base/Blob";
import Text          "mo:base/Text";
import Iter          "mo:base/Iter";

shared({ caller = admin; }) actor class Backend(args: MigrationTypes.Args) = this {

  type User                  = Types.User;
  type CreateUserArgs        = Types.CreateUserArgs;
  type Account               = Types.Account;
  type ChatHistory           = Types.ChatHistory;
  type IntPropInput          = Types.IntPropInput;
  type FullIntProp           = Types.FullIntProp;
  type CreateIntPropResult   = Types.CreateIntPropResult;
  type QueryDirection        = Types.QueryDirection;
  type Notification          = Types.Notification;
  type NotificationType      = Types.NotificationType;
  type SCkUsdtRate           = Types.SCkUsdtRate;
  type Result<Ok, Err>       = Result.Result<Ok, Err>;

  // STABLE MEMBER
  stable var _state: MigrationTypes.State = Migrations.install(args);
  _state := Migrations.migrate(_state, args);

  // NON-STABLE MEMBER
  var model : ?Model.Model = null;

  // Unfortunately the principal of the canister cannot be used at the construction of the actor
  // because of the compiler error "cannot use self before self has been defined".
  // Therefore, one need to use an init method to initialize the model.
  public shared({caller}) func init_model() : async Result<(), Text> {

    if (not Principal.equal(caller, admin)) {
      return #err("Only the admin can initialize the model");
    };

    if (Option.isSome(model)) {
      return #err("The model is already initialized");
    };

    switch(_state){
      case(#v0_8_0(state)){
        let builtModel = Model.build({
          state;
          backendId = Principal.fromActor(this);
        });
        ignore builtModel.controller.startTimer();
        model := ?builtModel;
      };
      case(_) { Debug.trap("Unexpected state version: v0_8_0"); };
    };
    
    #ok;
  };

  public shared({caller}) func set_user(user: CreateUserArgs): async Result<(), Text> {
    getModel().controller.setUser({ user with caller;} );
  };

  public query func get_user(principal: Principal): async ?User {
    getModel().controller.getUser(principal);
  };

  public query({caller}) func get_chat_histories() : async [ChatHistory] {
    getModel().chatBotHistory.getChatHistories({ caller; });
  };

  public query({caller}) func get_chat_history({id: Text;}) : async Result<ChatHistory, Text> {
    getModel().chatBotHistory.getChatHistory({ caller; id; });
  };

  public shared({caller}) func create_chat_history({id: Text; version: Text; name: Text;}) : async Result<(), Text> {
    getModel().chatBotHistory.createChatHistory({ caller; id; version; name; date = Time.now(); });
  };

  public shared({caller}) func delete_chat_history({id: Text;}) : async Result<(), Text> {
    getModel().chatBotHistory.deleteChatHistory({ caller; id; });
  };

  public shared({caller}) func update_chat_history({id: Text; events: Text; aiPrompts: Text}) : async Result<(), Text> {
    getModel().chatBotHistory.updateChatHistory({ caller; id; events; aiPrompts; });
  };

  public shared({caller}) func rename_chat_history({id: Text; name: Text;}) : async Result<(), Text> {
    getModel().chatBotHistory.renameChatHistory({ caller; id; name; });
  };

  public shared({caller}) func create_int_prop(args: IntPropInput) : async CreateIntPropResult {
    await getModel().controller.createIntProp({ args with author = caller; });
  };

  public shared({caller}) func list_int_prop({ token_id: Nat; e6s_usdt_price: Nat; }) : async Result<(), Text> {
    await* getModel().controller.listIntProp({ caller; id = token_id; e6sUsdtPrice = e6s_usdt_price; });
  };

  public shared({caller}) func unlist_int_prop({token_id: Nat;}) : async Result<(), Text> {
    await* getModel().controller.unlistIntProp({ caller; id = token_id; });
  };

  public composite query func get_int_props_of({owner: Principal; prev: ?Nat; take: ?Nat;}) : async [Nat] {
    await BIP721Ledger.icrc7_tokens_of({ owner; subaccount = null }, prev, take);
  };

  public query func get_listed_int_props({prev: ?Nat; take: ?Nat; direction: QueryDirection}) : async [Nat] {
    getModel().controller.getListedIntProps({ prev; take; direction; });
  };

  public composite query({caller}) func get_int_prop({token_id: Nat}) : async Result<FullIntProp, Text> {
    
    label check_authorized do {
      
      // Check if the caller is the owner of the token
      let accounts = await BIP721Ledger.icrc7_owner_of([token_id]);
      switch(getModel().controller.extractOwner(accounts)){
        case(null) {};
        case(?owner) {
          if (Principal.equal(owner, caller)) {
            break check_authorized;
          };
        };
      };

      // Check if the IP is listed
      if (getModel().controller.isListedIntProp(token_id)){
        break check_authorized;
      };

      return #err("You are not authorized to query this IP");
    };

    let metadata = await BIP721Ledger.icrc7_token_metadata([token_id]);

    // TODO sardariuss 2024-09-07: better error handling
    let intProp = Conversions.metadataToIntProp(metadata[0]);
    let author = switch(intProp){
      case(#V1(ip)) { 
        switch(getModel().controller.getUser(ip.author)){
          case(null) { null };
          case(?user) { ?user.nickName; };
        };
      };
    };

    // Add the author information
    #ok({ intProp; author; }); 
  };

  public composite query func owners_of({token_ids: [Nat]}) : async [?Principal] {
    let accounts = await BIP721Ledger.icrc7_owner_of(token_ids);
    getModel().controller.extractOwners(accounts);
  };

  public composite query func owner_of({token_id: Nat}) : async ?Principal {
    let accounts = await BIP721Ledger.icrc7_owner_of([token_id]);
    getModel().controller.extractOwner(accounts);
  };

  public query func get_e6s_price({token_id: Nat}) : async Result<Nat, Text> {
    getModel().controller.getE6sPrice({ id = token_id });
  };

  public shared({caller}) func buy_int_prop({token_id: Nat}) : async Result<(), Text> {
    await* getModel().controller.buyIntProp({ id = token_id; buyer = caller; });
  };

  public query func cycles_balance() : async Nat {
    Cycles.balance();
  };

  public shared({caller}) func chatbot_completion({question: Text; id: Text; }) : async Result<Text, Text> {
    await* getModel().controller.chatbotCompletion({caller; question; id; });
  };

  public query({caller}) func is_airdrop_available() : async Bool {
    getModel().controller.isAirdropAvailable(caller);
  };

  public query func get_number_of_users() : async Nat {
    getModel().controller.getNumberOfUsers();
  };

  public shared({caller}) func airdrop_user() : async Result<Nat, Text> {
    await getModel().controller.airdropUser(caller);
  };

  public query func get_airdrop_info(): async Types.SAirdropInfo {
    getModel().controller.getAirdropInfo();
  };

  public shared({caller}) func set_airdrop_per_user({ amount : Nat; }) : async Result<(), Text> {
    if (caller != admin) {
      return #err("Only the admin can call this function!");
    };
    getModel().controller.setAirdropPerUser({amount});
    #ok;
  };

  public shared({caller}) func ban_int_prop({ id: Nat; ban_author: Bool;}) : async Result<(), Text> {
    await* getModel().controller.banIntProp({ caller; id; ban_author; });
  };

  public shared({caller}) func unban_int_prop({ id: Nat; }) : async Result<(), Text> {
    await* getModel().controller.unbanIntProp({ caller; id; });
  };

  public query func is_banned_int_prop({ id: Nat; }) : async Bool {
    getModel().controller.isBannedIntProp({ id; });
  };

  public query func get_banned_int_props() : async [Nat] {
    getModel().controller.getBannedIntProps();
  };

  public shared({caller}) func ban_author({ author: Principal; }) : async Result<(), Text> {
    await* getModel().controller.banAuthor({ caller; author; });
  };

  public shared({caller}) func unban_author({ author: Principal; }) : async Result<(), Text> {
    getModel().controller.unbanAuthor({ caller; author; });
  };

  public query func is_banned_author({ author: Principal; }) : async Bool {
    getModel().controller.isBannedAuthor({ author; });
  };

  public query func get_banned_authors() : async [(Principal, User)] {
    getModel().controller.getBannedAuthors();
  };

  public query func get_admin() : async Principal {
    getModel().controller.getAdmin();
  };

  public shared({caller}) func set_admin({ admin: Principal; }) : async Result<(), Text> {
    getModel().controller.setAdmin({ caller; admin; });
  };

  public query func get_moderators() : async [Principal] {
    getModel().controller.getModerators();
  };

  public shared({caller}) func add_moderator({ moderator: Principal; }) : async Result<(), Text> {
    getModel().controller.addModerator({ caller; moderator; });
  };

  public shared({caller}) func remove_moderator({ moderator: Principal; }) : async Result<(), Text> {
    getModel().controller.removeModerator({ caller; moderator; });
  };

  public query({caller}) func get_user_notifications() : async [Notification] {
    getModel().controller.getUserNotifications(caller);
  };

  public shared({caller}) func mark_notification_as_read({ notificationId: Nat; }) : async() {
    getModel().controller.markNotificationAsRead(caller, notificationId);
  };

  public shared({caller}) func set_subscription(planId: Text) : async Result.Result<(), Text> {
    await* getModel().subscriptionManager.setSubscription(caller, planId);
  };

  public query({caller}) func get_subscription() : async Types.SSubscription {
    Share.subscription(getModel().subscriptionManager.getSubscription(caller));
  };

  public query func get_plans() : async [Types.Plan] {
    getModel().subscriptionManager.getPlans();
  };

  public query func get_subscription_subaccount() : async Blob {
    getModel().subscriptionManager.getSubscriptionSubaccount();
  };

  public query func get_ckusdt_usd_price() : async SCkUsdtRate {
    getModel().controller.getCkUsdtUsdPrice();
  };

  public shared({caller}) func get_exchange_rate(req : XRCTypes.GetExchangeRateRequest) : async XRCTypes.GetExchangeRateResult {
    // 5_000_000_000 cycles should be enough for one call
    if (not Principal.equal(caller, admin)) {
      Debug.trap("Only the admin can call this function");
    };
    Cycles.add<system>(5_000_000_000);
    await ExchangeRate.get_exchange_rate(req);
  };

  func getModel() : Model.Model {
    switch(model){
      case (null) { Debug.trap("The model is not initialized"); };
      case (?c) { c; };
    };
  };
  
  public type SupportedStandard = {
    url: Text;
    name: Text;
  };

  public query func icrc10_supported_standards() : async [SupportedStandard] {
    return [
      {
        url = "https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-10/ICRC-10.md";
        name = "ICRC-10";
      },
      {
        url = "https://github.com/dfinity/wg-identity-authentication/blob/main/topics/icrc_28_trusted_origins.md";
        name = "ICRC-28";
      }
    ];
  };

  public type Icrc28TrustedOriginsResponse = {
    trusted_origins: [Text];
  };

  public func icrc28_trusted_origins() : async Icrc28TrustedOriginsResponse {
    let trusted_origins = [
      "https://czzq6-byaaa-aaaap-akilq-cai.icp0.io",
      "https://czzq6-byaaa-aaaap-akilq-cai.raw.icp0.io",
      "https://czzq6-byaaa-aaaap-akilq-cai.ic0.app",
      "https://czzq6-byaaa-aaaap-akilq-cai.raw.ic0.app",
      "https://czzq6-byaaa-aaaap-akilq-cai.icp0.icp-api.io",
      "https://czzq6-byaaa-aaaap-akilq-cai.icp-api.io",
      "https://www.dapp.bipquantum.com",
      "https://dapp.bipquantum.com"
    ];
    return { trusted_origins; };
  };

  // ===== HTTP Request Types =====

  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    method: Text;
    url: Text;
    headers: [HeaderField];
    body: Blob;
  };

  public type HttpResponse = {
    status_code: Nat16;
    headers: [HeaderField];
    body: Blob;
    upgrade: ?Bool;
  };

  // ===== Stripe Webhook Handler =====

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

  public query func http_request(req: HttpRequest) : async HttpResponse {
    // Check if this is a webhook request
    if (req.url == "/stripe-webhook" or req.url == "/stripe-webhook/") {
      // Upgrade to update call for POST requests
      if (req.method == "POST") {
        return {
          status_code = 200;
          headers = [];
          body = Blob.fromArray([]);
          upgrade = ?true;
        };
      };
    };

    // Return 404 for other paths
    return {
      status_code = 404;
      headers = [("content-type", "text/plain")];
      body = Text.encodeUtf8("Not Found");
      upgrade = null;
    };
  };

  public func http_request_update(req: HttpRequest) : async HttpResponse {
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
    // Stripe webhook format: {"id":"evt_xxxxx","type":"checkout.session.completed",...}
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
        switch (await processStripeEvent(eventData)) {
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
  func verifyStripeEvent(eventId: Text) : async Result<Text, Text> {
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
  func processStripeEvent(eventData: Text) : async Result<(), Text> {
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
            Debug.print("Add mapping in main.mo mapPaymentLinkToPlanId()");
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
      switch (await* getModel().subscriptionManager.activateStripeSubscription(userPrincipal, metadataPlanId)) {
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

  // Text utilities (copied from ChatBot.mo)
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
