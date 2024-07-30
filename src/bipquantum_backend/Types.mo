import Map "mo:map/Map";
import Principal "mo:base/Principal";

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
    #GAAME_FI;
    #META_USE;
    #PHYSICAL_REPRODUCTION;
    #ADVERTISEMENT;
    #NOT_APPLICABLE;
  };

  public type IntPropArgs = {
    title: Text;
    description: Text;
    intPropType: IntPropType;
    intPropLicense: IntPropLicense;
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

  public type User = {
    firstName: Text;
    lastName: Text;
    nickName: Text;
    speciality: Text;
    country: Text;
    account: {
      owner: Principal;
      subaccount: ?Blob;
    };
  };

  public type UserRegister = {
    var index: Nat;
    mapUsers: Map.Map<Principal, User>;
  };

};
