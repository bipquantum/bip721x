import Types "Types";
import V1_Conversions "v1/Conversions";

import ICRC7 "mo:icrc7-mo";

import Debug "mo:base/Debug";
import Array "mo:base/Array";

module {

  type VersionnedIntProp = Types.VersionnedIntProp;
  
  let BIP721X_TAG = Types.BIP721X_TAG;

  public func intPropToMetadata(vIntProp: VersionnedIntProp) : ICRC7.NFTInput {
    #Class([{
      name = BIP721X_TAG;
      immutable = true;
      value = intPropToValue(vIntProp);
    }]);
  };

  public func metadataToIntProp(optMetaData: ?[(Text, ICRC7.Value)]) : VersionnedIntProp {
    switch(optMetaData){
      case(null){ Debug.trap("Missing metadata"); };
      case(?metaData){
        assert (metaData.size() == 1);
        assert (metaData[0].0 == BIP721X_TAG);
        return valueToIntProp(metaData[0].1);
      };
    };
  };

  public func intPropToValue(vIntProp: VersionnedIntProp) : ICRC7.Value {
    switch (vIntProp) {
      case(#V1(ip)) { 
        #Map([
          ("version", #Nat(1)                          ),
          ("ip"     , V1_Conversions.intPropToValue(ip)),
        ]);
      };
    };
  };

  func valueToIntProp(value: ICRC7.Value) : VersionnedIntProp {
    switch (value) {
      case(#Map(map)) {
        var version : ?Nat = null;
        var ip_value : ?ICRC7.Value = null;
        for ((k, v) in Array.vals(map)){
          switch(k){
            case("version") { version := ?unwrapNat(v);       };
            case("ip")      { ip_value := ?v;                 };
            case(_)         { Debug.trap("Unexpected value"); };
          };
        };
        switch(version, ip_value){
          case(?version, ?ip_value) {
            switch (version) {
              case(1) { #V1(V1_Conversions.valueToIntProp(ip_value)); };
              case(_) { Debug.trap("Unexpected version"); };
            };
          };
          case(_) { Debug.trap("Missing value"); };
        };
      };
      case(_) { Debug.trap("Unexpected value"); };
    };
  };

  func unwrapNat(value: ICRC7.Value) : Nat {
    switch (value) {
      case(#Nat(nat)) { nat; };
      case(_) { Debug.trap("Unexpected value"); };
    };
  };

};
