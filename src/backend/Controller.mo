import Principal         "mo:base/Principal";
import Result            "mo:base/Result";
import Map               "mo:map/Map";
import Int               "mo:base/Int";
import Time              "mo:base/Time";
import Nat64             "mo:base/Nat64";
import Array             "mo:base/Array";
import Buffer            "mo:base/Buffer";

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
        author: Principal;
        publishingDate: Time;
    }) : async CreateIntPropResult {

      let account = switch (Map.get(users.mapUsers, Map.phash, args.author)){
        // TODO sardariuss 2024-AUG-16: harmonize error types and messages
        case(null) { return #err(#GenericError({ error_code = 100; message = "User profile not found"; })); };
        case(?user) { user.account; };
      };

      let intPropId = intProps.index;

      let mint_operation = await Icrc7Canister.icrcX_mint([{
        token_id = intPropId;
        // TODO sardariuss 2024-AUG-07: somehow compilation fails if we use Conversions.intPropToMetadata
        metadata = #Class([{
          name = BIP721X_TAG;
          immutable = true;
          value = Conversions.intPropToValue(args);
        }]);
        owner = ?account;
        // We have the guarentee that the intPropId will not already exist because:
        // - only the backend can mint tokens
        // - if the minting is successful, the index will always be increased
        // Hence override can be set to false
        override = false;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(args.publishingDate));
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

      // Increase the token ID index
      intProps.index += 1;

      #ok(intPropId);
    };

    public func listIntProp({
      caller: Principal;
      intPropId: Nat;
      e8sIcpPrice: Nat;
    }) : async Result<(), Text> {
      
      let ownerAccount = switch(await getOwnerAccount(intPropId)){
        case(#err(err)){ return #err(err); };
        case(#ok(acc)){ acc; };
      };

      if (ownerAccount.subaccount != ?Subaccount.fromPrincipal(caller)){
        return #err("Caller is not the owner of the IP");
      };

      Map.set(intProps.e8sIcpPrices, Map.nhash, intPropId, e8sIcpPrice);
      #ok;
    };

    public func delistIntProp({
      caller: Principal;
      intPropId: Nat;
    }) : async Result<(), Text> {

      let ownerAccount = switch(await getOwnerAccount(intPropId)){
        case(#err(err)){ return #err(err); };
        case(#ok(acc)){ acc; };
      };

      if (ownerAccount.subaccount != ?Subaccount.fromPrincipal(caller)){
        return #err("Caller is not the owner of the IP");
      };

      Map.delete(intProps.e8sIcpPrices, Map.nhash, intPropId);
      #ok;
    };

    public func filterListedIntProps({intPropIds: [Nat]}) : [Nat] {
      let buffer = Buffer.Buffer<Nat>(0);
      for (intPropId in Array.vals(intPropIds)){
        if (Map.has(intProps.e8sIcpPrices, Map.nhash, intPropId)){
          buffer.add(intPropId);
        };
      };
      Buffer.toArray(buffer);
    };

    public func getE8sPrice({intPropId: Nat}) : Result<Nat, Text> {
      switch(Map.get(intProps.e8sIcpPrices, Map.nhash, intPropId)){
        case(null) { #err("IP is not listed"); };
        case(?price) { #ok(price); };
      };
    };

    public func buyIntProp({
      buyer: Principal;
      intPropId: Nat;
      time: Time;
    }) : async Result<BuyIntPropResult, Text> {

      // Find the seller of the IP
      let sellerAccount = switch(await getOwnerAccount(intPropId)){
        case(#err(err)){ return #err(err); };
        case(#ok(acc)){ acc; };
      };

      // Get the buyer account (assumed to be the same for ICPs and IPs)
      // TODO: sardariuss 2024-SEP-03: allow to have different accounts for ICPs and IPs
      let buyerAccount = getUserAccount(buyer);
      if (buyerAccount.subaccount == sellerAccount.subaccount){
        return #err("Cannot buy IP from yourself");
      };

      // Retrieve the price of the IP
      let e8sPrice = switch(Map.get(intProps.e8sIcpPrices, Map.nhash, intPropId)){
        case(null) { return #err("Price not found"); };
        case(?price) { price; };
      };

      // Transfer the ICP to the seller account, assumed to be the same for ICP for now
      let icp_transfer = await transferIcp({
        from_subaccount = buyerAccount.subaccount;
        to = sellerAccount;
        amount = e8sPrice;
        time;
      });

      // If the ICP transfer was successful, transfer the IP
      // TODO sardariuss 2024-AUG-07: add a reimburse mechanism if the IP transfer failed
      let ip_transfer = switch(icp_transfer){
        case(#err(_)){ null; };
        case(#ok(_)){
          ?(await transferIp({
            from_subaccount = sellerAccount.subaccount;
            to = buyerAccount;
            token_id = intPropId;
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

    func getOwnerAccount(intPropId: Nat) : async Result<Account, Text> {
      
      // Find the account of the owner of the IP
      let owners = await Icrc7Canister.icrc7_owner_of([intPropId]);
      if (owners.size() != 1){
        return #err("Owner not found");
      };
      let account = switch(owners[0]){
        case(null) { return #err("Owner not found"); };
        case(?acc) { acc; };
      };

      // Verify the seller account is owned by the backend
      if(account.owner != backend_id){
        return #err("Cannot transfer IP that does not belong to the backend");
      };

      #ok(account);
    };

  };

};
