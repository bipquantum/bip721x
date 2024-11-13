import IntPropTypes "intprop/Types";
import Types "migrations/Types";

import Result "mo:base/Result";

module {

  type Time = Int;

  type Result<Ok, Err> = Result.Result<Ok, Err>;

  public let BIP721X_TAG        = IntPropTypes.BIP721X_TAG;
  public type VersionnedIntProp = IntPropTypes.VersionnedIntProp;
  public type IntPropInput      = IntPropTypes.IntPropInput;
  public type IntProp           = IntPropTypes.IntProp;

  public type IntPropRegister = Types.Current.IntPropRegister;
  public type User            = Types.Current.User;
  public type ChatHistory     = Types.Current.ChatHistory;
  public type ChatHistories   = Types.Current.ChatHistories;
  public type Airdrop         = Types.Current.Airdrop;
  public type AccessControl   = Types.Current.AccessControl;

  public type SAirdropInfo = {
    allowed_per_user: Nat;
    total_distributed: Nat;
    map_distributed: [(Principal, Nat)];
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

};
