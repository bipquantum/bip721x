import Principal         "mo:base/Principal";
import Result            "mo:base/Result";
import Map               "mo:map/Map";
import Array             "mo:base/Array";
import Buffer            "mo:base/Buffer";

import Types             "Types";
import Conversions       "intprop/Conversions";
import TradeManager      "TradeManager";

import ICRC7             "mo:icrc7-mo";

import Icrc7Canister     "canister:icrc7";

module {

  let BIP721X_TAG          = Types.BIP721X_TAG;

  type User                = Types.User;
  type UserRegister        = Types.UserRegister;
  type Result<Ok, Err>     = Result.Result<Ok, Err>;
  type IntPropRegister     = Types.IntPropRegister;
  type IntPropInput        = Types.IntPropInput;
  type IntProp             = Types.IntProp;
  type CreateIntPropResult = Types.CreateIntPropResult;
  type Time                = Int;

  type Account             = ICRC7.Account;

  public class Controller({
    users: UserRegister;
    intProps: IntPropRegister;
    trade_manager: TradeManager.TradeManager;
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
          value = Conversions.intPropToValue(#V1(args));
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
    }) : async* Result<(), Text> {

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

      // Perform the trade
      let trade = await* trade_manager.tradeIntProp({
        buyer = {
          owner = buyer;
          subaccount = null;
        };
        seller = {
          owner = seller;
          subaccount = null;
        };
        token_id = id;
        e8s_price = e8s_price;
      });

      switch(trade){
        case(#err(err)){ #err(err); };
        case(#ok){
          // Remove the IP from the list of listed IPs
          Map.delete(intProps.e8sIcpPrices, Map.nhash, id);
          #ok;
        };
      };
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

    public func extractOwner(accounts: [?Account]) : ?Principal {
      if (accounts.size() != 1){
        return null;
      };
      switch(accounts[0]){
        case(null) { return null; };
        case(?account) { ?account.owner; };
      };
    };

    public func extractOwners(accounts: [?Account]) : [?Principal] {
      Array.map(accounts, func(opt_account: ?Account) : ?Principal {
        switch(opt_account){
          case(null){ return null; };
          case(?account) { ?account.owner; };
        };
      });
    };

  };

};
