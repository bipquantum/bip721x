import List "mo:base/List";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Random "mo:base/Random";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Array "mo:base/Array";

import Types "./types";

actor {
  stable var indexId : Nat = 1;
  stable var userIndexId : Nat = 1;
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

  var IPList : HashMap.HashMap<Nat, IPEntryType> = HashMap.HashMap(8, Nat.equal, Hash.hash);
  var UsersList : HashMap.HashMap<Principal, UserProfileDetailsType> = HashMap.HashMap(8, Principal.equal, Principal.hash);
  stable var userStableData : [StableUserDataType] = [];
  stable var IPStableData : [StableIPDataType] = [];

  public shared (caller) func createIP(ipEntryInput : IPEntryInputType) : async ?Nat {
    // Get caller principal
    let callerId : Principal = caller.caller;

    // Reject AnonymousIdentity
    if (Principal.toText(callerId) == "2vxsx-fae") {
      return null;
    };

    // check if user profile exists?
    let userFound = UsersList.get(callerId);
    switch (userFound) {
      case null {
        // create user profile
        let _userProfile = await createUserProfile(callerId);
      };
      case (?entry) {};
    };

    let id : Nat = indexId;
    var ipEntryToBeCreated = {
      id = id;
      title = ipEntryInput.title;
      description = ipEntryInput.description;
      ipType = ipEntryInput.ipType;
      ipLicense = ipEntryInput.ipLicense;
      ipPrice = ipEntryInput.ipPrice;
      ipPriceCurrency = ipEntryInput.ipPriceCurrency;
      createdBy = callerId;
    };

    indexId := indexId + 1;

    IPList.put(id, ipEntryToBeCreated);

    return ?ipEntryToBeCreated.id;
  };

  public shared query (_msg) func getIPByID(id : Nat) : async ?IPEntryType {
    return IPList.get(id);
  };

  public func getAllIPs() : async [IPEntryType] {
    // Create an empty list to store entries
    var allEntries : List.List<IPEntryType> = List.nil();

    // Iterate through all key-value pairs in the HashMap using entries
    for ((key, value) in IPList.entries()) {
      allEntries := List.push(value, allEntries);
    };

    // Return the list of all entries
    return List.toArray(allEntries);
  };

  public shared (caller) func deleteIP(id : Nat) : async Result.Result<?IPEntryType, Error> {
    // Get caller principal
    let callerId : Principal = caller.caller;

    // Reject AnonymousIdentity
    if (Principal.toText(callerId) == "2vxsx-fae") {
      return #err(#NotAuthorized);
    };

    let maybeEntry = IPList.get(id);
    switch (maybeEntry) {
      case null {
        return #ok(null);
      };
      case (?entry) {
        // Check if caller is the creator before deleting
        if (entry.createdBy != callerId) {
          return #err(#NotAuthorized);
        };
        IPList.delete(id);
        return #ok(?entry);
      };
    };
  };

  public shared (caller) func updateIP(
    id : Nat,
    newTitle : ?Text,
    newDescription : ?Text,
    ipType : ?IP_TYPE_ENUM,
    ipLicense : ?IP_LICENSES_TYPE_ENUM,
    ipPrice : ?Float,
    ipPriceCurrency : ?Text,
  ) : async Result.Result<?IPEntryType, Error> {
    // Get caller principal
    let callerId : Principal = caller.caller;

    // Reject AnonymousIdentity
    if (Principal.toText(callerId) == "2vxsx-fae") {
      return #err(#NotAuthorized);
    };

    let maybeEntry = IPList.get(id);
    switch (maybeEntry) {
      case null {
        return #ok(null);
      };
      case (?entry) {
        // Check if caller is the creator before updating
        if (entry.createdBy != caller.caller) {
          return #err(#NotAuthorized);
        };

        let updatedTitle = switch newTitle {
          case null { entry.title };
          case (?title) { title };
        };

        let updatedDescription = switch newDescription {
          case null { entry.description };
          case (?description) { description };
        };

        let updatedIPType = switch ipType {
          case null { entry.ipType };
          case (?ipType) { ipType };
        };

        let updatedIPLicense = switch ipLicense {
          case null { entry.ipLicense };
          case (?ipLicense) { ipLicense };
        };

        let updatedIPPriceCurrency = switch ipPriceCurrency {
          case null { entry.ipPriceCurrency };
          case (?ipPriceCurrency) { ipPriceCurrency };
        };

        let updatedIPPrice = switch ipPrice {
          case null { entry.ipPrice };
          case (?ipPrice) { ipPrice };
        };

        let updatedEntry : IPEntryType = {
          id = id;
          title = updatedTitle;
          description = updatedDescription;
          ipType = updatedIPType;
          ipLicense = updatedIPLicense;
          ipPrice = updatedIPPrice;
          ipPriceCurrency = updatedIPPriceCurrency;
          createdBy = entry.createdBy;
        };
        IPList.put(id, updatedEntry);
        return #ok(?updatedEntry);
      };
    };
  };

  // make sure this is called with correct principal (caller id)
  private func createUserProfile(callerId : Principal) : async UserProfileDetailsType {
    // check if user id already exists?
    let userIdExists = UsersList.get(callerId);
    switch (userIdExists) {
      case null {
        // create user id
        let userToCreate : UserProfileDetailsType = {
          id = userIndexId;
          name = "";
          familyName = "";
          nickName = "";
          speciality = "";
          country = "";
          identityPrincipal = callerId;
          userStableData;
        };

        userIndexId := userIndexId + 1;

        // create user entry
        UsersList.put(callerId, userToCreate);
        return userToCreate;
      };
      case (?entry) {
        return entry;
      };
    };
  };

  public shared (caller) func updateUserProfile({ name : ?Text; familyName : ?Text; nickName : ?Text; speciality : ?Text; country : ?Text } : UpdateProfileDetailsParams) : async Result.Result<?UserProfileDetailsType, Error> {
    // Get caller principal
    let callerId : Principal = caller.caller;

    // Reject AnonymousIdentity
    if (Principal.toText(callerId) == "2vxsx-fae") {
      return #err(#NotAuthorized);
    };

    let userFound = UsersList.get(callerId);
    switch (userFound) {
      case null {
        return #ok(null);
      };
      case (?entry) {
        let updatedName = switch name {
          case null { entry.name };
          case (?name) { name };
        };

        let updatedFamilyName = switch familyName {
          case null { entry.familyName };
          case (?n) { n };
        };

        let updatedNickName = switch nickName {
          case null { entry.nickName };
          case (?n) { n };
        };

        let updatedSpeciality = switch speciality {
          case null { entry.speciality };
          case (?n) { n };
        };

        let updatedCountry = switch country {
          case null { entry.country };
          case (?n) { n };
        };

        let updatedEntry = {
          id = entry.id;
          name = updatedName;
          familyName = updatedFamilyName;
          nickName = updatedNickName;
          speciality = updatedSpeciality;
          country = updatedCountry;
          identityPrincipal = callerId;
        };
        UsersList.put(callerId, updatedEntry);
        return #ok(?updatedEntry);
      };
    };
  };

  public shared (caller) func getMyProfile() : async Result.Result<UserProfileDetailsType, Error> {
    // Get caller principal
    let callerId : Principal = caller.caller;

    // Reject AnonymousIdentity
    if (Principal.toText(callerId) == "2vxsx-fae") {
      return #err(#NotFound);
    };

    let userFound = UsersList.get(callerId);
    switch (userFound) {
      case null {
        // create user profile
        let userProfile = await createUserProfile(callerId);
        return #ok(userProfile);
      };
      case (?entry) {
        return #ok(entry);
      };
    };
  };

  public shared func getAllUsers() : async [UserProfileDetailsType] {
    // Create an empty list to store entries
    var allEntries : List.List<UserProfileDetailsType> = List.nil();

    // Iterate through all key-value pairs in the HashMap using entries
    for ((key, value) in UsersList.entries()) {
      allEntries := List.push(value, allEntries);
    };

    // Return the list of all entries
    return List.toArray(allEntries);
  };

  system func preupgrade() {
    // move all users in stable memory
    for ((key, value) in UsersList.entries()) {
      let userRecord : StableUserDataType = {
        userId = key;
        userDetails = value;
      };
      userStableData := Array.append(userStableData, [userRecord]);
    };

    // move all IPs in stable memory
    for ((key, value) in IPList.entries()) {
      let ipRecord : StableIPDataType = {
        ipID = key;
        ipDetails = value;
      };
      IPStableData := Array.append(IPStableData, [ipRecord]);
    };

  };

  system func postupgrade() {
    for (user in userStableData.vals()) {
      let userDetails : UserProfileDetailsType = {
        id = user.userDetails.id;
        name = user.userDetails.name;
        familyName = user.userDetails.familyName;
        nickName = user.userDetails.nickName;
        speciality = user.userDetails.speciality;
        country = user.userDetails.country;
        identityPrincipal = user.userDetails.identityPrincipal;
      };

      UsersList.put(user.userId, userDetails);
    };
    for (ip in IPStableData.vals()) {
      let ipDetails : IPEntryType = {
        id = ip.ipID;
        title = ip.ipDetails.title;
        description = ip.ipDetails.description;
        ipType = ip.ipDetails.ipType;
        ipLicense = ip.ipDetails.ipLicense;
        ipPrice = ip.ipDetails.ipPrice;
        ipPriceCurrency = ip.ipDetails.ipPriceCurrency;
        createdBy = ip.ipDetails.createdBy;
      };

      IPList.put(ip.ipID, ipDetails);
    };

    userStableData := [];
    IPStableData := [];
  };
};
