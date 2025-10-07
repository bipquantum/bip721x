import Types             "Types";
import Conversions       "intprop/Conversions";
import TradeManager      "TradeManager";
import ChatBotHistory    "ChatBotHistory";
import ChatBot           "ChatBot";

import BIP721Ledger      "canister:bip721_ledger";
import BQCLedger         "canister:bqc_ledger";
import ExchangeRate      "canister:exchange_rate";

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
import Timer             "mo:base/Timer";
import Cycles            "mo:base/ExperimentalCycles";
import Debug             "mo:base/Debug";
import Error             "mo:base/Error";

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
  type QueryDirection      = Types.QueryDirection;
  type CreateUserArgs      = Types.CreateUserArgs;
  type Notification        = Types.Notification;
  type NotificationType    = Types.NotificationType;
  type NotificationState   = Types.NotificationState;
  type Notifications       = Types.Notifications;
  type CkUsdtRate           = Types.CkUsdtRate;
  type SCkUsdtRate          = Types.SCkUsdtRate;
  type Time                = Int;

  type Account             = ICRC7.Account;

  public class Controller({
    accessControl: AccessControl;
    users: Map.Map<Principal, User>;
    intProps: IntPropRegister;
    chatBotHistory: ChatBotHistory.ChatBotHistory;
    tradeManager: TradeManager.TradeManager;
    airdrop: Airdrop;
    chatBot: ChatBot.ChatBot;
    notifications: Notifications;
    ckusdtRate: CkUsdtRate;
  }) {

    var priceUpdateTimer : ?Timer.TimerId = null;

    public func setUser(
      args: CreateUserArgs and {
      caller: Principal;
    }) : Result<(), Text> {

      if (Principal.isAnonymous(args.caller)){
        return #err("Cannot create a user with from anonymous principal");
      };

      Map.set(users, Map.phash, args.caller, { args with banned = false; });
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

      switch(Map.get(users, Map.phash, args.author)){
        case(null) {
          return #err(#GenericError({ error_code = 100; message = "A user profile is required to mint a new IP"; }));
        };
        case(?user) {
          if (user.banned){
            return #err(#GenericError({ error_code = 101; message = "Blacklisted users cannot mint new IPs"; }));
          };
        };
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
      e6sUsdtPrice: Nat;
    }) : async* Result<(), Text> {
      
      let #ok(owner) = await* findIntPropOwner(id) 
        else return #err("Failed to find owner");

      if (owner != caller) {
        return #err("You cannot list an IP that you do not own");
      };

      if (Set.has(accessControl.bannedIps, Set.nhash, id)) {
        return #err("You cannot list a banned IP");
      };

      Map.set(intProps.e6sUsdtPrices, Map.nhash, id, e6sUsdtPrice);
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

      Map.delete(intProps.e6sUsdtPrices, Map.nhash, id);
      #ok;
    };

    public func getListedIntProps({
      prev: ?Nat;
      take: ?Nat;
      direction: QueryDirection;
    }) : [Nat] {
      let iter_keys = switch(direction){
        case(#FORWARD) { Map.keysFrom; };
        case(#BACKWARD) { Map.keysFromDesc; };
      };
      let listed_ids = Buffer.Buffer<Nat>(0);
      for (key in iter_keys(intProps.e6sUsdtPrices, Map.nhash, prev)){
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

    public func isListedIntProp(id: Nat) : Bool {
      Map.has(intProps.e6sUsdtPrices, Map.nhash, id);
    };

    public func getE6sPrice({id: Nat}) : Result<Nat, Text> {
      switch(Map.get(intProps.e6sUsdtPrices, Map.nhash, id)){
        case(null) { #err("IP is not listed"); };
        case(?price) { #ok(price); };
      };
    };

    public func buyIntProp({
      buyer: Principal;
      id: Nat;
    }) : async* Result<(), Text> {

      // Verify the IP is listed
      let e6s_price = switch(getE6sPrice({id})){
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

      let intProp = switch(await* queryIntProp(id)){
        case(#err(err)){ return #err(err); };
        case(#ok(ip)){ ip; };
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
        e6s_price = e6s_price;
      });

      switch(trade){
        case(#err(err)){ #err(err); };
        case(#ok){
          // Remove the IP from the list of listed IPs
          Map.delete(intProps.e6sUsdtPrices, Map.nhash, id);
          
          // Create notification for seller about IP purchase
          createNotification(seller, #IP_PURCHASED({
            ipId = id;
            buyer = buyer;
            price = e6s_price;
          }));

          // Create notification for original creator about royalty if applicable
          switch (royalties) {
            case (?{receiver; percentage}) {
              if (receiver != seller) { // Only notify if creator is different from seller
                let royaltyAmount = (e6s_price * percentage) / 100;
                if (royaltyAmount > 0) {
                  createNotification(receiver, #ROYALTY_RECEIVED({
                    ipId = id;
                    amount = royaltyAmount;
                    fromSale = buyer;
                  }));
                };
              };
            };
            case null { };
          };
          
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

    func queryIntProp(id: Nat) : async* Result<IntProp, Text> {
      
      let metadata = await BIP721Ledger.icrc7_token_metadata([id]);

      if (metadata.size() != 1){
        return #err("IP not found");
      };

      switch(Conversions.metadataToIntProp(metadata[0])){
        case(#V1(ip)) { #ok(ip); };
      };
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

    public func getNumberOfUsers() : Nat {
      Map.size(users);
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

    public func banIntProp({ 
      caller: Principal;
      id: Nat;
      ban_author: Bool;
    }) : async* Result<(), Text> {
      if (caller != accessControl.admin and not Set.has(accessControl.moderators, Set.phash, caller)){
        return #err("Only the admin or moderators can ban or unban IPs");
      };
      // Add it to the banned IPs
      Set.add(accessControl.bannedIps, Set.nhash, id);
      // Remove it from the marketplace if it is currently listed
      Map.delete(intProps.e6sUsdtPrices, Map.nhash, id);
      // Ban the author
      if (ban_author) {
        let author = switch(await* queryIntProp(id)){
          case(#err(err)){ return #err(err); };
          case(#ok(ip)){ ip.author; };
        };
        ignore Map.update(users, Map.phash, author, func(_: Principal, user: ?User) : ?User {
          switch(user){
            case(null) { return null; };
            case(?user) { ?{ user with banned = true; }; };
          };
        });
      };
      #ok;
    };

    public func unbanIntProp({
      caller: Principal;
      id: Nat;
    }) : async* Result<(), Text> {
      if (caller != accessControl.admin and not Set.has(accessControl.moderators, Set.phash, caller)){
        return #err("Only the admin or moderators can ban or unban IPs");
      };
      Set.delete(accessControl.bannedIps, Set.nhash, id);
      #ok;
    };

    public func isBannedIntProp({ id: Nat; }) : Bool {
      Set.has(accessControl.bannedIps, Set.nhash, id);
    };

    public func getBannedIntProps() : [Nat] {
      Set.toArray(accessControl.bannedIps);
    };

    public func banAuthor({
      caller: Principal;
      author: Principal;
    }) : async* Result<(), Text> {
      
      if (caller != accessControl.admin and not Set.has(accessControl.moderators, Set.phash, caller)){
        return #err("Only the admin or moderators can ban or unban an author");
      };

      // Ban the author
      ignore Map.update(users, Map.phash, author, func(_: Principal, user: ?User) : ?User {
        switch(user){
          case(null) { return null; };
          case(?user) { ?{ user with banned = true; }; };
        };
      });

      // Get all the IPs of the author
      let intPropIds = await BIP721Ledger.icrc7_tokens_of({
        owner = author;
        subaccount = null;
      }, null, null);

      // Remove them from the marketplace
      for (id in intPropIds.vals()){
        Map.delete(intProps.e6sUsdtPrices, Map.nhash, id);
      };

      #ok;
    };

    public func unbanAuthor({
      caller: Principal;
      author: Principal;
    }) : Result<(), Text> {
      if (caller != accessControl.admin and not Set.has(accessControl.moderators, Set.phash, caller)){
        return #err("Only the admin or moderators can ban or unban an author");
      };
      ignore Map.update(users, Map.phash, author, func(_: Principal, user: ?User) : ?User {
        switch(user){
          case(null) { return null; };
          case(?user) { ?{ user with banned = false; }; };
        };
      });
      #ok;
    };

    public func isBannedAuthor({
      author: Principal;
    }) : Bool {
      switch(Map.get(users, Map.phash, author)){
        case(null) { false; };
        case(?user) { user.banned; };
      };
    };

    public func getBannedAuthors() : [(Principal, User)] {
      Map.toArray(Map.mapFilter<Principal, User, User>(users, Map.phash, func(_: Principal, user: User) : ?User {
        if (user.banned){
          return ?user;
        } else {
          return null;
        };
      }));
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

    public func chatbot_completion({body: Blob}) : async* ChatBot.HttpResponse {
      await* chatBot.get_completion(body);
    };

    // ================================ NOTIFICATIONS ================================

    public func createNotification(recipient: Principal, notificationType: NotificationType) {
      let notification: Notification = {
        id = notifications.nextId;
        notificationType = notificationType;
        state = #UNREAD;
        timestamp = Time.now();
        recipient = recipient;
      };

      let existingNotifications = Map.get(notifications.byPrincipal, Map.phash, recipient) |> Option.get(_, []);
      let updatedNotifications = Array.append(existingNotifications, [notification]);
      
      ignore Map.put(notifications.byPrincipal, Map.phash, recipient, updatedNotifications);
      notifications.nextId += 1;
    };

    public func getUserNotifications(user: Principal) : [Notification] {
      Map.get(notifications.byPrincipal, Map.phash, user) |> Option.get(_, []);
    };

    public func markNotificationAsRead(user: Principal, notificationId: Nat) {
      
      let userNotifications = switch(Map.get(notifications.byPrincipal, Map.phash, user)) {
        case (null) { return; };
        case (?notifications) { notifications };
      };
      
      let updatedNotifications = Array.map<Notification, Notification>(userNotifications, func(notification) {
        if (notification.id == notificationId) {
          {
            id = notification.id;
            notificationType = notification.notificationType;
            state = #READ;
            timestamp = notification.timestamp;
            recipient = notification.recipient;
          }
        } else {
          notification
        }
      });
          
      Map.set(notifications.byPrincipal, Map.phash, user, updatedNotifications);
    };

    public func startPriceUpdateTimer() : async () {
      if (priceUpdateTimer != null) {
        Debug.trap("Price update timer is already running");
      };
      priceUpdateTimer := ?Timer.recurringTimer<system>(
        #seconds(15 * 60), // 15 minutes in seconds
        func () : async () {
          await updateCkUsdtPrice();
        }
      );
    };

    public func updateCkUsdtPrice() : async () {
      try {

        let cyclesToSend = 5_000_000_000; // 5B cycles upper bound
        Cycles.add<system>(cyclesToSend);
        
        let result = await ExchangeRate.get_exchange_rate({
          base_asset = {
            symbol = "ckUSDT";
            class_ = #Cryptocurrency;
          };
          quote_asset = {
            symbol = "USD";
            class_ = #FiatCurrency;
          };
          timestamp = null;
        });
        
        switch (result) {
          case (#Ok(exchangeRate)) {
            ckusdtRate.usd_price := exchangeRate.rate;
            ckusdtRate.last_update := Time.now();
          };
          case (#Err(error)) {
            Debug.print("Failed to fetch ckUSDT price: " # debug_show(error));
          };
        };
      } catch (error) {
        Debug.print("Error fetching ckUSDT price: " # debug_show(Error.message(error)));
      };
    };

    public func getCkUsdtUsdPrice() : SCkUsdtRate {
      {
        usd_price = ckusdtRate.usd_price;
        last_update = ckusdtRate.last_update;
      };
    };

  };

};
