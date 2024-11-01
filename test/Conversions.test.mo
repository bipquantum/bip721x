import Principal              "mo:base/Principal";

import Types                  "../src/backend/intprop/Types";
import V1Conversions          "../src/backend/intprop/v1/Conversions";
import Conversions            "../src/backend/intprop/Conversions";
import { verify; Testify; } = "Testify";

import { suite; test; } "mo:test";

suite("Conversions", func(){
  
  test("Metadata to IntProp", func(){

    let actual = ?[
      (Types.BIP721X_TAG, 
        #Map([
          ("version", #Nat(1)),
          ("ip", #Map([
            ("title", #Text("title")),
            ("description", #Text("description")),
            ("intPropType", #Nat(V1Conversions.intPropTypeToNat(#COPYRIGHT))),
            ("intPropLicenses", #Array([#Nat(V1Conversions.intPropLicenseToNat(#GAME_FI)), #Nat(V1Conversions.intPropLicenseToNat(#META_USE))])),
            ("creationDate", #Int(0)),
            ("publishing", #Array([#Map([("date", #Int(1)), ("countryCode", #Text("FR"))])])),
            ("author", #Text("ftqps-w53nr-kacwj-ij5at-k4qja-yjq77-4zd37-mwamr-w37ng-66pj3-dae")),
            ("dataUri", #Text("dataUri")),
            ("percentageRoyalties", #Array([#Nat(2)]))
          ]))
        ])
      )
    ];

    let expected : Types.VersionnedIntProp = #V1({
      title = "title";
      description = "description";
      intPropType = #COPYRIGHT;
      intPropLicenses = [#GAME_FI, #META_USE];
      creationDate = 0;
      publishing = ?{ date = 1; countryCode = "FR"; };
      author = Principal.fromText("ftqps-w53nr-kacwj-ij5at-k4qja-yjq77-4zd37-mwamr-w37ng-66pj3-dae");
      dataUri = "dataUri";
      percentageRoyalties = ?2;
    });

    verify(Conversions.metadataToIntProp(actual), expected, Testify.intProp.equal);
  });

  test("IntProp to Metadata", func(){

    let _ = [{
      title = "title";
      description = "description";
      intPropType = #COPYRIGHT;
      intPropLicenses = [#GAME_FI, #META_USE];
      creationDate = 0;
      publishing = ?{ date = 1; countryCode = "FR"; };
      author = Principal.fromText("ftqps-w53nr-kacwj-ij5at-k4qja-yjq77-4zd37-mwamr-w37ng-66pj3-dae");
      dataUri = "dataUri";
      percentageRoyalties = ?2;
    }];

    let _ = #Class(
      [{
        name = Types.BIP721X_TAG;
        immutable = true;
        value = #Map([
          ("title", #Text("title")),
          ("description", #Text("description")),
          ("intPropType", #Nat(V1Conversions.intPropTypeToNat(#COPYRIGHT))),
          ("intPropLicenses", #Array([#Nat(V1Conversions.intPropLicenseToNat(#GAME_FI)), #Nat(V1Conversions.intPropLicenseToNat(#META_USE))])),
          ("creationDate", #Int(0)),
          ("publishing", #Array([#Map([("date", #Int(1)), ("countryCode", #Text("FR"))])])),
          ("author", #Text("ftqps-w53nr-kacwj-ij5at-k4qja-yjq77-4zd37-mwamr-w37ng-66pj3-dae")),
          ("dataUri", #Text("dataUri")),
          ("percentageRoyalties", #Array([#Nat(2)]))
        ]);
      }]
    );

    // TODO sardariuss 2024-08-07: Testify.metadata.equal is tricky to implement, there is no Candy comparison for #Map
    //verify(Conversions.intPropToMetadata(actual), expected, Testify.metadata.equal);
  });

});