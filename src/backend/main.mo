import Result        "mo:base/Result";
import Map           "mo:map/Map";
import Principal     "mo:base/Principal";
import Time          "mo:base/Time";
import Debug         "mo:base/Debug";
import Option        "mo:base/Option";

import Types         "Types";
import Controller    "Controller";
import Conversions   "utils/Conversions";

import Icrc7Canister "canister:icrc7";


shared({ caller = admin; }) actor class Backend() = this {

  type UserArgs              = Types.UserArgs;
  type User                  = Types.User;
  type Account               = Types.Account;
  type IntPropInputWithPrice = Types.IntPropInputWithPrice;
  type IntProp               = Types.IntProp;
  type Result<Ok, Err>       = Result.Result<Ok, Err>;
  type CreateIntPropResult   = Types.CreateIntPropResult;
  type BuyIntPropResult      = Types.BuyIntPropResult;

  stable var _data = {
    users = {
      // TODO sardariuss 2024-08-07: careful, if the backend canister is ever
      // reinstalled, this canister will attempt to mint already minted tokens
      // because index would be reset to 0
      var index = 0;
      mapUsers = Map.new<Principal, User>();
      subaccToPrincipal = Map.new<Blob, Principal>();
    };
    intProps = {
      var index = 0;
      e8sIcpPrices = Map.new<Nat, Nat>();
    };
  };

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
    
    _controller := ?Controller.Controller({ _data with backend_id = Principal.fromActor(this) });
    
    #ok();
  };

  public shared({caller}) func set_user(args: UserArgs): async Result<(), Text> {
    getController().setUser({ args with caller;} );
  };

  public query func get_user(principal: Principal): async ?User {
    getController().getUser(principal);
  };

  public shared({caller}) func create_int_prop(args: IntPropInputWithPrice) : async CreateIntPropResult {
    await getController().createIntProp({ args with author = caller; publishingDate = Time.now(); });
  };

  public composite query func get_int_props_of({owner: Principal; prev: ?Nat; take: ?Nat}) : async Result<[(Nat, IntProp)], Text> {
    let tokenIds = await Icrc7Canister.icrc7_tokens_of(getController().getUserAccount(owner), prev, take);
    Conversions.getIntProps(tokenIds, await Icrc7Canister.icrc7_token_metadata(tokenIds));
  };

  public composite query func get_int_props({prev: ?Nat; take: ?Nat}) : async Result<[(Nat, IntProp)], Text> {
    let tokenIds = await Icrc7Canister.icrc7_tokens(prev, take);
    Conversions.getIntProps(tokenIds, await Icrc7Canister.icrc7_token_metadata(tokenIds));
  };

  public composite query func owners_of({token_ids: [Nat]}) : async [?(Principal, User)] {
    let accounts = await Icrc7Canister.icrc7_owner_of(token_ids);
    getController().accountsToOwners(accounts);
  };

  public query func get_e8s_price({token_id: Nat}) : async Result<Nat, Text> {
    getController().getE8sPrice({token_id});
  };

  public shared({caller}) func buy_int_prop({token_id: Nat}) : async Result<BuyIntPropResult, Text> {
    await getController().buyIntProp({ token_id; buyer = caller; time = Time.now(); });
  };

  public query func get_user_account({user: Principal}) : async Account {
    getController().getUserAccount(user);
  };

  func getController() : Controller.Controller {
    switch(_controller){
      case (null) { Debug.trap("The controller is not initialized"); };
      case (?c) { c; };
    };
  };
  
};
