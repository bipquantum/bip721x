import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Result "mo:base/Result";
import List "mo:base/List";
import Types "./types";

module {
  public class UserController(index: Nat, UsersList: HashMap.HashMap<Principal, Types.UserProfileDetailsType>) {

    type UserIdType = Types.UserIdType;
    type UserProfileDetailsType = Types.UserProfileDetailsType;
    type UpdateProfileDetailsParams = Types.UpdateProfileDetailsParams;
    type StableUserDataType = Types.StableUserDataType;
    type StableIPDataType = Types.StableIPDataType;

    public shared (caller) func updateUserProfile(params: Types.UpdateProfileDetailsParams): async Result.Result<?Types.UserProfileDetailsType, Types.ERROR_ENUM> {
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

    public shared (caller) func getMyProfile(userIndexId : Nat,userStableData : [StableUserDataType]): async Result.Result<Types.UserProfileDetailsType, Types.ERROR_ENUM> {
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
            let userProfile = await createUserProfile(callerId, userIndexId, userStableData);
            return #ok(userProfile);
        };
        case (?entry) {
            return #ok(entry);
        };
        };
    };

    public shared func getAllUsers(): async [Types.UserProfileDetailsType] {
        // Create an empty list to store entries
        var allEntries : List.List<UserProfileDetailsType> = List.nil();

        // Iterate through all key-value pairs in the HashMap using entries
        for ((key, value) in UsersList.entries()) {
        allEntries := List.push(value, allEntries);
        };

        // Return the list of all entries
        return List.toArray(allEntries);
    };

    public func createUserProfile(callerId: Principal,userIndexId : Nat,userStableData : [StableUserDataType]): async Types.UserProfileDetailsType {
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
  }
}
