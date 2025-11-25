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
      stripe_secret_key = args.stripe_secret_key;
    });
  };

  // Convert renewalIntervalDays to RenewalInterval
  // If divisible by 30, treat as months; otherwise, treat as days
  func migrateRenewalInterval(days: Nat): V0_9_0.RenewalInterval {
    if (days % 30 == 0) {
      #Months(days / 30);
    } else {
      #Days(days);
    };
  };

  // Convert RenewalInterval back to days for downgrade
  func renewalIntervalToDays(interval: V0_9_0.RenewalInterval): Nat {
    switch (interval) {
      case (#Days(d)) { d };
      case (#Months(m)) { m * 30 };
    };
  };

  public func upgrade(migration_state: MigrationTypes.State, args: UpgradeArgs): MigrationTypes.State {
    // Access previous state
    let state = switch(migration_state) {
      case (#v0_8_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_8_0 expected)")
    };

    // Migrate plans: add stripePaymentLink and convert renewalIntervalDays to renewalInterval
    let newPlans = Map.new<Text, V0_9_0.Plan>();
    for ((id, plan) in Map.entries(state.subscription_register.plans.plans)) {
      // Find the stripe payment link for this plan
      var stripePaymentLink: ?Text = null;
      for (mapping in args.stripe_payment_links.vals()) {
        if (mapping.planId == id) {
          stripePaymentLink := ?mapping.stripePaymentLink;
        };
      };
      // Require payment link for paid plans only
      if (plan.renewalPriceUsdtE6s > 0 and stripePaymentLink == null) {
        Debug.trap("Missing stripe payment link for paid plan: " # id);
      };
      Map.set(newPlans, Map.thash, id, {
        id = plan.id;
        name = plan.name;
        intervalCredits = plan.intervalCredits;
        renewalPriceUsdtE6s = plan.renewalPriceUsdtE6s;
        renewalInterval = migrateRenewalInterval(plan.renewalIntervalDays);
        numberInterval = plan.numberInterval;
        stripePaymentLink;
      });
    };

    // Migrate subscriptions: add paymentMethod = #Ckusdt for all existing subscriptions
    let newSubscriptions = Map.new<Principal, V0_9_0.Subscription>();
    for ((principal, sub) in Map.entries(state.subscription_register.subscriptions)) {
      let newSub: V0_9_0.Subscription = {
        var availableCredits = sub.availableCredits;
        var totalCreditsUsed = sub.totalCreditsUsed;
        var planId = sub.planId;
        var state = sub.state;
        var startDate = sub.startDate;
        var nextRenewalDate = sub.nextRenewalDate;
        var expiryDate = sub.expiryDate;
        var paymentMethod = #Ckusdt;
      };
      Map.set(newSubscriptions, Map.phash, principal, newSub);
    };

    #v0_9_0({
      users = state.users;
      airdrop = state.airdrop;
      intProps = state.intProps;
      chatHistories = state.chatHistories;
      e6sTransferFee = state.e6sTransferFee;
      accessControl = state.accessControl;
      chatbot_api_key = state.chatbot_api_key;
      notifications = state.notifications;
      ckusdtRate = state.ckusdtRate;
      subscription_register = {
        subscriptions = newSubscriptions;
        plans = {
          plans = newPlans;
          var freePlanId = state.subscription_register.plans.freePlanId;
        };
        var gracePeriodsDays = state.subscription_register.gracePeriodsDays;
        subaccount = state.subscription_register.subaccount;
      };
      stripe_secret_key = args.stripe_secret_key;
    });
  };

  public func downgrade(migration_state: MigrationTypes.State, _args: DowngradeArgs): MigrationTypes.State {
    // Access current state
    let state = switch (migration_state) {
      case (#v0_9_0(state)) state;
      case (_) Debug.trap("Unexpected migration state (v0_9_0 expected)")
    };

    // Migrate plans back: remove stripePaymentLink and convert renewalInterval to renewalIntervalDays
    let oldPlans = Map.new<Text, {
      id: Text;
      name: Text;
      intervalCredits: Nat;
      renewalPriceUsdtE6s: Nat;
      renewalIntervalDays: Nat;
      numberInterval: ?Nat;
    }>();
    for ((id, plan) in Map.entries(state.subscription_register.plans.plans)) {
      Map.set(oldPlans, Map.thash, id, {
        id = plan.id;
        name = plan.name;
        intervalCredits = plan.intervalCredits;
        renewalPriceUsdtE6s = plan.renewalPriceUsdtE6s;
        renewalIntervalDays = renewalIntervalToDays(plan.renewalInterval);
        numberInterval = plan.numberInterval;
      });
    };

    // Migrate subscriptions back: remove paymentMethod field
    // Note: Stripe payment info is lost during downgrade (only ckUSDT existed in v0_8_0)
    let oldSubscriptions = Map.new<Principal, {
      var availableCredits: Nat;
      var totalCreditsUsed: Nat;
      var planId: Text;
      var state: { #Active; #PastDue: Int };
      var startDate: Int;
      var nextRenewalDate: Int;
      var expiryDate: ?Int;
    }>();
    for ((principal, sub) in Map.entries(state.subscription_register.subscriptions)) {
      let oldSub: {
        var availableCredits: Nat;
        var totalCreditsUsed: Nat;
        var planId: Text;
        var state: { #Active; #PastDue: Int };
        var startDate: Int;
        var nextRenewalDate: Int;
        var expiryDate: ?Int;
      } = {
        var availableCredits = sub.availableCredits;
        var totalCreditsUsed = sub.totalCreditsUsed;
        var planId = sub.planId;
        var state = sub.state;
        var startDate = sub.startDate;
        var nextRenewalDate = sub.nextRenewalDate;
        var expiryDate = sub.expiryDate;
      };
      Map.set(oldSubscriptions, Map.phash, principal, oldSub);
    };

    #v0_8_0({
      users = state.users;
      airdrop = state.airdrop;
      intProps = state.intProps;
      chatHistories = state.chatHistories;
      e6sTransferFee = state.e6sTransferFee;
      accessControl = state.accessControl;
      chatbot_api_key = state.chatbot_api_key;
      notifications = state.notifications;
      ckusdtRate = state.ckusdtRate;
      subscription_register = {
        subscriptions = oldSubscriptions;
        plans = {
          plans = oldPlans;
          var freePlanId = state.subscription_register.plans.freePlanId;
        };
        var gracePeriodsDays = state.subscription_register.gracePeriodsDays;
        subaccount = state.subscription_register.subaccount;
      };
    });
  };

};