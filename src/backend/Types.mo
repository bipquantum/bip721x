import Map "mo:map/Map";

module {

  type Time = Int;

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

  public type IntProp = {
    title: Text;
    description: Text;
    intPropType: IntPropType;
    intPropLicense: IntPropLicense;
  };

  public type IntPropArgs = IntProp and {
    e8sIcpPrice: Nat;
  };

  public type IntPropRegister = {
    var index: Nat;
    e8sIcpPrices: Map.Map<Nat, Nat>;
  };
  
  public type UserArgs = {
    firstName: Text;
    lastName: Text;
    nickName: Text;
    speciality: Text;
    country: Text;
  };

  type Account = {
    owner: Principal;
    subaccount: ?Blob;
  };

  public type User = UserArgs and {
    account: Account;
  };

  public type UserRegister = {
    var index: Nat;
    mapUsers: Map.Map<Principal, User>;
  };

};
