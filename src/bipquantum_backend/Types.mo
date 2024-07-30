import Map "mo:map/Map";

module {
    // enums
    public type ERROR_ENUM = {
        #NotFound;
        #AlreadyExists;
        #NotAuthorized;
    };

    public type IP_TYPE_ENUM = {
        #COPYRIGHT;
        #PATENT;
        #IP_CERTIFICATE;
    };

    public type IP_LICENSES_TYPE_ENUM = {
        #SAAS;
        #REPRODUCTION;
        #GAAME_FI;
        #META_USE;
        #PHYSICAL_REPRODUCTION;
        #ADVERTISEMENT;
        #NOT_APPLICABLE;
    };

    // IP types
    public type IPEntryInputType = {
        title : Text;
        description : Text;
        ipType : IP_TYPE_ENUM;
        ipLicense : IP_LICENSES_TYPE_ENUM;
        ipPrice : Float;
        ipPriceCurrency : Text;
    };

    public type IPEntryType = {
        id : Nat;
        title : Text;
        description : Text;
        ipType : IP_TYPE_ENUM;
        ipLicense : IP_LICENSES_TYPE_ENUM;
        ipPrice : Float;
        ipPriceCurrency : Text;
        createdBy : Principal;
    };

    // user types
    public type UserIdType = Principal;
    public type User = {
        firstName: Text;
        lastName: Text;
        nickName: Text;
        speciality: Text;
        country: Text;
    };

    public type UserRegister = {
        var index: Nat;
        map_users: Map.Map<Principal, User>;
    };

    public type UpdateProfileDetailsParams = {
        name : ?Text;
        familyName : ?Text;
        nickName : ?Text;
        speciality : ?Text;
        country : ?Text;
    };

    public type StableUserDataType = {
        userId : UserIdType;
        userDetails : User;
    };

    public type StableIPDataType = {
        ipID : Nat;
        ipDetails : IPEntryType;
    };
};
