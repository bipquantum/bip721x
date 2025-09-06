import Map "mo:map/Map";
import Set "mo:map/Set";
import Debug "mo:base/Debug";
import Time "mo:base/Time";

import V0_6_0 "./Types";
import MigrationTypes "../Types";

module {

  // do not forget to change these types when you add a new migration
  type State = V0_6_0.State;
  type Args = V0_6_0.Args;
  type InitArgs = V0_6_0.InitArgs;
  type UpgradeArgs = V0_6_0.UpgradeArgs;
  type DowngradeArgs = V0_6_0.DowngradeArgs;

  public func init(args: InitArgs): MigrationTypes.State {
    #v0_6_0({
      users = Map.new<Principal, V0_6_0.User>();
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
        histories = Map.new<Text, V0_6_0.ChatHistory>();
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
        byPrincipal = Map.new<Principal, [V0_6_0.Notification]>();
      };
      ckbtcRate = {
        var usd_price = args.ckbtc_usd_price;
        var last_update = Time.now();
      };
    });
  };

  public func upgrade(migration_state: MigrationTypes.State, args: UpgradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch(migration_state) {
      case (#v0_5_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_5_0 expected)") 
    };
    #v0_6_0({ state with ckbtcRate = {
        var usd_price = args.ckbtc_usd_price;
        var last_update = Time.now();
      }
    });
  };

  public func downgrade(migration_state: MigrationTypes.State, _: DowngradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch (migration_state) {
      case (#v0_6_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_6_0 expected)") 
    };
    #v0_5_0(state);
  };

};