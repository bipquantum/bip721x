import Map "mo:map/Map";

import Result "mo:base/Result";

module {

  type Time = Int;

  type Result<Ok, Err> = Result.Result<Ok, Err>;

  public let BIP721X_TAG = "bip721x";

  public type IntPropType = {
    #COPYRIGHT;
    #PATENT;
    #IP_CERTIFICATE;
  };

  public type IntPropLicense = {
    #SAAS;
    #REPRODUCTION;
    #GAME_FI;
    #META_USE;
    #PHYSICAL_REPRODUCTION;
    #ADVERTISEMENT;
    #NOT_APPLICABLE;
  };

  public type IntPropInput = {
    title: Text;
    description: Text;
    intPropType: IntPropType;
    intPropLicense: IntPropLicense;
    creationDate: Time;
    publishingDate: ?Time;
    dataUri: Text;
  };

  public type IntProp = IntPropInput and {
    author: Principal;
  };

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

  public type Account = {
    owner: Principal;
    subaccount: ?Blob;
  };

  public type UserRegister = {
    var index: Nat;
    mapUsers: Map.Map<Principal, User>;
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

  public type BuyIntPropResult = {
    icp_transfer: Result<Nat, Text>;
    ip_transfer: ?Result<Nat, Text>;
  };

};
