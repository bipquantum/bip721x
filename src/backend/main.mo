import Types          "Types";
import Controller     "Controller";
import Conversions    "intprop/Conversions";
import ChatBot        "ChatBot";
import ChatBotHistory "ChatBotHistory";
import TradeManager   "TradeManager";
import MigrationTypes "migrations/Types";
import Migrations     "migrations/Migrations";

import BIP721Ledger  "canister:bip721_ledger";

import Result        "mo:base/Result";
import Principal     "mo:base/Principal";
import Debug         "mo:base/Debug";
import Option        "mo:base/Option";
import Cycles        "mo:base/ExperimentalCycles";
import Time          "mo:base/Time";


shared({ caller = admin; }) actor class Backend(args: MigrationTypes.Args) = this {

  type User                  = Types.User;
  type Account               = Types.Account;
  type ChatHistory           = Types.ChatHistory;
  type IntPropInput          = Types.IntPropInput;
  type VersionnedIntProp     = Types.VersionnedIntProp;
  type Result<Ok, Err>       = Result.Result<Ok, Err>;
  type CreateIntPropResult   = Types.CreateIntPropResult;

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
      case(#v0_2_0(stableData)){
        _controller := ?Controller.Controller({
          stableData with
          chatBotHistory = ChatBotHistory.ChatBotHistory({
            chatHistories = stableData.chatHistories;
          });
          tradeManager = TradeManager.TradeManager({
            stage_account = { owner = Principal.fromActor(this); subaccount = null; };
            fee = stableData.e8sTransferFee;
          });
        });
      };
      case(_) { Debug.trap("Unexpected state version: v0_2_0 expected"); };
    };
    
    #ok;
  };

  public shared({caller}) func set_user(user: User): async Result<(), Text> {
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

  public shared({caller}) func list_int_prop({ token_id: Nat; e8s_icp_price: Nat; }) : async Result<(), Text> {
    await* getController().listIntProp({ caller; id = token_id; e8sIcpPrice = e8s_icp_price; });
  };

  public shared({caller}) func unlist_int_prop({token_id: Nat;}) : async Result<(), Text> {
    await* getController().unlistIntProp({ caller; id = token_id; });
  };

  public composite query func get_int_props_of({owner: Principal; prev: ?Nat; take: ?Nat;}) : async [Nat] {
    await BIP721Ledger.icrc7_tokens_of({ owner; subaccount = null }, prev, take);
  };

  public query func get_listed_int_props({prev: ?Nat; take: ?Nat}) : async [Nat] {
    getController().getListedIntProps({ prev; take; });
  };

  public composite query func get_int_prop({token_id: Nat}) : async Result<VersionnedIntProp, Text> {
    let metadata = await BIP721Ledger.icrc7_token_metadata([token_id]);
    #ok(Conversions.metadataToIntProp(metadata[0])); // TODO sardariuss 2024-09-07: better error handling
  };

  public composite query func owners_of({token_ids: [Nat]}) : async [?Principal] {
    let accounts = await BIP721Ledger.icrc7_owner_of(token_ids);
    getController().extractOwners(accounts);
  };

  public composite query func owner_of({token_id: Nat}) : async ?Principal {
    let accounts = await BIP721Ledger.icrc7_owner_of([token_id]);
    getController().extractOwner(accounts);
  };

  public query func get_e8s_price({token_id: Nat}) : async Result<Nat, Text> {
    getController().getE8sPrice({ id = token_id });
  };

  public shared({caller}) func buy_int_prop({token_id: Nat}) : async Result<(), Text> {
    await* getController().buyIntProp({ id = token_id; buyer = caller; });
  };

  public query func cycles_balance() : async Nat {
    Cycles.balance();
  };

  public shared func chatbot_completion({body: Blob}) : async ChatBot.HttpResponse {
    await ChatBot.get_completion(body);
  };

  public query({caller}) func is_airdrop_available() : async Bool {
    getController().isAirdropAvailable(caller);
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

  public shared({caller}) func tag_sensitive_int_prop({ id: Nat; sensitive: Bool;}) : async Result<(), Text> {
    getController().tagSensitiveIntProp({ caller; id; sensitive; });
  };

  public query func is_sensitive_int_prop({ id: Nat; }) : async Bool {
    getController().isSensitiveIntProp({ id; });
  };

  public query func get_sensitive_int_props() : async [Nat] {
    getController().getSensitiveIntProps();
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

  func getController() : Controller.Controller {
    switch(_controller){
      case (null) { Debug.trap("The controller is not initialized"); };
      case (?c) { c; };
    };
  };
  
};
