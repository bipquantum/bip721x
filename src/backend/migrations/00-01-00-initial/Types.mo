import Map "mo:map/Map";
import Nat "mo:base/Nat";

module {

  public type IntPropRegister = {
    var index: Nat;
    e8sIcpPrices: Map.Map<Nat, Nat>;
  };

  public type User = {
    firstName: Text;
    lastName: Text;
    nickName: Text;
    specialty: Text;
    country: Text;
  };

  public type UserRegister = {
    var index: Nat;
    mapUsers: Map.Map<Principal, User>;
  };

  public type State = {
    users: {
      var index: Nat;
      mapUsers: Map.Map<Principal, User>;
    };
    intProps: {
      var index: Nat;
      e8sIcpPrices: Map.Map<Nat, Nat>;
    };
    e8sTransferFee: Nat;
  };

  public type Args = {
    #init: InitArgs;
    #upgrade: UpgradeArgs;
    #downgrade: DowngradeArgs;
    #none;
  };

  public type InitArgs = { e8sTransferFee: Nat; };
  public type UpgradeArgs = {};
  public type DowngradeArgs = {};

};