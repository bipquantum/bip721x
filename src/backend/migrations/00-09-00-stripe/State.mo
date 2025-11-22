import Map "mo:map/Map";
import Set "mo:map/Set";
import Debug "mo:base/Debug";
import Time "mo:base/Time";

import V0_9_0 "./Types";
import MigrationTypes "../Types";

module {

  // do not forget to change these types when you add a new migration
  type State = V0_9_0.State;
  type Args = V0_9_0.Args;
  type InitArgs = V0_9_0.InitArgs;
  type UpgradeArgs = V0_9_0.UpgradeArgs;
  type DowngradeArgs = V0_9_0.DowngradeArgs;

  public func init(args: InitArgs): MigrationTypes.State {
    let plans = Map.new<Text, V0_9_0.Plan>();

    // Populate plans from InitArgs
    for (plan in args.subscriptions.plans.vals()) {
      Map.set(plans, Map.thash, plan.id, plan);
    };

    #v0_9_0({
      users = Map.new<Principal, V0_9_0.User>();
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
        histories = Map.new<Text, V0_9_0.ChatHistory>();
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
        byPrincipal = Map.new<Principal, [V0_9_0.Notification]>();
      };
      ckusdtRate = {
        var usd_price = args.ckusdt_rate.usd_price;
        var decimals = args.ckusdt_rate.decimals;
        var last_update = Time.now();
      };
      subscription_register = {
        plans = {
          plans;
          var freePlanId = args.subscriptions.free_plan_id;
        };
        subscriptions = Map.new<Principal, V0_9_0.Subscription>();
        var gracePeriodsDays = args.subscriptions.grace_period_days;
        subaccount = args.subscriptions.subaccount;
      };
    });
  };

  public func upgrade(migration_state: MigrationTypes.State, _args: UpgradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch(migration_state) {
      case (#v0_8_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_8_0 expected)")
    };

    #v0_9_0(state);
  };

  public func downgrade(migration_state: MigrationTypes.State, _args: DowngradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch (migration_state) {
      case (#v0_9_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_9_0 expected)")
    };

    #v0_8_0(state);
  };

};