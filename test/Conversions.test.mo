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
          ("intPropLicense", #Nat(Conversions.intPropLicenseToNat(#SAAS)))
          ])
        )
      ]    
    ];

    let expected = [{
      title = "title";
      description = "description";
      intPropType = #COPYRIGHT;
      intPropLicense = #SAAS;
    }];

    verify(Conversions.metadataToIntProps(actual), expected, Testify.intProps.equal);
  });

  test("IntProp to Metadata", func(){

    let _ = [{
      title = "title";
      description = "description";
      intPropType = #COPYRIGHT;
      intPropLicense = #SAAS;
    }];

    let _ = #Class(
      [{
        name = Types.BIP721X_TAG;
        immutable = true;
        value = #Map([
          ("title", #Text("title")),
          ("description", #Text("description")),
          ("intPropType", #Nat(Conversions.intPropTypeToNat(#COPYRIGHT))),
          ("intPropLicense", #Nat(Conversions.intPropLicenseToNat(#SAAS)))
        ]);
      }]
    );

    // @todo: Testify.metadata.equal is tricky to implement, there is no Candy comparison for #Map
    //verify(Conversions.intPropToMetadata(actual), expected, Testify.metadata.equal);
  });

});