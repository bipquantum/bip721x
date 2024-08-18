import Principal         "mo:base/Principal";
import Result            "mo:base/Result";
import Map               "mo:map/Map";
import Int               "mo:base/Int";
import Time              "mo:base/Time";
import Nat64             "mo:base/Nat64";
import Array             "mo:base/Array";

import Types             "Types";
import Conversions       "utils/Conversions";
import Subaccount        "utils/Subaccount";

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
  type IntPropInput        = Types.IntPropInput;
  type IntProp             = Types.IntProp;
  type CreateIntPropResult = Types.CreateIntPropResult;
  type BuyIntPropResult    = Types.BuyIntPropResult;
  type Time                = Int;

  type Account             = ICRC7.Account;

  public class Controller({
    users: UserRegister;
    intProps: IntPropRegister;
    backend_id: Principal;
  }) {

    public func setUser(
      args: UserArgs and {
        caller: Principal;
    }) : Result<(), Text> {

      if (Principal.isAnonymous(args.caller)){
        return #err("Anonymous user not allowed");
      };

      let subaccount = Subaccount.fromPrincipal(args.caller);
      let account = { owner = backend_id; subaccount = ?subaccount; };

      Map.set(users.mapUsers, Map.phash, args.caller, { args with account; });
      Map.set(users.subaccToPrincipal, Map.bhash, subaccount, args.caller);
      #ok;
    };

    public func getUser(principal: Principal) : ?User {
      Map.get(users.mapUsers, Map.phash, principal)
    };

    public func createIntProp(
      args: IntPropInput and {
        caller: Principal;
        e8sIcpPrice: Nat;
        creationTime: Time;
    }) : async CreateIntPropResult {

      let account = switch (Map.get(users.mapUsers, Map.phash, args.caller)){
        // TODO sardariuss 2024-08-16: harmonize error types and messages
        case(null) { return #err(#GenericError({ error_code = 100; message = "User profile not found"; })); };
        case(?user) { user.account; };
      };

      let token_id = intProps.index;

      let mint_operation = await Icrc7Canister.icrcX_mint([{
        token_id;
        // TODO sardariuss 2024-08-07: somehow compilation fails if we use Conversions.intPropToMetadata
        metadata = #Class([{
          name = BIP721X_TAG;
          immutable = true;
          value = Conversions.intPropToValue(args);
        }]);
        owner = ?account;
        // We have the guarentee that the token_id will not already exist because:
        // - only the backend can mint tokens
        // - if the minting is successful, the index will always be increased
        // Hence override can be set to false
        override = false;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(args.creationTime));
      }]);

      if (mint_operation.size() != 1){
        return #err(#MintError);
      };

      switch(mint_operation[0]){
        case(#Err(err)){
          return #err(err);
        };
        case(#GenericError(err)){
          return #err(#GenericError(err));
        };
        case(#Ok(_)){};
      };

      // Set the price of the token
      Map.set(intProps.e8sIcpPrices, Map.nhash, token_id, args.e8sIcpPrice);

      // Increase the token ID index
      intProps.index += 1;

      #ok(token_id);
    };

    public func getE8sPrice({token_id: Nat}) : Result<Nat, Text> {
      switch(Map.get(intProps.e8sIcpPrices, Map.nhash, token_id)){
        case(null) { #err("Price not found"); };
        case(?price) { #ok(price); };
      };
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
      if(seller_account.owner != backend_id){
        return #err("Cannot transfer IP that does not belong to the backend");
      };

      // Retrieve the price of the IP
      let e8sPrice = switch(Map.get(intProps.e8sIcpPrices, Map.nhash, token_id)){
        case(null) { return #err("Price not found"); };
        case(?price) { price; };
      };

      // Transfer the ICP
      let icp_transfer = await transferIcp({
        from_subaccount = ?Subaccount.fromPrincipal(buyer);
        to = seller_account;
        amount = e8sPrice;
        time;
      });

      // If the ICP transfer was successful, transfer the IP
      // TODO sardariuss 2024-08-07: add a reimburse mechanism if the IP transfer failed
      let ip_transfer = switch(icp_transfer){
        case(#err(_)){ null; };
        case(#ok(_)){
          ?(await transferIp({
            from_subaccount = seller_account.subaccount;
            to = getUserAccount(buyer);
            token_id;
            time;
          }));
        };
      };

      #ok({ icp_transfer; ip_transfer; });
    };

    public func accountsToOwners(accounts: [?Account]) : [?(Principal, User)] {
      Array.map(accounts, func(opt_account: ?Account) : ?(Principal, User) {
        let account = switch(opt_account){
          case(null){ return null; };
          case(?acc) { acc; };
        };
        if (account.owner != backend_id){
          return null;
        };
        let subaccount = switch(account.subaccount){
          case(null){ return null; };
          case(?subacc) { subacc; };
        };
        let principal = switch(Map.get(users.subaccToPrincipal, Map.bhash, subaccount)){
          case(null){ return null; };
          case(?p) { p; };
        };
        let user = switch(Map.get(users.mapUsers, Map.phash, principal)){
          case(null){ return null; };
          case(?u) { u; };
        };
        ?(principal, user);
      });
    };

    public func getUserAccount(user: Principal) : Account {
      { owner = backend_id; subaccount = ?Subaccount.fromPrincipal(user); };
    };

    func transferIcp({
      from_subaccount: ?Blob;
      to: Account;
      amount: Nat;
      time: Time;
    }) : async Result<Nat, Text> {

      let transfer_args = {
        from_subaccount;
        to;
        amount;
        fee = null;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(time));
      };

      let icp_transfer = await IcpLedgerCanister.icrc1_transfer(transfer_args);

      switch(icp_transfer){
        case(#Err(err)){ #err("Transfer of ICP failed: " # debug_show(err)); };
        case(#Ok(tx_id)){ #ok(tx_id); };
      };
    };

    func transferIp({
      from_subaccount: ?Blob;
      to: Account;
      token_id: Nat;
      time: Time;
    }) : async Result<Nat, Text> {

      let transfer_args = {
        from_subaccount;
        to;
        token_id;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(time));
      };

      let icrc7_transfers = await Icrc7Canister.icrc7_transfer([transfer_args]);

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

  };

};
