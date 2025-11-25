import Types          "Types";
import Model          "Model";
import XRCTypes       "XRCTypes";
import Share          "Share";
import Conversions    "intprop/Conversions";
import MigrationTypes "migrations/Types";
import Migrations     "migrations/Migrations";

import BIP721Ledger  "canister:bip721_ledger";
import ExchangeRate  "canister:exchange_rate";

import Result        "mo:base/Result";
import Principal     "mo:base/Principal";
import Debug         "mo:base/Debug";
import Option        "mo:base/Option";
import Cycles        "mo:base/ExperimentalCycles";
import Time          "mo:base/Time";
import Blob          "mo:base/Blob";
import Text          "mo:base/Text";

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
  type HttpRequest           = Types.HttpRequest;
  type HttpResponse          = Types.HttpResponse;
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
      case(#v0_9_0(state)){
        let builtModel = Model.build({
          state;
          backendId = Principal.fromActor(this);
        });
        ignore builtModel.controller.startTimer();
        model := ?builtModel;
      };
      case(_) { Debug.trap("Unexpected state version: v0_9_0"); };
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
    // Public function assumes payment method is CK_USDT
    await* getModel().subscriptionManager.setSubscription(caller, planId, #Ckusdt);
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

  public query func http_request(req: HttpRequest) : async HttpResponse {
    getModel().subscriptionManager.handleHttpRequest(req);
  };

  public func http_request_update(req: HttpRequest) : async HttpResponse {
    await getModel().subscriptionManager.handleStripeWebhook(req);
  };

};
