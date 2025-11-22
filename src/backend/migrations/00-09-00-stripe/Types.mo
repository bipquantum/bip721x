import Map "mo:map/Map";
import Set "mo:map/Set";
import Nat "mo:base/Nat";

module {

  type Time = Int;

  public type IntPropRegister = {
    var index: Nat;
    e6sUsdtPrices: Map.Map<Nat, Nat>;
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

  public type CkUsdtRate = {
    var usd_price: Nat64;
    var decimals: Nat32;
    var last_update: Int;
  };

  public type RenewalInterval = {
    #Days: Nat;
    #Months: Nat;
  };

  public type Plan = {
    id: Text;
    name: Text;
    intervalCredits: Nat;
    renewalPriceUsdtE6s: Nat;
    renewalInterval: RenewalInterval;
    numberInterval: ?Nat;
    stripePaymentLink: ?Text; // null for free plans
  };

  public type SubscriptionState = {
    #Active;
    #PastDue: Int;
  };

  public type Subscription = {
    var availableCredits: Nat;
    var totalCreditsUsed: Nat;
    var planId: Text;
    var state: SubscriptionState;
    var startDate: Int;
    var nextRenewalDate: Int;
    var expiryDate: ?Int;
  };

  public type Plans = {
    plans: Map.Map<Text, Plan>;
    var freePlanId: Text; // ID of the default free plan
  };

  public type SubscriptionRegister = {
    subscriptions: Map.Map<Principal, Subscription>;
    plans: Plans;
    var gracePeriodsDays: Nat;
    subaccount: Text;
  };

  public type State = {
    users: Map.Map<Principal, User>;
    airdrop: Airdrop;
    intProps: {
      var index: Nat;
      e6sUsdtPrices: Map.Map<Nat, Nat>;
    };
    chatHistories: ChatHistories;
    e6sTransferFee: Nat;
    accessControl: AccessControl;
    chatbot_api_key: Text;
    notifications: Notifications;
    ckusdtRate: CkUsdtRate;
    subscription_register: SubscriptionRegister;
    stripe_secret_key: Text;
  };

  public type Args = {
    #init: InitArgs;
    #upgrade: UpgradeArgs;
    #downgrade: DowngradeArgs;
    #none;
  };

  public type StripePaymentLinkMapping = {
    planId: Text;
    stripePaymentLink: Text;
  };

  public type InitArgs = {
    airdrop_per_user: Nat;
    admin: Principal;
    chatbot_api_key: Text;
    ckusdt_rate: {
      usd_price: Nat64;
      decimals: Nat32;
    };
    ckusdt_transfer_fee: Nat;
    subscriptions: {
      plans: [Plan];
      free_plan_id: Text;
      grace_period_days: Nat;
      subaccount: Text;
    };
    stripe_secret_key: Text;
  };

  public type UpgradeArgs = {
    stripe_secret_key: Text;
    stripe_payment_links: [StripePaymentLinkMapping];
  };

  public type DowngradeArgs = {
  };

};