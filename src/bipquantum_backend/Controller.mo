import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Map "mo:map/Map";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Nat64 "mo:base/Nat64";

import Types "Types";

import ICRC7 "mo:icrc7-mo";

import Icrc7Canister "canister:icrc7";

module {

  type User = Types.User;
  type UserRegister = Types.UserRegister;
  type Result<Ok, Err> = Result.Result<Ok, Err>;

  public class Controller(users: UserRegister) {

    public func setUser(caller: Principal, user: User) : Result<(), Text> {

      if (Principal.isAnonymous(caller)){
        return #err("Anonymous user not allowed");
      };

      Map.set(users.map_users, Map.phash, caller, user);
      #ok;
    };

    public func getUser(principal: Principal) : ?User {
      Map.get(users.map_users, Map.phash, principal)
    };

    public func createIP({
      caller: Principal; 
      ipEntryInput: Types.IPEntryInputType;
    }) : async [ICRC7.SetNFTResult] {

      let metadata = #Map([
        ("title",           #Text(ipEntryInput.title)),
        ("description",     #Text(ipEntryInput.description)),
        ("ipType",          #Nat(ipTypeEnumToNat(ipEntryInput.ipType))),
        ("ipLicense",       #Nat(ipLicenseTypeEnumToNat(ipEntryInput.ipLicense))),
      ]); 

      await Icrc7Canister.icrcX_mint([{
        token_id: Nat = 0; // @todo: what to put ?
        metadata;
        owner: ?ICRC7.Account = null; // @todo: put the account of the user ?
        override: Bool = false; // @todo: what to put ?
        memo: ?Blob = null;
        created_at_time: ?Nat64 = ?Nat64.fromNat(Int.abs(Time.now()));
      }]);
    };

    func ipTypeEnumToNat(ipType: Types.IP_TYPE_ENUM) : Nat {
      switch (ipType) {
        case(#COPYRIGHT)      { 0; };
        case(#PATENT)         { 1; };
        case(#IP_CERTIFICATE) { 2; };
      };
    };

    func ipLicenseTypeEnumToNat(ipLicense: Types.IP_LICENSES_TYPE_ENUM) : Nat {
      switch (ipLicense) {
        case(#SAAS)                  { 0; };
        case(#REPRODUCTION)          { 1; };
        case(#GAAME_FI)              { 2; };
        case(#META_USE)              { 3; };
        case(#PHYSICAL_REPRODUCTION) { 4; };
        case(#ADVERTISEMENT)         { 5; };
        case(#NOT_APPLICABLE)        { 6; };
      };
    };

  };

};
