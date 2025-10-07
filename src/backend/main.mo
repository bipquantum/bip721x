import Types          "Types";
import Controller     "Controller";
import Conversions    "intprop/Conversions";
import ChatBot        "ChatBot";
import ChatBotHistory "ChatBotHistory";
import TradeManager   "TradeManager";
import MigrationTypes "migrations/Types";
import Migrations     "migrations/Migrations";

import BIP721Ledger  "canister:bip721_ledger";
import BQCLedger     "canister:bqc_ledger";

import Result        "mo:base/Result";
import Principal     "mo:base/Principal";
import Debug         "mo:base/Debug";
import Option        "mo:base/Option";
import Cycles        "mo:base/ExperimentalCycles";
import Time          "mo:base/Time";

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
  var _controller : ?Controller.Controller = null;

  // Unfortunately the principal of the canister cannot be used at the construction of the actor
  // because of the compiler error "cannot use self before self has been defined".
  // Therefore, one need to use an init method to initialize the controller.
  public shared({caller}) func init_controller() : async Result<(), Text> {

    if (not Principal.equal(caller, admin)) {
      return #err("Only the admin can initialize the controller");
    };

    if (Option.isSome(_controller)) {
      return #err("The controller is already initialized");
    };

    switch(_state){
      case(#v0_7_0(stableData)){
        _controller := ?Controller.Controller({
          stableData with
          chatBotHistory = ChatBotHistory.ChatBotHistory({
            chatHistories = stableData.chatHistories;
          });
          tradeManager = TradeManager.TradeManager({
            stage_account = { owner = Principal.fromActor(this); subaccount = null; };
            fee = stableData.e6sTransferFee;
          });
          chatBot = ChatBot.ChatBot({
            chatbot_api_key = stableData.chatbot_api_key; 
          });
        });
      };
      case(_) { Debug.trap("Unexpected state version: v0_7_0"); };
    };
    
    // Start the price update timer
    switch(_controller) {
      case(?controller) {
        ignore controller.startPriceUpdateTimer();
      };
      case(null) {
        Debug.trap("Controller is not initialized");
      };
    };
    
    #ok;
  };

  public shared({caller}) func set_user(user: CreateUserArgs): async Result<(), Text> {
    getController().setUser({ user with caller;} );
  };

  public query func get_user(principal: Principal): async ?User {
    getController().getUser(principal);
  };

  public query({caller}) func get_chat_histories() : async [ChatHistory] {
    getController().getChatHistories({ caller; });
  };

  public query({caller}) func get_chat_history({id: Text;}) : async Result<ChatHistory, Text> {
    getController().getChatHistory({ caller; id; });
  };

  public shared({caller}) func create_chat_history({id: Text; version: Text; name: Text;}) : async Result<(), Text> {
    getController().createChatHistory({ caller; id; version; name; date = Time.now(); });
  };

  public shared({caller}) func delete_chat_history({id: Text;}) : async Result<(), Text> {
    getController().deleteChatHistory({ caller; id; });
  };

  public shared({caller}) func update_chat_history({id: Text; events: Text; aiPrompts: Text}) : async Result<(), Text> {
    getController().updateChatHistory({ caller; id; events; aiPrompts; });
  };

  public shared({caller}) func rename_chat_history({id: Text; name: Text;}) : async Result<(), Text> {
    getController().renameChatHistory({ caller; id; name; });
  };

  public shared({caller}) func create_int_prop(args: IntPropInput) : async CreateIntPropResult {
    await getController().createIntProp({ args with author = caller; });
  };

  public shared({caller}) func list_int_prop({ token_id: Nat; e6s_usdt_price: Nat; }) : async Result<(), Text> {
    await* getController().listIntProp({ caller; id = token_id; e6sUsdtPrice = e6s_usdt_price; });
  };

  public shared({caller}) func unlist_int_prop({token_id: Nat;}) : async Result<(), Text> {
    await* getController().unlistIntProp({ caller; id = token_id; });
  };

  public composite query func get_int_props_of({owner: Principal; prev: ?Nat; take: ?Nat;}) : async [Nat] {
    await BIP721Ledger.icrc7_tokens_of({ owner; subaccount = null }, prev, take);
  };

  public query func get_listed_int_props({prev: ?Nat; take: ?Nat; direction: QueryDirection}) : async [Nat] {
    getController().getListedIntProps({ prev; take; direction; });
  };

  public composite query({caller}) func get_int_prop({token_id: Nat}) : async Result<FullIntProp, Text> {
    
    label check_authorized do {
      
      // Check if the caller is the owner of the token
      let accounts = await BIP721Ledger.icrc7_owner_of([token_id]);
      switch(getController().extractOwner(accounts)){
        case(null) {};
        case(?owner) {
          if (Principal.equal(owner, caller)) {
            break check_authorized;
          };
        };
      };

      // Check if the IP is listed
      if (getController().isListedIntProp(token_id)){
        break check_authorized;
      };

      return #err("You are not authorized to query this IP");
    };

    let metadata = await BIP721Ledger.icrc7_token_metadata([token_id]);

    // TODO sardariuss 2024-09-07: better error handling
    let intProp = Conversions.metadataToIntProp(metadata[0]);
    let author = switch(intProp){
      case(#V1(ip)) { getController().getUser(ip.author); };
    };

    // Add the author information
    #ok({ intProp; author; }); 
  };

  public composite query func owners_of({token_ids: [Nat]}) : async [?Principal] {
    let accounts = await BIP721Ledger.icrc7_owner_of(token_ids);
    getController().extractOwners(accounts);
  };

  public composite query func owner_of({token_id: Nat}) : async ?Principal {
    let accounts = await BIP721Ledger.icrc7_owner_of([token_id]);
    getController().extractOwner(accounts);
  };

  public query func get_e6s_price({token_id: Nat}) : async Result<Nat, Text> {
    getController().getE6sPrice({ id = token_id });
  };

  public shared({caller}) func buy_int_prop({token_id: Nat}) : async Result<(), Text> {
    await* getController().buyIntProp({ id = token_id; buyer = caller; });
  };

  public query func cycles_balance() : async Nat {
    Cycles.balance();
  };

  public shared func chatbot_completion({body: Blob}) : async ChatBot.HttpResponse {
    await* getController().chatbot_completion({body});
  };

  public query({caller}) func is_airdrop_available() : async Bool {
    getController().isAirdropAvailable(caller);
  };

  public query func get_number_of_users() : async Nat {
    getController().getNumberOfUsers();
  };

  public shared({caller}) func airdrop_user() : async Result<Nat, Text> {
    await getController().airdropUser(caller);
  };

  public query func get_airdrop_info(): async Types.SAirdropInfo {
    getController().getAirdropInfo();
  };

  public shared({caller}) func set_airdrop_per_user({ amount : Nat; }) : async Result<(), Text> {
    if (caller != admin) {
      return #err("Only the admin can call this function!");
    };
    getController().setAirdropPerUser({amount});
    #ok;
  };

  public shared({caller}) func ban_int_prop({ id: Nat; ban_author: Bool;}) : async Result<(), Text> {
    await* getController().banIntProp({ caller; id; ban_author; });
  };

  public shared({caller}) func unban_int_prop({ id: Nat; }) : async Result<(), Text> {
    await* getController().unbanIntProp({ caller; id; });
  };

  public query func is_banned_int_prop({ id: Nat; }) : async Bool {
    getController().isBannedIntProp({ id; });
  };

  public query func get_banned_int_props() : async [Nat] {
    getController().getBannedIntProps();
  };

  public shared({caller}) func ban_author({ author: Principal; }) : async Result<(), Text> {
    await* getController().banAuthor({ caller; author; });
  };

  public shared({caller}) func unban_author({ author: Principal; }) : async Result<(), Text> {
    getController().unbanAuthor({ caller; author; });
  };

  public query func is_banned_author({ author: Principal; }) : async Bool {
    getController().isBannedAuthor({ author; });
  };

  public query func get_banned_authors() : async [(Principal, User)] {
    getController().getBannedAuthors();
  };

  public query func get_admin() : async Principal {
    getController().getAdmin();
  };

  public shared({caller}) func set_admin({ admin: Principal; }) : async Result<(), Text> {
    getController().setAdmin({ caller; admin; });
  };

  public query func get_moderators() : async [Principal] {
    getController().getModerators();
  };

  public shared({caller}) func add_moderator({ moderator: Principal; }) : async Result<(), Text> {
    getController().addModerator({ caller; moderator; });
  };

  public shared({caller}) func remove_moderator({ moderator: Principal; }) : async Result<(), Text> {
    getController().removeModerator({ caller; moderator; });
  };

  public query({caller}) func get_user_notifications() : async [Notification] {
    getController().getUserNotifications(caller);
  };

  public shared({caller}) func mark_notification_as_read({ notificationId: Nat; }) : async() {
    getController().markNotificationAsRead(caller, notificationId);
  };

  public query func get_ckusdt_usd_price() : async SCkUsdtRate {
    getController().getCkUsdtUsdPrice();
  };

  func getController() : Controller.Controller {
    switch(_controller){
      case (null) { Debug.trap("The controller is not initialized"); };
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
  
};
