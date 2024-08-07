import Result     "mo:base/Result";
import Map        "mo:map/Map";
import Principal  "mo:base/Principal";
import Time       "mo:base/Time";

import Types      "Types";
import Controller "Controller";

shared({ caller = admin; }) actor class Backend() = this {

  type UserArgs            = Types.UserArgs;
  type User                = Types.User;
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

  let _controller = Controller.Controller(_data);

  public shared({caller}) func set_user(args: UserArgs): async Result<(), Text> {
    _controller.setUser({ args with caller;} );
  };

  public query func get_user(principal: Principal): async ?User {
    _controller.getUser(principal);
  };

  public shared({caller}) func create_int_prop(args: IntPropArgs) : async CreateIntPropResult {
    await _controller.createIntProp({ args with caller; time = Time.now(); });
  };

  public shared func get_int_props({owner: Principal; prev: ?Nat; take: ?Nat}) : async Result<[(Nat, IntProp)], Text> {
    await _controller.getIntProps({ owner; prev; take; });
  };

  public shared({caller}) func buy_int_prop({token_id: Nat}) : async Result<BuyIntPropResult, Text> {
    await _controller.buyIntProp({ token_id; buyer = caller; time = Time.now(); });
  };
  
};
