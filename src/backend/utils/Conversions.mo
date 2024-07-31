import Debug "mo:base/Debug";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

import ICRC7 "mo:icrc7-mo";

import Types "../Types";

module {

  let BIP721X_TAG = "bip721x";

  type IntPropType = Types.IntPropType;
  type IntPropLicense = Types.IntPropLicense;
  type IntProp = Types.IntProp;

  public func intPropTypeToNat(intPropType: IntPropType) : Nat {
    switch (intPropType) {
      case(#COPYRIGHT)             { 0; };
      case(#PATENT)                { 1; };
      case(#IP_CERTIFICATE)        { 2; };
    };
  };

  public func intPropLicenseToNat(intPropLicense: IntPropLicense) : Nat {
    switch (intPropLicense) {
      case(#SAAS)                  { 0; };
      case(#REPRODUCTION)          { 1; };
      case(#GAME_FI)               { 2; };
      case(#META_USE)              { 3; };
      case(#PHYSICAL_REPRODUCTION) { 4; };
      case(#ADVERTISEMENT)         { 5; };
      case(#NOT_APPLICABLE)        { 6; };
    };
  };

  public func intPropTypeFromValue(value: Nat) : IntPropType {
    switch (value) {
      case(0) { #COPYRIGHT; };
      case(1) { #PATENT; };
      case(2) { #IP_CERTIFICATE; };
      case(_) { Debug.trap("Invalid intPropType value"); };
    };
  };

  public func intPropLicenseFromValue(value: Nat) : IntPropLicense {
    switch (value) {
      case(0) { #SAAS; };
      case(1) { #REPRODUCTION; };
      case(2) { #GAME_FI; };
      case(3) { #META_USE; };
      case(4) { #PHYSICAL_REPRODUCTION; };
      case(5) { #ADVERTISEMENT; };
      case(6) { #NOT_APPLICABLE; };
      case(_) { Debug.trap("Invalid intPropLicense value"); };
    };
  };

  public func unwrapText(value: ICRC7.Value) : Text {
    switch (value) {
      case(#Text(text)) { text; };
      case(_) { Debug.trap("Unexpected value"); };
    };
  };

  public func unwrapNat(value: ICRC7.Value) : Nat {
    switch (value) {
      case(#Nat(nat)) { nat; };
      case(_) { Debug.trap("Unexpected value"); };
    };
  };

  public func intPropToValue(intProp: IntProp) : ICRC7.Value {
    #Map([
      ("title",           #Text(intProp.title)),
      ("description",     #Text(intProp.description)),
      ("intPropType",     #Nat(intPropTypeToNat(intProp.intPropType))),
      ("intPropLicense",  #Nat(intPropLicenseToNat(intProp.intPropLicense))),
    ]);
  };

  public func intPropToInputMetadata(intProp: IntProp) : ICRC7.NFTInput {
    #Class([{
      name = BIP721X_TAG;
      immutable = true;
      value = intPropToValue(intProp);
    }]);
  };

  public func outputMetadataToIntProps(vecMetaData: [?[(Text, ICRC7.Value)]]) : [IntProp] {
    let buffer = Buffer.Buffer<IntProp>(vecMetaData.size());
    for (optMetaData: ?[(Text, ICRC7.Value)] in Array.vals(vecMetaData)) {
      switch(optMetaData){
        case(null){};
        case(?metaData){
          for ((key, value) : (Text, ICRC7.Value) in Array.vals(metaData)){
            assert(key == BIP721X_TAG);
            buffer.add(valueToIntProp(value));
          };
        };
      };
    };
    Buffer.toArray(buffer);
  };

  func valueToIntProp(value: ICRC7.Value) : IntProp {
    switch(value){
      case(#Map(map)){
        var title : ?Text = null;
        var description : ?Text = null;
        var intPropType : ?IntPropType = null;
        var intPropLicense : ?IntPropLicense = null;
        for ((k, v) in Array.vals(map)){
          switch(k){
            case("title"){ title := ?unwrapText(v); };
            case("description"){ description := ?unwrapText(v); };
            case("intPropType"){ intPropType := ?intPropTypeFromValue(unwrapNat(v)); };
            case("intPropLicense"){ intPropLicense := ?intPropLicenseFromValue(unwrapNat(v)); };
            case(_){ Debug.trap("Unexpected value"); };
          };
        };
        switch(title, description, intPropType, intPropLicense){
          case(?title, ?description, ?intPropType, ?intPropLicense){
            return { title; description; intPropType; intPropLicense; };
          };
          case(_){
            Debug.trap("Unexpected intProp metadata");
          };
        };
      };
      case(_){ Debug.trap("Unexpected value"); };
    };
  };

};