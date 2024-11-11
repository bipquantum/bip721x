import Types             "Types";
import Conversions       "intprop/Conversions";
import TradeManager      "TradeManager";
import ChatBotHistory    "ChatBotHistory";

import BIP721Ledger      "canister:bip721_ledger";
import BQCLedger         "canister:bqc_ledger";

import Set               "mo:map/Set";
import ICRC7             "mo:icrc7-mo";

import Principal         "mo:base/Principal";
import Result            "mo:base/Result";
import Map               "mo:map/Map";
import Array             "mo:base/Array";
import Buffer            "mo:base/Buffer";
import Option            "mo:base/Option";
import Int               "mo:base/Int";
import Time              "mo:base/Time";
import Nat64             "mo:base/Nat64";

module {

  let BIP721X_TAG          = Types.BIP721X_TAG;

  type User                = Types.User;
  type Result<Ok, Err>     = Result.Result<Ok, Err>;
  type IntPropRegister     = Types.IntPropRegister;
  type IntPropInput        = Types.IntPropInput;
  type IntProp             = Types.IntProp;
  type ChatHistory         = Types.ChatHistory;
  type CreateIntPropResult = Types.CreateIntPropResult;
  type Airdrop             = Types.Airdrop;
  type SAirdropInfo        = Types.SAirdropInfo;
  type AccessControl       = Types.AccessControl;
  type Time                = Int;

  type Account             = ICRC7.Account;

  public class Controller({
    accessControl: AccessControl;
    users: Map.Map<Principal, User>;
    intProps: IntPropRegister;
    chatBotHistory: ChatBotHistory.ChatBotHistory;
    tradeManager: TradeManager.TradeManager;
    airdrop: Airdrop;
  }) {

    public func setUser(
      args: User and {
        caller: Principal;
    }) : Result<(), Text> {

      if (Principal.isAnonymous(args.caller)){
        return #err("Cannot create a user with from anonymous principal");
      };

      Map.set(users, Map.phash, args.caller, args);
      #ok;
    };

    public func getUser(principal: Principal) : ?User {
      Map.get(users, Map.phash, principal)
    };

    public func getChatHistories({
      caller: Principal;
    }) : [ChatHistory] {
      chatBotHistory.getChatHistories({caller});
    };
    
    public func getChatHistory({
      caller: Principal;
      id: Text;
    }) : Result<ChatHistory, Text> {
      chatBotHistory.getChatHistory({caller; id});
    };

    public func createChatHistory({
      caller: Principal;
      id: Text;
      version: Text;
      date: Time;
      name: Text;
    }) : Result<(), Text> {
      chatBotHistory.createChatHistory({caller; id; version; date; name;});
    };

    public func deleteChatHistory({
      caller: Principal;
      id: Text;
    }) : Result<(), Text> {
      chatBotHistory.deleteChatHistory({caller; id});
    };

    public func updateChatHistory({
      caller: Principal;
      id: Text;
      events: Text;
      aiPrompts: Text;
    }) : Result<(), Text> {
      chatBotHistory.updateChatHistory({caller; id; events; aiPrompts});
    };

    public func renameChatHistory({
      caller: Principal;
      id: Text;
      name: Text;
    }) : Result<(), Text> {
      chatBotHistory.renameChatHistory({caller; id; name});
    };

    public func createIntProp(
      args: IntPropInput and {
        author: Principal;
    }) : async CreateIntPropResult {

      if (not Map.has(users, Map.phash, args.author)){
        return #err(#GenericError({ error_code = 100; message = "A user profile is required to mint a new IP"; }));
      };

      let id = intProps.index;

      let mint_operation = await BIP721Ledger.icrcX_mint([{
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
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
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

    public func getListedIntProps({
      prev: ?Nat;
      take: ?Nat;
    }) : [Nat] {
      var listed_ids = Buffer.Buffer<Nat>(0);
      for (key in Map.keysFrom(intProps.e8sIcpPrices, Map.nhash, prev)){
        switch(take){
          case(null) {};
          case(?take) {
            if (listed_ids.size() >= take){
              return Buffer.toArray(listed_ids);
            };
          };
        };
        listed_ids.add(key);
      };
      Buffer.toArray(listed_ids);
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

      let metadata = await BIP721Ledger.icrc7_token_metadata([id]);

      if (metadata.size() != 1){
        return #err("IP not found");
      };

      let intProp = switch(Conversions.metadataToIntProp(metadata[0])){
        case(#V1(ip)) { ip; };
      };
      
      let royalties = Option.map(
        intProp.percentageRoyalties,
        func(percentage : Nat) : { receiver: Principal; percentage: Nat; } {
          { receiver = intProp.author; percentage; };
        });

      // Perform the trade
      let trade = await* tradeManager.tradeIntProp({
        buyer = {
          owner = buyer;
          subaccount = null;
        };
        seller = {
          owner = seller;
          subaccount = null;
        };
        royalties;
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
      let owners = await BIP721Ledger.icrc7_owner_of([id]);
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

    public func airdropUser(principal: Principal) : async Result<Nat, Text> {

      if (Principal.isAnonymous(principal)){
        return #err("Cannot airdrop to an anonymous principal");
      };

      let distributed : Int = Option.get(Map.get(airdrop.map_distributed, Map.phash, principal), 0);
      
      let difference = airdrop.allowed_per_user - distributed;
      
      if (difference <= 0) {
        return #err("Already airdropped user to the maximum allowed!");
      };

      let amount = Int.abs(difference);

      let transfer = await BQCLedger.icrc1_transfer({
        from_subaccount = null;
        to = {
          owner = principal;
          subaccount = null;
        };
        amount;
        fee = null;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
      });

      switch(transfer){
        case(#Err(err)){ 
          #err("Airdrop transfer failed: " # debug_show(err)); 
        };
        case(#Ok(_)){
          Map.set(airdrop.map_distributed, Map.phash, principal, airdrop.allowed_per_user);
          airdrop.total_distributed += amount;
          #ok(amount); 
        };
      };

    };

    public func isAirdropAvailable(principal: Principal) : Bool {

      if (Principal.isAnonymous(principal)){
        return false;
      };
      
      let distributed : Int = Option.get(Map.get(airdrop.map_distributed, Map.phash, principal), 0);
      
      let difference = airdrop.allowed_per_user - distributed;
      
      difference > 0;
    };

    public func getAirdropInfo(): SAirdropInfo {
      return {
        allowed_per_user = airdrop.allowed_per_user;
        total_distributed = airdrop.total_distributed;
        map_distributed = Map.toArray(airdrop.map_distributed) 
      };
    };

    public func setAirdropPerUser({ amount : Nat; }) {
      airdrop.allowed_per_user := amount;
    };

    public func tagSensitiveIntProp({ caller: Principal; id: Nat; sensitive: Bool;}) : Result<(), Text> {
      if (caller != accessControl.admin and not Set.has(accessControl.moderators, Set.phash, caller)){
        return #err("Only the admin or moderators can tag an IP as sensitive");
      };
      if (sensitive){
        Set.add(accessControl.sensitiveIps, Set.nhash, id);
      } else {
        Set.delete(accessControl.sensitiveIps, Set.nhash, id);
      };
      #ok;
    };

    public func isSensitiveIntProp({ id: Nat; }) : Bool {
      Set.has(accessControl.sensitiveIps, Set.nhash, id);
    };

    public func getSensitiveIntProps() : [Nat] {
      Set.toArray(accessControl.sensitiveIps);
    };

    public func setAdmin({ caller: Principal; admin: Principal; }) : Result<(), Text> {
      if (caller != accessControl.admin){
        return #err("Only the admin can set a new admin");
      };
      accessControl.admin := admin;
      #ok;
    };

    public func getAdmin() : Principal {
      accessControl.admin;
    };

    public func addModerator({ caller: Principal; moderator: Principal; }) : Result<(), Text> {
      if (caller != accessControl.admin){
        return #err("Only the admin can add a moderator");
      };
      Set.add(accessControl.moderators, Set.phash, moderator);
      #ok;
    };

    public func removeModerator({ caller: Principal; moderator: Principal; }) : Result<(), Text> {
      if (caller != accessControl.admin){
        return #err("Only the admin can remove a moderator");
      };
      Set.delete(accessControl.moderators, Set.phash, moderator);
      #ok;
    };

    public func getModerators() : [Principal] {
      Set.toArray(accessControl.moderators);
    };

  };

};
