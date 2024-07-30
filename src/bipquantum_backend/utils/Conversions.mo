import Types "../Types";

module {

  public func intPropTypeToNat(intPropType: Types.IntPropType) : Nat {
    switch (intPropType) {
    case(#COPYRIGHT)             { 0; };
    case(#PATENT)                { 1; };
    case(#IP_CERTIFICATE)        { 2; };
    };
  };

  public func intPropLicenseToNat(intPropLicense: Types.IntPropLicense) : Nat {
    switch (intPropLicense) {
    case(#SAAS)                  { 0; };
    case(#REPRODUCTION)          { 1; };
    case(#GAAME_FI)              { 2; };
    case(#META_USE)              { 3; };
    case(#PHYSICAL_REPRODUCTION) { 4; };
    case(#ADVERTISEMENT)         { 5; };
    case(#NOT_APPLICABLE)        { 6; };
    };
  };

}