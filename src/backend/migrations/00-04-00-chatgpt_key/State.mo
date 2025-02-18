import V0_4_0         "Types";
import MigrationTypes "../Types";

import Map            "mo:map/Map";
import Set            "mo:map/Set";

import Debug          "mo:base/Debug";

module {

  type State         = MigrationTypes.State;
  type User          = V0_4_0.User;
  type ChatHistory   = V0_4_0.ChatHistory;
  type InitArgs      = V0_4_0.InitArgs;
  type UpgradeArgs   = V0_4_0.UpgradeArgs;
  type DowngradeArgs = V0_4_0.DowngradeArgs;

  // From nothing to 0.4.0
  public func init(args: InitArgs) : State {
    #v0_4_0({
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
      chatbot_api_key = args.chatbot_api_key;
    });
  };

  // From 0.3.0 to 0.4.0
  public func upgrade(migration_state: State, args: UpgradeArgs): State {

    // Access current state
    let state = switch (migration_state) {
      case (#v0_3_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_3_0 expected)") 
    };
    
    #v0_4_0({ state with chatbot_api_key = args.chatbot_api_key; });
  };

  // From 0.4.0 to 0.3.0
  public func downgrade(migration_state: State, _: DowngradeArgs): State {
  
    // Access current state
    let state = switch (migration_state) {
      case (#v0_4_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_4_0 expected)") 
    };
    #v0_3_0(state);
  };

};