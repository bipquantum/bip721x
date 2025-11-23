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
import Stripe "Stripe";

import ckUSDTLedger "canister:ckusdt_ledger";

module {

  type Plan = Types.Plan;
  type Plans = Types.Plans;
  type RenewalInterval = Types.RenewalInterval;
  type Subscription = Types.Subscription;
  type SubscriptionRegister = Types.SubscriptionRegister;
  type PaymentMethod = Types.PaymentMethod;
  type HttpRequest = Types.HttpRequest;
  type HttpResponse = Types.HttpResponse;

  public class SubscriptionManager({
    register: SubscriptionRegister;
    backendId: Principal;
    stripeSecretKey: Text;
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

      // Cancel previous Stripe subscription if switching away from it
      switch (subscription.paymentMethod) {
        case (#Stripe({ subscriptionId })) {
          Debug.print("Cancelling previous Stripe subscription: " # subscriptionId);
          switch (await Stripe.cancelSubscription(subscriptionId, stripeSecretKey)) {
            case (#err(err)) {
              Debug.print("Warning: Failed to cancel Stripe subscription: " # err);
              // Continue anyway - user wants to switch plans
            };
            case (#ok) {
              Debug.print("Successfully cancelled Stripe subscription");
            };
          };
        };
        case (#Ckusdt) {};
      };

      let actualPayementMethod = do {
        if (plan.renewalPriceUsdtE6s > 0) {
          switch (await* pullPayment(payementMethod, user, plan.renewalPriceUsdtE6s)) {
            case (#ok) { payementMethod };
            case (#err(err)) { return #err("Initial payment failed: " # err) };
          };
        } else {
          // Free plan, no payment needed
          #Ckusdt;
        };
      };

      let expiryDate = computeExpiryDate(now, plan);

      // If Stripe subscription with an expiry date, set cancel_at in Stripe
      switch (actualPayementMethod, expiryDate) {
        case (#Stripe({ subscriptionId }), ?expiry) {
          // Convert nanoseconds to seconds for Stripe
          let cancelAtSeconds = expiry / 1_000_000_000;
          Debug.print("Setting Stripe cancel_at to: " # Int.toText(cancelAtSeconds));
          switch (await Stripe.setCancelAt(subscriptionId, cancelAtSeconds, stripeSecretKey)) {
            case (#err(err)) {
              Debug.print("Warning: Failed to set cancel_at: " # err);
              // Continue anyway - subscription is still valid
            };
            case (#ok) {
              Debug.print("Successfully set Stripe cancel_at");
            };
          };
        };
        case (_, _) {};
      };

      let newSub: Subscription = {
        var availableCredits = Nat.max(subscription.availableCredits, plan.intervalCredits);
        var totalCreditsUsed = subscription.totalCreditsUsed;
        var planId = plan.id;
        var state = #Active;
        var startDate = now;
        var nextRenewalDate = addInterval(now, plan.renewalInterval);
        var expiryDate = expiryDate;
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
        case (#Stripe({ subscriptionId })) {
          // Verify payment via Stripe API
          switch(await Stripe.verifySubscriptionPayment(subscriptionId, stripeSecretKey)) {
            case (#ok) { #ok(()) };
            case (#err(err)) { #err(err) };
          };
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

    // ============ HTTP Request Handling ============

    // Handle HTTP request (query phase) - returns upgrade response for webhooks, 404 otherwise
    public func handleHttpRequest(req: HttpRequest) : HttpResponse {
      if ((req.url == "/stripe-webhook" or req.url == "/stripe-webhook/") and req.method == "POST") {
        return {
          status_code = 200;
          headers = [];
          body = Blob.fromArray([]);
          upgrade = ?true;
        };
      };
      {
        status_code = 404;
        headers = [("content-type", "text/plain")];
        body = Text.encodeUtf8("Not Found");
        upgrade = null;
      };
    };

    // Handle webhook POST request (called from http_request_update)
    public func handleStripeWebhook(req: HttpRequest) : async HttpResponse {
      // Only handle POST to /stripe-webhook
      if (req.method != "POST" or (req.url != "/stripe-webhook" and req.url != "/stripe-webhook/")) {
        return {
          status_code = 404;
          headers = [("content-type", "text/plain")];
          body = Text.encodeUtf8("Not Found");
          upgrade = null;
        };
      };

      // Parse the webhook body
      let ?bodyText = Text.decodeUtf8(req.body) else {
        Debug.print("Failed to decode webhook body");
        return errorResponse("Invalid webhook body");
      };

      Debug.print("Received Stripe webhook: " # bodyText);

      // Extract event ID from the webhook body
      let ?eventId = Stripe.extractEventId(bodyText) else {
        Debug.print("Failed to extract event ID from webhook");
        return errorResponse("Missing event ID");
      };

      Debug.print("Extracted event ID: " # eventId);

      // Verify the event by fetching it from Stripe
      switch (await Stripe.verifyStripeEvent(eventId, stripeSecretKey)) {
        case (#err(msg)) {
          Debug.print("Event verification failed: " # msg);
          return errorResponse("Event verification failed");
        };
        case (#ok(eventData)) {
          Debug.print("Event verified successfully");

          // Process the event based on type
          switch (await processStripeEvent(eventData)) {
            case (#err(msg)) {
              Debug.print("Event processing failed: " # msg);
              return errorResponse("Event processing failed");
            };
            case (#ok()) {
              Debug.print("Event processed successfully");
              return {
                status_code = 200;
                headers = [("content-type", "application/json")];
                body = Text.encodeUtf8("{\"received\":true}");
                upgrade = null;
              };
            };
          };
        };
      };
    };

    // Process verified Stripe event
    func processStripeEvent(eventData: Text) : async Result.Result<(), Text> {
      // Extract checkout info from event
      let checkoutInfo = switch (Stripe.getCheckoutInfo(eventData)) {
        case (#err(msg)) { return #err(msg) };
        case (#ok(null)) { return #ok() };  // Not a checkout event, ignore
        case (#ok(?info)) { info };
      };

      Debug.print("Processing checkout for user: " # checkoutInfo.clientReferenceId);

      // Resolve plan ID from metadata or payment link
      let planId = switch (checkoutInfo.planId) {
        case (?id) { id };
        case null {
          let ?paymentLink = checkoutInfo.paymentLink else {
            return #err("Missing both plan_id and payment_link");
          };
          let ?plan = getPlanByStripePaymentLink(paymentLink) else {
            return #err("Unknown payment link: " # paymentLink);
          };
          plan.id;
        };
      };

      Debug.print("Plan ID: " # planId # ", Subscription ID: " # checkoutInfo.subscriptionId);

      // Activate subscription
      let userPrincipal = Principal.fromText(checkoutInfo.clientReferenceId);
      switch (await* setSubscription(userPrincipal, planId, #Stripe({ subscriptionId = checkoutInfo.subscriptionId }))) {
        case (#err(msg)) { return #err("Subscription activation failed: " # msg) };
        case (#ok()) { Debug.print("Successfully activated subscription") };
      };

      #ok();
    };

    // Helper: Error response
    func errorResponse(msg: Text) : HttpResponse {
      {
        status_code = 400;
        headers = [("content-type", "text/plain")];
        body = Text.encodeUtf8(msg);
        upgrade = null;
      };
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
