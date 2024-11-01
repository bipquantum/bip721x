
module {

  type Time = Int;

  public let BIP721X_TAG = "bip721x";

  public type IntPropType = {
    #COPYRIGHT;
    #PRE_PATENT;
    #TRADEMARK;
    #TRADE_SECRET;
    #INDUSTRIAL_DESIGN_RIGHTS;
    #GEOGRAPHICAL_INDICATIONS;
    #PLANT_VARIETY;
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

  public type PublishingInfo = {
    date: Time;
    countryCode: Text;
  };

  public type IntPropInput = {
    title: Text;
    description: Text;
    intPropType: IntPropType;
    intPropLicenses: [IntPropLicense];
    creationDate: Time;
    publishing: ?PublishingInfo;
    dataUri: Text;
    percentageRoyalties: ?Nat;
  };

  public type IntProp = IntPropInput and {
    author: Principal;
  };

};
