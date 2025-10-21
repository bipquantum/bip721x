import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Map "mo:map/Map";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Nat64 "mo:base/Nat64";
import Int "mo:base/Int";
import Result "mo:base/Result";

import Types "Types";

import ckUSDTLedger "canister:ckusdt_ledger";

module {

  type Plan = Types.Plan;
  type Plans = Types.Plans;
  type Subscription = Types.Subscription;
  type SubscriptionRegister = Types.SubscriptionRegister;

  public class SubscriptionManager({
    register: SubscriptionRegister;
    backendId: Principal;
  }) {

    public func setPaidSubscription(user: Principal, planId: Text) : async* Result.Result<(), Text> {

      let subscription = getSubscription(user);
      if (subscription.planId == planId) {
        return #err("User already on this plan");
      };

      let plan = getPlan(planId);
      let now = Time.now();
      switch(await ckUSDTLedger.icrc2_transfer_from({
        spender_subaccount = null;
        from = { owner = user; subaccount = null; };
        to = { owner = backendId; subaccount = ?Text.encodeUtf8(register.subaccount); };
        amount = plan.renewalPriceUsdtE6s;
        fee = null;
        memo = null;
        created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
      })) {
        case (#Err(err)) {
          return #err("Payment failed: " # debug_show(err));
        };
        case (#Ok(_)) {};
      };
      let expiryDate = switch(plan.durationDays) {
        case (?days) { ?(now + daysToNs(days)) };
        case (null) { null };
      };
      let newSub: Subscription = {
        var availableCredits = plan.intervalCredits;
        var totalCreditsUsed = subscription.totalCreditsUsed;
        var planId = plan.id;
        var state = #Active;
        var startDate = now;
        var nextRenewalDate = now + daysToNs(plan.renewalIntervalDays);
        var expiryDate = expiryDate;
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
              let plan = getPlan(register.plans.freePlanId);
              // Reset to free plan
              subscription.availableCredits := plan.intervalCredits;
              subscription.nextRenewalDate := now + daysToNs(plan.renewalIntervalDays);
              subscription.planId := register.plans.freePlanId;
              subscription.state := #Active;
              subscription.startDate := now;
              subscription.expiryDate := null;
              continue refreshLoop;
            };
          };
          case (null) {};
        };

        // Handle subscription state
        switch(subscription.state) {
          case (#Active) {
            // Check for renewal
            if (now >= subscription.nextRenewalDate) {
              // Handle renewal
              let plan = getPlan(subscription.planId);
              // Renew subscription
              subscription.availableCredits := plan.intervalCredits;
              subscription.nextRenewalDate := now + daysToNs(plan.renewalIntervalDays);
              // Set to past due for simplicity (payment handling asynchronous)
              subscription.state := #PastDue(now);
            };
          };
          case (#PastDue(dueDate)) {
            if (now >= dueDate + daysToNs(register.gracePeriodsDays)) {
              // Downgrade to free plan after grace period
              let freePlan = getPlan(register.plans.freePlanId);
              subscription.availableCredits := freePlan.intervalCredits;
              subscription.nextRenewalDate := now + daysToNs(freePlan.renewalIntervalDays);
              subscription.planId := register.plans.freePlanId;
              subscription.state := #Active;
              subscription.startDate := now;
              subscription.expiryDate := null;
            };
          };
        };
      };
    };

    public func pullPayments() : async* () {
      for ((user, subscription) in Map.entries(register.subscriptions)) {
        switch(subscription.state) {
          case (#Active) {};
          case (#PastDue(_)) {
            let plan = getPlan(subscription.planId);
            // Pull payement
            switch(await ckUSDTLedger.icrc2_transfer_from({
              spender_subaccount = null;
              from = { owner = user; subaccount = null; };
              to = { owner = backendId; subaccount = ?Text.encodeUtf8(register.subaccount); };
              amount = plan.renewalPriceUsdtE6s;
              fee = null;
              memo = null;
              created_at_time = ?Nat64.fromNat(Int.abs(Time.now()));
            })) {
              case (#Err(_)) {};
              case (#Ok(_)) {
                // Payment succeeded, reactivate subscription
                subscription.state := #Active;
              };
            };
          };
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
          let expiryDate = switch(freePlan.durationDays) {
            case (?days) { ?(now + daysToNs(days)) };
            case (null) { null };
          };
          let newSub: Subscription = {
            var availableCredits = freePlan.intervalCredits;
            var totalCreditsUsed = 0;
            var planId = freePlan.id;
            var state = #Active;
            var startDate = now;
            var nextRenewalDate = now + daysToNs(freePlan.renewalIntervalDays);
            var expiryDate = expiryDate;
          };
          Map.set(register.subscriptions, Map.phash, user, newSub);
          newSub;
        };
      };
    };

    func getPlan(planId: Text): Plan {
      switch(Map.get(register.plans.plans, Map.thash, planId)) {
        case (?p) { p };
        case (null) {
          Debug.trap("Plan not found");
        };
      };
    };

  };

  func daysToNs(days: Int): Int {
    days * 24 * 60 * 60 * 1_000_000_000;
  };

};
