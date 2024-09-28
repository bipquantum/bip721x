import V1_Types "v1/Types";

module {

  public let BIP721X_TAG = "bip721x";

  public type VersionnedIntProp = {
    #V1: V1_Types.IntProp;
  };

  // Current
  public type IntProp      = V1_Types.IntProp;
  public type IntPropInput = V1_Types.IntPropInput;

};
