import Principal         "mo:base/Principal";
import Result            "mo:base/Result";
import Map               "mo:map/Map";
import Int               "mo:base/Int";
import Time              "mo:base/Time";
import Nat64             "mo:base/Nat64";
import Buffer            "mo:base/Buffer";
import Iter              "mo:base/Iter";

import Types             "Types";
import Conversions       "utils/Conversions";

import ICRC7             "mo:icrc7-mo";

import Icrc7Canister     "canister:icrc7";
import IcpLedgerCanister "canister:icp_ledger";

module {

  let BIP721X_TAG          = Types.BIP721X_TAG;

  type User                = Types.User;
  type UserArgs            = Types.UserArgs;
  type UserRegister        = Types.UserRegister;
  type Result<Ok, Err>     = Result.Result<Ok, Err>;
  type IntPropRegister     = Types.IntPropRegister;
  type IntPropArgs         = Types.IntPropArgs;
  type IntProp             = Types.IntProp;
  type CreateIntPropResult = Types.CreateIntPropResult;
  type BuyIntPropResult    = Types.BuyIntPropResult;
  type Time                = Int;

  type Account             = ICRC7.Account;

  public class Controller({
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

    public func createIntProp(
      args: IntPropArgs and {
        caller: Principal;
        time: Time;
    }) : async CreateIntPropResult {

      if (Principal.isAnonymous(args.caller)){
        return #err(#NotAuthorized);
      };

      // Get the ID from the index then increment the index
      let token_id = intProps.index;
      intProps.index += 1;

      let mint_operation = await Icrc7Canister.icrcX_mint([{
        token_id;
        // TODO sardariuss 2024-08-07: somehow compilation fails if we use Conversions.intPropToMetadata
        metadata = #Class([{
          name = BIP721X_TAG;
          immutable = true;
          value = Conversions.intPropToValue(args);
        }]);
        owner = ?getUserAccount(args.caller);
        override = false; // TODO sardariuss 2024-08-07: verify that false mean that the token_id shall not exist yet
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(args.time));
      }]);

      if (mint_operation.size() != 1){
        return #err(#MintError);
      };

      // TODO sardariuss 2024-08-07: improve error handling
      switch(mint_operation[0]){
        case(#Err(err)){
          return #err(err);
        };
        case(#GenericError(err)){
          return #err(#GenericError(err));
        };
        case(#Ok(opt_mint)){
          switch(opt_mint){
            case(null) {
              return #err(#MintError);
            };
            case(?mint_id){
              if (mint_id != token_id){
                return #err(#MintError);
              };
            };
          };
        };
      };

      // Set the price of the token
      Map.set(intProps.e8sIcpPrices, Map.nhash, token_id, args.e8sIcpPrice);

      #ok(token_id);
    };

    public func getIntProps({owner: Principal; prev: ?Nat; take: ?Nat}) : async Result<[(Nat, IntProp)], Text> {

      // Retrieve the token IDs and metadata
      let tokenIds = await Icrc7Canister.icrc7_tokens_of(getUserAccount(owner), prev, take);
      let listIntProps = Conversions.metadataToIntProps(await Icrc7Canister.icrc7_token_metadata(tokenIds));

      // Verify that the token IDs and metadata match
      if (tokenIds.size() != listIntProps.size()){
        return #err("Token IDs and metadata mismatch");
      };

      // Return the token IDs and metadata as a list of tuples
      let results = Buffer.Buffer<(Nat, IntProp)>(tokenIds.size());
      for (i in Iter.range(0, tokenIds.size() - 1)){
        results.add((tokenIds[i], listIntProps[i]));
      };

      #ok(Buffer.toArray(results));
    };

    public func buyIntProp({
      buyer: Principal;
      token_id: Nat;
      time: Time;
    }) : async Result<BuyIntPropResult, Text> {

      // Find the seller of the IP
      let owners = await Icrc7Canister.icrc7_owner_of([token_id]);
      if (owners.size() != 1){
        return #err("Owner not found");
      };
      let seller_account = switch(owners[0]){
        case(null) { return #err("Owner not found"); };
        case(?account) { account; };
      };

      // Retrieve the price of the IP
      let e8sPrice = switch(Map.get(intProps.e8sIcpPrices, Map.nhash, token_id)){
        case(null) { return #err("Price not found"); };
        case(?price) { price; };
      };

      let buyer_account = getUserAccount(buyer);

      // Transfer the ICP
      let icp_transfer = await transferIcp({
        from = buyer_account;
        to = seller_account;
        amount = e8sPrice;
        time;
      });

      // Transfer the IP if the ICP transfer was successful
      // TODO sardariuss 2024-08-07: add a reimburse mechanism if the IP transfer failed
      let icrc7_transfer = switch(icp_transfer){
        case(#err(_)){ null; };
        case(#ok(_)){
          ?(await transferFromIcrc37({
            from = seller_account;
            to = buyer_account;
            token_id;
            time;
          }));
        };
      };

      #ok({ icp_transfer; icrc7_transfer; });
    };

    func transferIcp({
      from: Account;
      to: Account;
      amount: Nat;
      time: Time;
    }) : async Result<Nat, Text> {

      let icp_transfer_args = {
        spender_subaccount = null;
        from;
        to;
        amount;
        fee = null;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(time));
      };

      let icp_transfer = await IcpLedgerCanister.icrc2_transfer_from(icp_transfer_args);

      switch(icp_transfer){
        case(#Err(err)){ #err("Transfer of ICP failed: " # debug_show(err)); };
        case(#Ok(tx_id)){ #ok(tx_id); };
      };
    };

    func transferFromIcrc37({
      from: Account;
      to: Account;
      token_id: Nat;
      time: Time;
    }) : async Result<Nat, Text> {

      let icrc37_transfer_args = {
        spender_subaccount = null;
        from;
        to;
        token_id;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(time));
      };

      let icrc7_transfers = await Icrc7Canister.icrc37_transfer_from([icrc37_transfer_args]);

      if (icrc7_transfers.size() != 1){
        return #err("Transfer of IP failed");
      };
      
      let transfer = switch(icrc7_transfers[0]){
        case(null) { return #err("Transfer of IP failed"); };
        case(?tx) { tx };
      };
      
      switch(transfer) {
        case(#Err(err)){ #err("Transfer of IP failed: " # debug_show(err)); };
        case(#Ok(tx_id)){ #ok(tx_id); };
      };
    };

    func getUserAccount(principal: Principal) : Account {
      { owner = principal; subaccount = null; };
    };

  };

};
