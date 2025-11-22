import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Map "mo:map/Map";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

import Types "Types";
import DateHelper "utils/DateHelper";

import ckUSDTLedger "canister:ckusdt_ledger";

module {

  type Plan = Types.Plan;
  type Plans = Types.Plans;
  type RenewalInterval = Types.RenewalInterval;
  type Subscription = Types.Subscription;
  type SubscriptionRegister = Types.SubscriptionRegister;
  type PaymentMethod = Types.PaymentMethod;

  public class SubscriptionManager({
    register: SubscriptionRegister;
    backendId: Principal;
  }) {

    public func getSubscriptionSubaccount(): Blob {
      let textBytes = Blob.toArray(Text.encodeUtf8(register.subaccount));
      let paddedBytes = Array.tabulate<Nat8>(32, func(i) {
        if (i < textBytes.size()) {
          textBytes[i]
        } else {
          0
        }
      });
      Blob.fromArray(paddedBytes);
    };

    public func setSubscription(user: Principal, planId: Text, payementMethod: PaymentMethod) : async* Result.Result<(), Text> {

      let subscription = getSubscription(user);
      if (subscription.planId == planId) {
        return #err("User already on this plan");
      };

      let plan = getPlan(planId);
      let now = Time.now();

      let actualPayementMethod = do {

        if (plan.renewalPriceUsdtE6s > 0) {
          switch(await* pullPayment(subscription.paymentMethod, user, plan.renewalPriceUsdtE6s)) {
            case (#ok){ 
              payementMethod;
            };
            case (#err(err)) {
              return #err("Initial payment failed: " # err);
            };
          };
        } else {
          // Free plan, no payment needed
          #Ckusdt;
        };
      };
      let newSub: Subscription = {
        var availableCredits = Nat.max(subscription.availableCredits, plan.intervalCredits);
        var totalCreditsUsed = subscription.totalCreditsUsed;
        var planId = plan.id;
        var state = #Active;
        var startDate = now;
        var nextRenewalDate = addInterval(now, plan.renewalInterval);
        var expiryDate = computeExpiryDate(now, plan);
        var paymentMethod = actualPayementMethod;
      };
      Map.set(register.subscriptions, Map.phash, user, newSub);
      #ok;
    };

    public func refreshSubscriptions() {
      label refreshLoop for (subscription in Map.vals(register.subscriptions)) {
        let now = Time.now();
        // Handle expired plans
        switch(subscription.expiryDate) {
          case (?expiry) {
            if (now >= expiry) {
              // Reset to free plan
              resetToFreePlan(subscription);
              continue refreshLoop;
            };
          };
          case (null) {};
        };

        // Handle subscription state
        switch(subscription.state) {
          case (#PastDue(dueDate)) {
            if (now >= dueDate + daysToNs(register.gracePeriodsDays)) {
              // Downgrade to free plan after grace period
              resetToFreePlan(subscription);
            };
          };
          case (#Active) {
            // Check for renewal
            if (now >= subscription.nextRenewalDate) {
              // Handle renewal
              let plan = getPlan(subscription.planId);
              // Renew subscription
              subscription.availableCredits := plan.intervalCredits;
              // Anchor to scheduled renewal date to prevent drift
              subscription.nextRenewalDate := addInterval(subscription.nextRenewalDate, plan.renewalInterval);
              // Set to past due for simplicity (payment handling asynchronous)
              if (plan.id != register.plans.freePlanId) {
                // Only set to past due if not on free plan
                subscription.state := #PastDue(now);
              };
            };
          };
        };
      };
    };

    public func pullPayments() : async* () {
      
      label subscriptionLoop for ((user, subscription) in Map.entries(register.subscriptions)) {

        let plan = getPlan(subscription.planId);

        switch(subscription.state) {
          case (#Active) { 
            continue subscriptionLoop;
          };
          case (#PastDue(_)) {
            // Free plan, no payment needed
            if (plan.id == register.plans.freePlanId) {
              subscription.state := #Active;
              continue subscriptionLoop;
            };
          };
        };

        // Attempt to pull payment
        switch(await* pullPayment(subscription.paymentMethod, user, plan.renewalPriceUsdtE6s)) {
          case (#ok){ 
            subscription.state := #Active;
          };
          case (#err(err)) {
            // Payment failed - keep subscription past due
            Debug.print("Payment failed for user: " # debug_show(user) # ", error: " # err);
          };
        };
      };
    };

    func pullPayment(paymentMethod: PaymentMethod, user: Principal, amount: Nat) : async* Result.Result<(), Text> {
      switch(paymentMethod) {
        case (#Ckusdt) {
          // Pull payement
          switch(await ckUSDTLedger.icrc2_transfer_from({
            spender_subaccount = ?getSubscriptionSubaccount();
            from = { owner = user; subaccount = null; };
            to = { owner = backendId; subaccount = null; };
            amount = amount;
            fee = null;
            memo = null;
            created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
          })) {
            case (#Err(err)) {
              return #err("Payment failed: " # debug_show(err));
            };
            case (#Ok(_)) { #ok(()) };
          };
        };
        case (#Stripe(subscriptionId)) {
          // TODO: verify payment via Stripe API
          #ok;
        };
      };
    };

    // Check if user has enough quota without consuming credits
    public func checkCredits(user: Principal, credits: Nat): Bool {
      let subscription = getSubscription(user);
      subscription.availableCredits >= credits;
    };

    // Consume credits without checking (assumes check was already called)
    public func consumeCredits(user: Principal, credits: Nat) {
      let subscription = getSubscription(user);
      subscription.availableCredits -= credits;
      subscription.totalCreditsUsed += credits;
    };

    public func getSubscription(user: Principal): Subscription {
      switch(Map.get(register.subscriptions, Map.phash, user)) {
        case (?sub) { sub };
        case (null) {
          let freePlan = getPlan(register.plans.freePlanId);
          let now = Time.now();
          let newSub: Subscription = {
            var availableCredits = freePlan.intervalCredits;
            var totalCreditsUsed = 0;
            var planId = freePlan.id;
            var state = #Active;
            var startDate = now;
            var nextRenewalDate = addInterval(now, freePlan.renewalInterval);
            var expiryDate = null;
            var paymentMethod = #Ckusdt; // Free plan defaults to Ckusdt
          };
          Map.set(register.subscriptions, Map.phash, user, newSub);
          newSub;
        };
      };
    };

    public func getPlans(): [Plan] {
      Iter.toArray(Map.vals(register.plans.plans));
    };

    public func getPlanByStripePaymentLink(paymentLink: Text): ?Plan {
      for (plan in Map.vals(register.plans.plans)) {
        switch (plan.stripePaymentLink) {
          case (?link) {
            if (link == paymentLink) {
              return ?plan;
            };
          };
          case (null) {};
        };
      };
      null;
    };

    func getPlan(planId: Text): Plan {
      switch(Map.get(register.plans.plans, Map.thash, planId)) {
        case (?p) { p };
        case (null) {
          Debug.trap("Plan not found");
        };
      };
    };

    func resetToFreePlan(subscription: Subscription) {
      let freePlan = getPlan(register.plans.freePlanId);
      let now = Time.now();
      subscription.availableCredits := freePlan.intervalCredits;
      subscription.nextRenewalDate := addInterval(now, freePlan.renewalInterval);
      subscription.planId := register.plans.freePlanId;
      subscription.state := #Active;
      subscription.startDate := now;
      subscription.expiryDate := null;
      subscription.paymentMethod := #Ckusdt;
    };

  };

  func daysToNs(days: Nat): Int {
    days * 24 * 60 * 60 * 1_000_000_000;
  };

  // Add renewal interval to a timestamp
  func addInterval(timestamp: Int, interval: RenewalInterval): Int {
    switch (interval) {
      case (#Days(days)) {
        switch (DateHelper.addDaysToTimestamp(timestamp, days)) {
          case (#ok(result)) { result };
          case (#err(e)) { Debug.trap("Failed to add days: " # e) };
        };
      };
      case (#Months(months)) {
        switch (DateHelper.addMonthsToTimestamp(timestamp, months)) {
          case (#ok(result)) { result };
          case (#err(e)) { Debug.trap("Failed to add months: " # e) };
        };
      };
    };
  };

  // Add multiple intervals to a timestamp
  func addIntervals(timestamp: Int, interval: RenewalInterval, count: Nat): Int {
    switch (interval) {
      case (#Days(days)) {
        switch (DateHelper.addDaysToTimestamp(timestamp, days * count)) {
          case (#ok(result)) { result };
          case (#err(e)) { Debug.trap("Failed to add days: " # e) };
        };
      };
      case (#Months(months)) {
        switch (DateHelper.addMonthsToTimestamp(timestamp, months * count)) {
          case (#ok(result)) { result };
          case (#err(e)) { Debug.trap("Failed to add months: " # e) };
        };
      };
    };
  };

  func computeExpiryDate(now: Int, plan: Plan): ?Int {
    // Calculate expiry date based on number of intervals
    // Subscription expires AFTER all renewal intervals complete
    switch(plan.numberInterval) {
      case (?count) { ?addIntervals(now, plan.renewalInterval, count) };
      case (null) { null };
    };
  };

};
