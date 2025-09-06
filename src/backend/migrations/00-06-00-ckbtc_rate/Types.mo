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
    imageUri: Text;
    banned: Bool;
  };

  public type AiPrompt = {
    question: Text;
    answer: Text;
  };

  public type ChatHistory = {
    id: Text;
    date: Time;
    name: Text;
    version: Text;
    events: Text;
    aiPrompts: Text;
  };

  public type ChatHistories = {
    histories: Map.Map<Text, ChatHistory>;
    byPrincipal: Map.Map<Principal, Set.Set<Text>>;
  };

  public type NotificationState = {
    #UNREAD;
    #READ;
  };

  public type NotificationType = {
    #IP_PURCHASED : { ipId : Nat; buyer : Principal; price : Nat };
    #ROYALTY_RECEIVED : { ipId : Nat; amount : Nat; fromSale : Principal };
  };

  public type Notification = {
    id : Nat;
    notificationType : NotificationType;
    state : NotificationState;
    timestamp : Int;
    recipient : Principal;
  };

  public type Notifications = {
    var nextId: Nat;
    byPrincipal: Map.Map<Principal, [Notification]>;
  };

  public type Airdrop = {
    var allowed_per_user: Nat;
    var total_distributed: Nat;
    map_distributed: Map.Map<Principal, Nat>;
  };

  public type AccessControl = {
    var admin: Principal;
    moderators: Set.Set<Principal>;
    bannedIps: Set.Set<Nat>;
  };

  public type CkbtcRate = {
    var usd_price: Nat64;
    var last_update: Int;
  };

  public type State = {
    users: Map.Map<Principal, User>;
    airdrop: Airdrop;
    intProps: {
      var index: Nat;
      e8sIcpPrices: Map.Map<Nat, Nat>;
    };
    chatHistories: ChatHistories;
    e8sTransferFee: Nat;
    accessControl: AccessControl;
    chatbot_api_key: Text;
    notifications: Notifications;
    ckbtcRate: CkbtcRate;
  };

  public type Args = {
    #init: InitArgs;
    #upgrade: UpgradeArgs;
    #downgrade: DowngradeArgs;
    #none;
  };

  public type InitArgs = { e8sTransferFee: Nat; airdrop_per_user: Nat; admin: Principal; chatbot_api_key: Text; ckbtc_usd_price: Nat64; };
  public type UpgradeArgs = { ckbtc_usd_price: Nat64; };
  public type DowngradeArgs = {};

};