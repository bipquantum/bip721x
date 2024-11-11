import V0_1_0         "../00-01-00-initial/Types";
import V0_2_0         "Types";
import MigrationTypes "../Types";

import Map            "mo:map/Map";
import Set            "mo:map/Set";

import Debug          "mo:base/Debug";

module {

  type State         = MigrationTypes.State;
  type User          = V0_2_0.User;
  type ChatHistory   = V0_2_0.ChatHistory;
  type InitArgs      = V0_2_0.InitArgs;
  type UpgradeArgs   = V0_2_0.UpgradeArgs;
  type DowngradeArgs = V0_2_0.DowngradeArgs;

  // From nothing to 0.2.0
  public func init(args: InitArgs) : State {
    #v0_2_0({
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
        sensitiveIps = Set.new<Nat>();
      };
    });
  };

  // From 0.1.0 to 0.2.0
  public func upgrade(migration_state: State, args: UpgradeArgs): State {

    // Access current state
    let state = switch (migration_state) {
      case (#v0_1_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_1_0 expected)") 
    };

    let chatHistories = {
      state.chatHistories with
      histories = Map.map<Text, V0_1_0.ChatHistory, ChatHistory>(state.chatHistories.histories, Map.thash, func(key: Text, chat: V0_1_0.ChatHistory) : ChatHistory {
        { chat with name = "New chat"; };
      });
    };
    #v0_2_0({ 
      state with
      chatHistories;
      accessControl = {
        var admin = args.admin;
        moderators = Set.new<Principal>();
        sensitiveIps = Set.new<Nat>(); 
      };
    });
  };

  // From 0.2.0 to 0.1.0
  public func downgrade(migration_state: State, _: DowngradeArgs): State {
  
    // Access current state
    let state = switch (migration_state) {
      case (#v0_2_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_2_0 expected)") 
    };

    let chatHistories = {
      state.chatHistories with
      histories = Map.map<Text, ChatHistory, V0_1_0.ChatHistory>(state.chatHistories.histories, Map.thash, func(key: Text, chat: ChatHistory) : V0_1_0.ChatHistory {
        chat;
      });
    };

    #v0_1_0({ state with chatHistories; });
  };

};