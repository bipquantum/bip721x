import Debug  "mo:base/Debug";
import Array  "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Iter   "mo:base/Iter";
import Principal "mo:base/Principal";

import ICRC7  "mo:icrc7-mo";

import Types  "../Types";

module {

  let BIP721X_TAG      = Types.BIP721X_TAG;

  type IntPropType     = Types.IntPropType;
  type IntPropLicense  = Types.IntPropLicense;
  type IntProp         = Types.IntProp;
  type Result<Ok, Err> = Result.Result<Ok, Err>;

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

  public func intPropTypeFromNat(value: Nat) : IntPropType {
    switch (value) {
      case(0) { #COPYRIGHT; };
      case(1) { #PATENT; };
      case(2) { #IP_CERTIFICATE; };
      case(_) { Debug.trap("Invalid intPropType value"); };
    };
  };

  public func intPropLicenseFromNat(value: Nat) : IntPropLicense {
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

  public func unwrapInt(value: ICRC7.Value) : Int {
    switch (value) {
      case(#Int(int)) { int; };
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
      ("creationDate",    #Int(intProp.creationDate)),
      ("publishingDate",  #Int(intProp.publishingDate)),
      ("author",          #Text(Principal.toText(intProp.author))),
    ]);
  };

  public func intPropToMetadata(intProp: IntProp) : ICRC7.NFTInput {
    #Class([{
      name = BIP721X_TAG;
      immutable = true;
      value = intPropToValue(intProp);
    }]);
  };

  public func metadataToIntProps(vecMetaData: [?[(Text, ICRC7.Value)]]) : [IntProp] {
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
        var creationDate : ?Int = null;
        var publishingDate : ?Int = null;
        var author : ?Principal = null;
        for ((k, v) in Array.vals(map)){
          switch(k){
            case("title")         { title := ?unwrapText(v);                                };
            case("description")   { description := ?unwrapText(v);                          };
            case("intPropType")   { intPropType := ?intPropTypeFromNat(unwrapNat(v));       };
            case("intPropLicense"){ intPropLicense := ?intPropLicenseFromNat(unwrapNat(v)); };
            case("creationDate")  { creationDate := ?unwrapInt(v);                          };
            case("publishingDate"){ publishingDate := ?unwrapInt(v);                        };
            case("author")        { author := ?Principal.fromText(unwrapText(v));           };
            case(_){ Debug.trap("Unexpected value"); };
          };
        };
        switch(title, description, intPropType, intPropLicense, creationDate, publishingDate, author){
          case(?title, ?description, ?intPropType, ?intPropLicense, ?creationDate, ?publishingDate, ?author){
            return { title; description; intPropType; intPropLicense; creationDate; publishingDate; author; };
          };
          case(_){
            Debug.trap("Unexpected intProp metadata");
          };
        };
      };
      case(_){ Debug.trap("Unexpected value"); };
    };
  };

  public func getIntProps(tokenIds: [Nat], vecMetaData: [?[(Text, ICRC7.Value)]]) : Result<[(Nat, IntProp)], Text> {
    
    // Retrieve the metadata of the associated tokens
    let listIntProps = metadataToIntProps(vecMetaData);

    // Verify that the token IDs and metadata match
    if (tokenIds.size() != listIntProps.size()){
      return #err("Token IDs and metadata mismatch");
    };

    // Return the token IDs and metadata as a list of tuples
    let results = Buffer.Buffer<(Nat, IntProp)>(tokenIds.size());
    for (i in Iter.range(0, tokenIds.size() - 1)){
      results.add((tokenIds[i], listIntProps[i]));
    };

    #ok(Buffer.toArray(results));
  };

};