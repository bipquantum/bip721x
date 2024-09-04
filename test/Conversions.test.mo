import Principal              "mo:base/Principal";

import Types                  "../src/backend/Types";
import Conversions            "../src/backend/utils/Conversions";
import { verify; Testify; } = "Testify";

import { suite; test; } "mo:test";

suite("Conversions", func(){
  
  test("Metadata to IntProp", func(){

    let actual = [
      ?[
        (Types.BIP721X_TAG, 
        #Map([
          ("title", #Text("title")),
          ("description", #Text("description")),
          ("intPropType", #Nat(Conversions.intPropTypeToNat(#COPYRIGHT))),
          ("intPropLicense", #Nat(Conversions.intPropLicenseToNat(#SAAS))),
          ("creationDate", #Int(0)),
          ("publishingDate", #Int(1)),
          ("author", #Text("ftqps-w53nr-kacwj-ij5at-k4qja-yjq77-4zd37-mwamr-w37ng-66pj3-dae"))
          ])
        )
      ]
    ];

    let expected = [{
      title = "title";
      description = "description";
      intPropType = #COPYRIGHT;
      intPropLicense = #SAAS;
      creationDate = 0;
      publishingDate = 1;
      author = Principal.fromText("ftqps-w53nr-kacwj-ij5at-k4qja-yjq77-4zd37-mwamr-w37ng-66pj3-dae");
    }];

    verify(Conversions.metadataToIntProps(actual), expected, Testify.intProps.equal);
  });

  test("IntProp to Metadata", func(){

    let _ = [{
      title = "title";
      description = "description";
      intPropType = #COPYRIGHT;
      intPropLicense = #SAAS;
      creationDate = 0;
      publishingDate = 1;
      author = Principal.fromText("ftqps-w53nr-kacwj-ij5at-k4qja-yjq77-4zd37-mwamr-w37ng-66pj3-dae");
    }];

    let _ = #Class(
      [{
        name = Types.BIP721X_TAG;
        immutable = true;
        value = #Map([
          ("title", #Text("title")),
          ("description", #Text("description")),
          ("intPropType", #Nat(Conversions.intPropTypeToNat(#COPYRIGHT))),
          ("intPropLicense", #Nat(Conversions.intPropLicenseToNat(#SAAS))),
          ("creationDate", #Int(0)),
          ("publishingDate", #Int(1)),
          ("author", #Text("ftqps-w53nr-kacwj-ij5at-k4qja-yjq77-4zd37-mwamr-w37ng-66pj3-dae"))
        ]);
      }]
    );

    // TODO sardariuss 2024-08-07: Testify.metadata.equal is tricky to implement, there is no Candy comparison for #Map
    //verify(Conversions.intPropToMetadata(actual), expected, Testify.metadata.equal);
  });

});