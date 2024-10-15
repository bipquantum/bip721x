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
    chatHistories: Map.Map<Principal, ChatHistories>;
  };

  public type ChatHistories = {
    var index: Nat;
    byIndex: Map.Map<Nat, ChatHistory>;
  };

  public type ChatHistory = {
    id: Nat;
    history: Text;
  };

  public type State = {
    users: UserRegister;
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