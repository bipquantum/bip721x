import V0_2_0         "../00-02-00-chat_name/Types";
import V0_3_0         "Types";
import MigrationTypes "../Types";

import Map            "mo:map/Map";
import Set            "mo:map/Set";

import Debug          "mo:base/Debug";

module {

  type State         = MigrationTypes.State;
  type User          = V0_3_0.User;
  type ChatHistory   = V0_3_0.ChatHistory;
  type InitArgs      = V0_3_0.InitArgs;
  type UpgradeArgs   = V0_3_0.UpgradeArgs;
  type DowngradeArgs = V0_3_0.DowngradeArgs;

  // From nothing to 0.3.0
  public func init(args: InitArgs) : State {
    #v0_3_0({
      users = Map.new<Principal, User>();
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
        histories = Map.new<Text, ChatHistory>();
        byPrincipal = Map.new<Principal, Set.Set<Text>>();
      };
      e8sTransferFee = args.e8sTransferFee;
      accessControl = {
        var admin = args.admin;
        moderators = Set.new<Principal>();
        bannedIps = Set.new<Nat>();
      };
    });
  };

  // From 0.2.0 to 0.3.0
  public func upgrade(migration_state: State, _: UpgradeArgs): State {

    // Access current state
    let state = switch (migration_state) {
      case (#v0_2_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_2_0 expected)") 
    };

    let accessControl = { 
      var admin = state.accessControl.admin;
      moderators = state.accessControl.moderators;
      bannedIps = state.accessControl.sensitiveIps; 
    };

    let users = Map.map<Principal, V0_2_0.User, User>(state.users, Map.phash, func(key: Principal, user: V0_2_0.User) : User {
      { user with banned = false; imageUri = ""; };
    });
    
    #v0_3_0({ state with accessControl; users; });
  };

  // From 0.3.0 to 0.2.0
  public func downgrade(migration_state: State, _: DowngradeArgs): State {
  
    // Access current state
    let state = switch (migration_state) {
      case (#v0_3_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_3_0 expected)") 
    };

    let accessControl = { 
      var admin = state.accessControl.admin;
      moderators = state.accessControl.moderators;
      sensitiveIps = state.accessControl.bannedIps; 
    };

    let users = Map.map<Principal, User, V0_2_0.User>(state.users, Map.phash, func(key: Principal, user: User) : V0_2_0.User {
      user;
    });

    #v0_2_0({ state with accessControl; users; });
  };

};