import Result     "mo:base/Result";
import Map        "mo:map/Map";
import Principal  "mo:base/Principal";
import Debug      "mo:base/Debug";
import Option     "mo:base/Option";
import Time       "mo:base/Time";

import Types      "Types";
import Controller "Controller";

import ICRC7      "mo:icrc7-mo";

shared({ caller = admin; }) actor class Backend() = this {

  type UserArgs        = Types.UserArgs;
  type User            = Types.User;
  type IntPropArgs     = Types.IntPropArgs;
  type Result<Ok, Err> = Result.Result<Ok, Err>;

  stable var _data = {
    users = {
      var index = 0;
      mapUsers = Map.new<Principal, User>();
    };
    intProps = {
      var index = 0;
      e8sIcpPrices = Map.new<Nat, Nat>();
    };
  };

  var _controller : ?Controller.Controller = null; 

  public shared({caller}) func init_controller() : async () {

    if (not Principal.equal(caller, admin)) {
      Debug.trap("Only the admin can initialize the facade");
    };

    if (Option.isSome(_controller)) {
      Debug.trap("The facade is already initialized");
    };
    
    _controller := ?Controller.Controller({_data with owner = Principal.fromActor(this);});
  };

  public shared({caller}) func set_user(args: UserArgs): async Result<(), Text> {
    getController().setUser({ args with caller;} );
  };

  public query func get_user(principal: Principal): async ?User {
    getController().getUser(principal);
  };

  public shared({caller}) func create_int_prop(args: IntPropArgs) : async Result<[ICRC7.SetNFTResult], Text> {
    await getController().createIntProp({ args with caller; time = Time.now(); });
  };

  public shared func get_int_props({principal: Principal; prev: ?Nat; take: ?Nat}) : async [Types.IntProp] {
    await getController().getIntProps({ principal; prev; take; });
  };

  func getController() : Controller.Controller {
    switch(_controller){
      case(?ctrl) { ctrl; };
      case(null) { Debug.trap("Controller not initialized"); };
    };
  };
  
};
