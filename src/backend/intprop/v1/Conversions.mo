import Types     "Types";

import ICRC7     "mo:icrc7-mo";

import Map       "mo:map/Map";

import Debug     "mo:base/Debug";
import Array     "mo:base/Array";
import Result    "mo:base/Result";
import Option    "mo:base/Option";
import Principal "mo:base/Principal";

module {

  type IntPropType     = Types.IntPropType;
  type IntPropLicense  = Types.IntPropLicense;
  type IntProp         = Types.IntProp;
  type PublishingInfo  = Types.PublishingInfo;
  type Result<Ok, Err> = Result.Result<Ok, Err>;
  type HashUtils<K>    = Map.HashUtils<K>;
  type Map<K, V>       = Map.Map<K, V>;

  public func intPropTypeToNat(intPropType: IntPropType) : Nat {
    switch (intPropType) {
      case(#COPYRIGHT)                { 0; };
      case(#PRE_PATENT)               { 1; };
      case(#TRADEMARK)                { 2; };
      case(#TRADE_SECRET)             { 3; };
      case(#INDUSTRIAL_DESIGN_RIGHTS) { 4; };
      case(#GEOGRAPHICAL_INDICATIONS) { 5; };
      case(#PLANT_VARIETY)            { 6; };
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
      case(0) { #COPYRIGHT;                              };
      case(1) { #PRE_PATENT;                             };
      case(2) { #TRADEMARK;                              };
      case(3) { #TRADE_SECRET;                           };
      case(4) { #INDUSTRIAL_DESIGN_RIGHTS;               };
      case(5) { #GEOGRAPHICAL_INDICATIONS;               };
      case(6) { #PLANT_VARIETY;                          };
      case(_) { Debug.trap("Invalid intPropType value"); };
    };
  };

  public func intPropLicenseFromNat(value: Nat) : IntPropLicense {
    switch (value) {
      case(0) { #SAAS;                                      };
      case(1) { #REPRODUCTION;                              };
      case(2) { #GAME_FI;                                   };
      case(3) { #META_USE;                                  };
      case(4) { #PHYSICAL_REPRODUCTION;                     };
      case(5) { #ADVERTISEMENT;                             };
      case(6) { #NOT_APPLICABLE;                            };
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

  public func unwrapMap(value: ICRC7.Value) : Map.Map<Text, ICRC7.Value> {
    switch (value) {
      case(#Map(map)) { Map.fromIter(Array.vals(map), Map.thash); };
      case(_) { Debug.trap("Unexpected value"); };
    };
  };

  public func unwrapArray(value: ICRC7.Value) : [ICRC7.Value] {
    switch (value) {
      case(#Array(array)) { array; };
      case(_) { Debug.trap("Unexpected value"); };
    };
  };

  public func unwrapOpt(value: ICRC7.Value) : ?ICRC7.Value {
    switch (value) {
      case(#Array(array)) { 
        if (array.size() == 0) { return null; };
        if (array.size() == 1) { return ?(array[0]); };
        Debug.trap("Unexpected array size");
      };
      case(_) { Debug.trap("Unexpected value"); };
    };
  };

  public func unwrapNat(value: ICRC7.Value) : Nat {
    switch (value) {
      case(#Nat(nat)) { nat; };
      case(_) { Debug.trap("Unexpected value"); };
    };
  };

  public func getOrTrap<K, V>(map: Map.Map<K, V>, hash: HashUtils<K>, key: K) : V {
    switch (Map.get(map, hash, key)) {
      case(?v) { v; };
      case(null) { Debug.trap("Key not found"); };
    };
  };

  public func intPropToValue(intProp: IntProp) : ICRC7.Value {
    #Map([
      ("title",           #Text(intProp.title)),
      ("description",     #Text(intProp.description)),
      ("intPropType",     #Nat(intPropTypeToNat(intProp.intPropType))),
      ("intPropLicenses", #Array(Array.map(intProp.intPropLicenses, func(license: IntPropLicense) : ICRC7.Value { #Nat(intPropLicenseToNat(license)); }))),
      ("creationDate",    #Int(intProp.creationDate)),
      ("publishing",      #Array(switch(intProp.publishing) {
        case(?d) { [#Map([
          ("date",        #Int(d.date)),
          ("countryCode", #Text(d.countryCode)),
        ])]; }; 
        case(null) { [] };
      })),
      ("author",          #Text(Principal.toText(intProp.author))),
      ("dataUri",         #Text(intProp.dataUri)),
    ]);
  };

  public func valueToIntProp(value: ICRC7.Value) : IntProp {
    switch(value){
      case(#Map(map)){
        var title : ?Text = null;
        var description : ?Text = null;
        var intPropType : ?IntPropType = null;
        var intPropLicenses : ?[IntPropLicense] = null;
        var creationDate : ?Int = null;
        var publishing : ??PublishingInfo = null;
        var author : ?Principal = null;
        var dataUri : ?Text = null;
        for ((k, v) in Array.vals(map)){
          switch(k){
            case("title")           { title := ?unwrapText(v);                         };
            case("description")     { description := ?unwrapText(v);                   };
            case("intPropType")     { intPropType := ?intPropTypeFromNat(unwrapNat(v));};
            case("intPropLicenses") { 
              intPropLicenses := ?Array.map(unwrapArray(v), func(value: ICRC7.Value) : IntPropLicense {
                intPropLicenseFromNat(unwrapNat(value));
              });
            };
            case("creationDate")    { creationDate := ?unwrapInt(v);                   };
            case("publishing")      { 
              publishing := ?Option.map(unwrapOpt(v), func(v: ICRC7.Value) : PublishingInfo {
                let map = unwrapMap(v);
                {
                  date = unwrapInt(getOrTrap(map, Map.thash, "date"));
                  countryCode = unwrapText(getOrTrap(map, Map.thash, "countryCode"));
                };
              });
            };
            case("author")          { author := ?Principal.fromText(unwrapText(v));    };
            case("dataUri")         { dataUri := ?unwrapText(v);                       };
            case(_)                 { Debug.trap("Unexpected value");                  };
          };
        };
        switch(title, description, intPropType, intPropLicenses, creationDate, publishing, author, dataUri){
          case(?title, ?description, ?intPropType, ?intPropLicenses, ?creationDate, ?publishing, ?author, ?dataUri){
            return { title; description; intPropType; intPropLicenses; creationDate; publishing; author; dataUri; };
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