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

import ICRC7             "mo:icrc7-mo";

import Icrc7Canister     "canister:icrc7";
import IcpLedgerCanister "canister:icp_ledger";

module {

  let BIP721X_TAG          = Types.BIP721X_TAG;

  type User                = Types.User;
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
  }) {

    public func setUser(
      args: User and {
        caller: Principal;
    }) : Result<(), Text> {

      if (Principal.isAnonymous(args.caller)){
        return #err("Cannot create a user with from anonymous principal");
      };

      Map.set(users.mapUsers, Map.phash, args.caller, args);
      #ok;
    };

    public func getUser(principal: Principal) : ?User {
      Map.get(users.mapUsers, Map.phash, principal)
    };

    public func createIntProp(
      args: IntPropInput and {
        author: Principal;
    }) : async CreateIntPropResult {

      if (not Map.has(users.mapUsers, Map.phash, args.author)){
        return #err(#GenericError({ error_code = 100; message = "A user profile is required to mint a new IP"; }));
      };

      let id = intProps.index;

      let mint_operation = await Icrc7Canister.icrcX_mint([{
        token_id = id;
        // TODO sardariuss 2024-AUG-07: somehow compilation fails if we use Conversions.intPropToMetadata
        metadata = #Class([{
          name = BIP721X_TAG;
          immutable = true;
          value = Conversions.intPropToValue(args);
        }]);
        owner = ?{
          owner = args.author;
          subaccount = null;
        };
        // We have the guarentee that the id will not already exist because:
        // - only the backend can mint tokens
        // - if the minting is successful, the index will always be increased
        // Hence override can be set to false
        override = false;
        memo = null;
        created_at_time = null;
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

      #ok(id);
    };

    public func listIntProp({
      caller: Principal;
      id: Nat;
      e8sIcpPrice: Nat;
    }) : async* Result<(), Text> {
      
      let owner = switch(await* findIntPropOwner(id)){
        case(#err(err)){ return #err(err); };
        case(#ok(principal)){ principal; };
      };

      if (owner != caller){
        return #err("You cannot list an IP that you do not own");
      };

      Map.set(intProps.e8sIcpPrices, Map.nhash, id, e8sIcpPrice);
      #ok;
    };

    public func unlistIntProp({
      caller: Principal;
      id: Nat;
    }) : async* Result<(), Text> {

      let owner = switch(await* findIntPropOwner(id)){
        case(#err(err)){ return #err(err); };
        case(#ok(principal)){ principal; };
      };

      if (owner != caller){
        return #err("You cannot unlist an IP that you do not own");
      };

      Map.delete(intProps.e8sIcpPrices, Map.nhash, id);
      #ok;
    };

    public func filterListedIntProps({ids: [Nat]}) : [Nat] {
      let buffer = Buffer.Buffer<Nat>(0);
      for (id in Array.vals(ids)){
        if (Map.has(intProps.e8sIcpPrices, Map.nhash, id)){
          buffer.add(id);
        };
      };
      Buffer.toArray(buffer);
    };

    public func getE8sPrice({id: Nat}) : Result<Nat, Text> {
      switch(Map.get(intProps.e8sIcpPrices, Map.nhash, id)){
        case(null) { #err("IP is not listed"); };
        case(?price) { #ok(price); };
      };
    };

    public func buyIntProp({
      buyer: Principal;
      id: Nat;
      time: Time;
    }) : async* Result<BuyIntPropResult, Text> {

      // Verify the IP is listed
      let e8s_price = switch(getE8sPrice({id})){
        case(#err(err)){ return #err(err); };
        case(#ok(price)){ price; };
      };

      // Find the seller of the IP
      let seller = switch(await* findIntPropOwner(id)){
        case(#err(err)){ return #err(err); };
        case(#ok(principal)){ principal; };
      };

      // Verify the buyer is not the seller
      if (seller == buyer){
        return #err("You cannot buy your own IP");
      };

      let buyer_account = {
        owner = buyer;
        subaccount = null;
      };

      let seller_account = {
        owner = seller;
        subaccount = null;
      };

      // Transfer the ICP to the seller account, assumed to be the same for ICP for now
      let icp_transfer = await transferIcp({
        from = buyer_account;
        to = seller_account;
        amount = e8s_price;
        time;
      });

      // If the ICP transfer was successful, transfer the IP
      // TODO sardariuss 2024-AUG-07: add a reimburse mechanism if the IP transfer failed
      let ip_transfer = switch(icp_transfer){
        case(#err(_)){ null; };
        case(#ok(_)){
          ?(await transferIp({
            from = seller_account;
            to = buyer_account;
            token_id = id;
            time;
          }));
        };
      };

      // Remove the IP from the list of listed IPs
      Map.delete(intProps.e8sIcpPrices, Map.nhash, id);

      #ok({ icp_transfer; ip_transfer; });
    };

    func findIntPropOwner(id: Nat) : async* Result<Principal, Text> {
      let owners = await Icrc7Canister.icrc7_owner_of([id]);
      if (owners.size() != 1){
        return #err("Owner not found");
      };
      let account = switch(owners[0]){
        case(null) { return #err("Owner not found"); };
        case(?acc) { acc; };
      };
      #ok(account.owner);
    };

    func transferIcp({
      from: Account;
      to: Account;
      amount: Nat;
      time: Time;
    }) : async Result<Nat, Text> {

      let transfer_args = {
        from;
        spender_subaccount = null;
        to;
        amount;
        fee = null;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(time));
      };

      let transfer = await IcpLedgerCanister.icrc2_transfer_from(transfer_args);

      switch(transfer){
        case(#Err(err)){ #err("Transfer of ICP failed: " # debug_show(err)); };
        case(#Ok(tx_id)){ #ok(tx_id); };
      };
    };

    func transferIp({
      from: Account;
      to: Account;
      token_id: Nat;
      time: Time;
    }) : async Result<Nat, Text> {

      let transfer_args = {
        spender_subaccount = null;
        from;
        to;
        token_id;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(time));
      };

      let transfers = await Icrc7Canister.icrc37_transfer_from([transfer_args]);

      if (transfers.size() != 1){
        return #err("Transfer of IP failed");
      };
      
      let transfer = switch(transfers[0]){
        case(null) { return #err("Transfer of IP failed"); };
        case(?tx) { tx };
      };
      
      switch(transfer) {
        case(#Err(err)){ #err("Transfer of IP failed: " # debug_show(err)); };
        case(#Ok(tx_id)){ #ok(tx_id); };
      };
    };

    public func accountsToOwners(accounts: [?Account]) : [?(Principal, ?User)] {
      Array.map(accounts, func(opt_account: ?Account) : ?(Principal, ?User) {
        let owner = switch(opt_account){
          case(null){ return null; };
          case(?account) { account.owner; };
        };
        let user = Map.get(users.mapUsers, Map.phash, owner);
        ?(owner, user);
      });
    };

  };

};
