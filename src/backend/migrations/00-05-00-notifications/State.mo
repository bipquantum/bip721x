import Map "mo:map/Map";
import Set "mo:map/Set";
import Debug "mo:base/Debug";

import V0_5_0 "./Types";
import MigrationTypes "../Types";

module {

  // do not forget to change these types when you add a new migration
  type State = V0_5_0.State;
  type Args = V0_5_0.Args;
  type InitArgs = V0_5_0.InitArgs;
  type UpgradeArgs = V0_5_0.UpgradeArgs;
  type DowngradeArgs = V0_5_0.DowngradeArgs;

  public func init(args: InitArgs): MigrationTypes.State {
    #v0_5_0({
      users = Map.new<Principal, V0_5_0.User>();
      airdrop = {
        var allowed_per_user = args.airdrop_per_user;
        var total_distributed = 0;
        map_distributed = Map.new<Principal, Nat>();
      };
      intProps = {
        var index = 0;
        e8sIcpPrices = Map.new<Nat, Nat>();
      };
      chatHistories = {
        histories = Map.new<Text, V0_5_0.ChatHistory>();
        byPrincipal = Map.new<Principal, Set.Set<Text>>();
      };
      e8sTransferFee = args.e8sTransferFee;
      accessControl = {
        var admin = args.admin;
        moderators = Set.new<Principal>();
        bannedIps = Set.new<Nat>();
      };
      chatbot_api_key = args.chatbot_api_key;
      notifications = {
        var nextId = 0;
        byPrincipal = Map.new<Principal, [V0_5_0.Notification]>();
      };
    });
  };

  public func upgrade(migration_state: MigrationTypes.State, _: UpgradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch(migration_state) {
      case (#v0_4_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_4_0 expected)") 
    };
    #v0_5_0({ state with notifications = {
        var nextId = 0;
        byPrincipal = Map.new<Principal, [V0_5_0.Notification]>();
      }
    });
  };

  public func downgrade(migration_state: MigrationTypes.State, _: DowngradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch (migration_state) {
      case (#v0_5_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_5_0 expected)") 
    };
    #v0_4_0(state);
  };

};