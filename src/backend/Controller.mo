import Principal     "mo:base/Principal";
import Result        "mo:base/Result";
import Map           "mo:map/Map";
import Int           "mo:base/Int";
import Time          "mo:base/Time";
import Nat64         "mo:base/Nat64";

import Types         "Types";
import Subaccount    "utils/Subaccount";
import Conversions   "utils/Conversions";

import ICRC7         "mo:icrc7-mo";

import Icrc7Canister "canister:icrc7";

module {

  let BIP721X_TAG      = Types.BIP721X_TAG;

  type User            = Types.User;
  type UserArgs        = Types.UserArgs;
  type UserRegister    = Types.UserRegister;
  type Result<Ok, Err> = Result.Result<Ok, Err>;
  type IntPropRegister = Types.IntPropRegister;
  type IntPropArgs     = Types.IntPropArgs;
  type IntProp         = Types.IntProp;
  type Time            = Int;

  type Account         = ICRC7.Account;

  public class Controller({
    owner: Principal;
    users: UserRegister;
    intProps: IntPropRegister;
  }) {

    public func setUser(
      args: UserArgs and {
        caller: Principal;
    }) : Result<(), Text> {

      if (Principal.isAnonymous(args.caller)){
        return #err("Anonymous user not allowed");
      };

      let user = { args with account = getUserAccount(args.caller) };

      Map.set(users.mapUsers, Map.phash, args.caller, user);
      #ok;
    };

    public func getUser(principal: Principal) : ?User {
      Map.get(users.mapUsers, Map.phash, principal)
    };

    // @todo: return a better result
    public func createIntProp(
      args: IntPropArgs and {
        caller: Principal;
        time: Time;
    }) : async Result<[ICRC7.SetNFTResult], Text> {

      if (Principal.isAnonymous(args.caller)){
        return #err("Anonymous user not allowed");
      };

      // Get the ID from the index then increment the index
      let token_id = intProps.index;
      intProps.index += 1;

      let mint_operation = await Icrc7Canister.icrcX_mint([{
        token_id;
        // @todo: somehow compilation fails if we use Conversions.intPropToMetadata 
        metadata = #Class([{
          name = BIP721X_TAG;
          immutable = true;
          value = Conversions.intPropToValue(args);
        }]);
        owner = ?getUserAccount(args.caller);
        override = false; // @todo: does false mean that the token shall be new ?
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(args.time));
      }]);

      // Set the price of the token
      Map.set(intProps.e8sIcpPrices, Map.nhash, token_id, args.e8sIcpPrice);

      #ok(mint_operation);
    };

    public func getIntProps({principal: Principal; prev: ?Nat; take: ?Nat}) : async [IntProp] {
      let tokenIds = await Icrc7Canister.icrc7_tokens_of(getUserAccount(principal), prev, take);
      Conversions.metadataToIntProps(await Icrc7Canister.icrc7_token_metadata(tokenIds));
    };

    func getUserAccount(principal: Principal) : Account {
      { owner; subaccount = ?Subaccount.fromPrincipal(principal); };
    };

  };

};
