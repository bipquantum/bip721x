import Map "mo:map/Map";
import Set "mo:map/Set";
import Nat "mo:base/Nat";

module {

  type Time = Int;

  public type IntPropRegister = {
    var index: Nat;
    e8sIcpPrices: Map.Map<Nat, Nat>;
  };

  public type User = {
    firstName: Text;
    lastName: Text;
    nickName: Text;
    specialty: Text;
    countryCode: Text;
  };

  public type AiPrompt = {
    question: Text;
    answer: Text;
  };

  public type ChatHistory = {
    id: Text;
    date: Time;
    events: Text;
    aiPrompts: Text;
  };

  public type ChatHistories = {
    histories: Map.Map<Text, ChatHistory>;
    byPrincipal: Map.Map<Principal, Set.Set<Text>>;
  };

  public type State = {
    users: Map.Map<Principal, User>;
    intProps: {
      var index: Nat;
      e8sIcpPrices: Map.Map<Nat, Nat>;
    };
    chatHistories: ChatHistories;
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