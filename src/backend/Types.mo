import IntPropTypes "intprop/Types";
import Types "migrations/Types";

import Result "mo:base/Result";

module {

  type Time = Int;

  type Result<Ok, Err> = Result.Result<Ok, Err>;

  public let BIP721X_TAG           = IntPropTypes.BIP721X_TAG;
  public type VersionnedIntProp    = IntPropTypes.VersionnedIntProp;
  public type IntPropInput         = IntPropTypes.IntPropInput;
  public type IntProp              = IntPropTypes.IntProp;

  public type IntPropRegister      = Types.Current.IntPropRegister;
  public type User                 = Types.Current.User;
  public type ChatHistory          = Types.Current.ChatHistory;
  public type ChatHistories        = Types.Current.ChatHistories;
  public type Airdrop              = Types.Current.Airdrop;
  public type AccessControl        = Types.Current.AccessControl;
  public type Notification         = Types.Current.Notification;
  public type NotificationType     = Types.Current.NotificationType;
  public type NotificationState    = Types.Current.NotificationState;
  public type Notifications        = Types.Current.Notifications;
  public type CkUsdtRate           = Types.Current.CkUsdtRate;
  public type RenewalInterval      = Types.Current.RenewalInterval;
  public type Plan                 = Types.Current.Plan;
  public type Plans                = Types.Current.Plans;
  public type Subscription         = Types.Current.Subscription;
  public type SubscriptionState    = Types.Current.SubscriptionState;
  public type PaymentMethod        = Types.Current.PaymentMethod;
  public type SubscriptionRegister = Types.Current.SubscriptionRegister;
  public type State                = Types.Current.State;

  public type FullIntProp = {
    intProp: VersionnedIntProp;
    author: ?Text;
  };

  public type CreateUserArgs = {
    firstName: Text;
    lastName: Text;
    nickName: Text;
    specialty: Text;
    countryCode: Text;
    imageUri: Text;
  };

  public type SAirdropInfo = {
    allowed_per_user: Nat;
    total_distributed: Nat;
    map_distributed: [(Principal, Nat)];
  };
  
  public type SSubscription = {
    availableCredits: Nat;
    totalCreditsUsed: Nat;
    planId: Text;
    state: SubscriptionState;
    startDate: Int;
    nextRenewalDate: Int;
    expiryDate: ?Int;
    paymentMethod: PaymentMethod;
  };

  public type SCkUsdtRate = {
    usd_price: Nat64;
    decimals: Nat32;
    last_update: Int;
  };

  public type Account = {
    owner: Principal;
    subaccount: ?Blob;
  };

  public type CreateIntPropResultError = {
    // Specific to Bip721X
    #NotAuthorized;
    #MintError;
    // From ICRC7
    #NonExistingTokenId;
    #TokenExists;
    #GenericError : { error_code : Nat; message : Text };
    #TooOld;
    #CreatedInFuture : { ledger_time: Nat64 };
  };

  public type CreateIntPropResult = Result<Nat, CreateIntPropResultError>;

  public type QueryDirection = {
    #FORWARD;
    #BACKWARD;
  };

  // HTTP types (used by Stripe webhook handling)
  public type HeaderField = (Text, Text);

  public type HttpRequest = {
    method: Text;
    url: Text;
    headers: [HeaderField];
    body: Blob;
  };

  public type HttpResponse = {
    status_code: Nat16;
    headers: [HeaderField];
    body: Blob;
    upgrade: ?Bool;
  };

};
