import List "mo:base/List";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Types "./types";
import IPController "./IPController";
import UserController "./UserController";

actor {
  stable var index: Nat = 0;
  stable var ipList: HashMap.HashMap<Nat, Types.IPEntryType> = HashMap.HashMap(8, Nat.equal, Hash.hash);
  stable var usersList: HashMap.HashMap<Principal, Types.UserProfileDetailsType> = HashMap.HashMap(8, Principal.equal, Principal.hash);

  type Error = Types.ERROR_ENUM;
  type IPEntryInputType = Types.IPEntryInputType;
  type IPEntryType = Types.IPEntryType;
  type IP_TYPE_ENUM = Types.IP_TYPE_ENUM;
  type IP_LICENSES_TYPE_ENUM = Types.IP_LICENSES_TYPE_ENUM;
  type UserIdType = Types.UserIdType;
  type UserProfileDetailsType = Types.UserProfileDetailsType;
  type UpdateProfileDetailsParams = Types.UpdateProfileDetailsParams;
  type StableUserDataType = Types.StableUserDataType;
  type StableIPDataType = Types.StableIPDataType;

  let ipController = IPController.IPController(index, ipList);
  let userController = UserController.UserController(index, usersList);

  public shared (caller) func createIP(ipEntryInput : IPEntryInputType) : async ?Nat {
    // Get caller principal
    let callerId : Principal = caller.caller;

    // Reject AnonymousIdentity
    if (Principal.toText(callerId) == "2vxsx-fae") {
    return null;
    };

    // check if user profile exists?
    let userFound = usersList.get(callerId);
    switch (userFound) {
    case null {
        // create user profile
        let _userProfile = await createUserProfile(callerId);
    };
    case (?entry) {};
    };
    index := index + 1;
    return ipController.createIP(ipEntryInput,callerId,index);
  };
  public shared query (_msg) func getIPByID(id : Nat) : async ?IPEntryType {
    return ipController.getIPByID(id);
  };
  public func getAllIPs() : async [IPEntryType] {
    // Return the list of all entries
    return ipController.getAllIPs();
  };
  public shared (caller) func deleteIP(id : Nat) : async Result.Result<?IPEntryType, Error> {
    let callerId : Principal = caller.caller;
    return ipController.deleteIP(id,callerId);
  };
  public shared (caller) func updateIP(
      id: Nat,
      newTitle: ?Text,
      newDescription: ?Text,
      ipType: ?Types.IP_TYPE_ENUM,
      ipLicense: ?Types.IP_LICENSES_TYPE_ENUM,
      ipPrice: ?Float,
      ipPriceCurrency: ?Text
    ): async Result.Result<?Types.IPEntryType, Types.ERROR_ENUM> {
      // Get caller principal
      let callerId : Principal = caller.caller;
      return ipController.updateIP(id,callerId,newTitle,newDescription,ipType,ipLicense,ipPrice,ipPriceCurrency);
  };
  
}
