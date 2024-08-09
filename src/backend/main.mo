import Result     "mo:base/Result";
import Map        "mo:map/Map";
import Principal  "mo:base/Principal";
import Time       "mo:base/Time";
import Debug      "mo:base/Debug";
import Option     "mo:base/Option";

import Types      "Types";
import Controller "Controller";

shared({ caller = admin; }) actor class Backend() = this {

  type UserArgs            = Types.UserArgs;
  type User                = Types.User;
  type Account             = Types.Account;
  type IntPropArgs         = Types.IntPropArgs;
  type IntProp             = Types.IntProp;
  type Result<Ok, Err>     = Result.Result<Ok, Err>;
  type CreateIntPropResult = Types.CreateIntPropResult;
  type BuyIntPropResult    = Types.BuyIntPropResult;

  stable var _data = {
    users = {
      // TODO sardariuss 2024-08-07: careful, if the backend canister is ever
      // reinstalled, this canister will attempt to mint already minted tokens
      // because index would be reset to 0
      var index = 0;
      mapUsers = Map.new<Principal, User>();
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

  public shared({caller}) func create_int_prop(args: IntPropArgs) : async CreateIntPropResult {
    await getController().createIntProp({ args with caller; time = Time.now(); });
  };

  public shared func get_int_props({owner: Principal; prev: ?Nat; take: ?Nat}) : async Result<[(Nat, IntProp)], Text> {
    await getController().getIntProps({ owner; prev; take; });
  };

  public shared({caller}) func buy_int_prop({token_id: Nat}) : async Result<BuyIntPropResult, Text> {
    await getController().buyIntProp({ token_id; buyer = caller; time = Time.now(); });
  };

  public query func get_user_account({user: Principal}) : async Account {
    getController().GetUserAccount(user);
  };

  func getController() : Controller.Controller {
    switch(_controller){
      case (null) { Debug.trap("The controller is not initialized"); };
      case (?c) { c; };
    };
  };
  
};
