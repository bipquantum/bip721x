import IntPropTypes "intprop/Types";
import CurrentTypes "migrations/00-01-00-initial/Types";

import Result "mo:base/Result";

module {

  type Time = Int;

  type Result<Ok, Err> = Result.Result<Ok, Err>;

  public let BIP721X_TAG        = IntPropTypes.BIP721X_TAG;
  public type VersionnedIntProp = IntPropTypes.VersionnedIntProp;
  public type IntPropInput      = IntPropTypes.IntPropInput;
  public type IntProp           = IntPropTypes.IntProp;

  public type IntPropRegister = CurrentTypes.IntPropRegister;
  public type User            = CurrentTypes.User;
  public type ChatHistory     = CurrentTypes.ChatHistory;
  public type ChatHistories   = CurrentTypes.ChatHistories;
  public type Airdrop         = CurrentTypes.Airdrop;

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

};
