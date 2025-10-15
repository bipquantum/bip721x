import Map "mo:map/Map";
import Set "mo:map/Set";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Nat64 "mo:base/Nat64";

import V0_8_0 "./Types";
import MigrationTypes "../Types";

module {

  // do not forget to change these types when you add a new migration
  type State = V0_8_0.State;
  type Args = V0_8_0.Args;
  type InitArgs = V0_8_0.InitArgs;
  type UpgradeArgs = V0_8_0.UpgradeArgs;
  type DowngradeArgs = V0_8_0.DowngradeArgs;

  public func init(args: InitArgs): MigrationTypes.State {
    #v0_8_0({
      users = Map.new<Principal, V0_8_0.User>();
      airdrop = {
        var allowed_per_user = args.airdrop_per_user;
        var total_distributed = 0;
        map_distributed = Map.new<Principal, Nat>();
      };
      intProps = {
        var index = 0;
        e6sUsdtPrices = Map.new<Nat, Nat>();
      };
      chatHistories = {
        histories = Map.new<Text, V0_8_0.ChatHistory>();
        byPrincipal = Map.new<Principal, Set.Set<Text>>();
      };
      e6sTransferFee = args.ckusdt_transfer_fee;
      accessControl = {
        var admin = args.admin;
        moderators = Set.new<Principal>();
        bannedIps = Set.new<Nat>();
      };
      chatbot_api_key = args.chatbot_api_key;
      notifications = {
        var nextId = 0;
        byPrincipal = Map.new<Principal, [V0_8_0.Notification]>();
      };
      ckusdtRate = {
        var usd_price = args.ckusdt_rate.usd_price;
        var decimals = args.ckusdt_rate.decimals;
        var last_update = Time.now();
      };
        usageByUser = Map.new<Principal, V0_8_0.UserUsage>();
    });
  };

  public func upgrade(migration_state: MigrationTypes.State, args: UpgradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch(migration_state) {
      case (#v0_7_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_7_0 expected)")
    };

    #v0_8_0({ state with
        usageByUser = Map.new<Principal, V0_8_0.UserUsage>();
    });
  };

  public func downgrade(migration_state: MigrationTypes.State, args: DowngradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch (migration_state) {
      case (#v0_8_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_8_0 expected)")
    };

    #v0_7_0({
      users = state.users;
      airdrop = state.airdrop;
      intProps = state.intProps;
      chatHistories = state.chatHistories;
      e6sTransferFee = state.e6sTransferFee;
      accessControl = state.accessControl;
      chatbot_api_key = state.chatbot_api_key;
      notifications = state.notifications;
      ckusdtRate = state.ckusdtRate;
    });
  };

};