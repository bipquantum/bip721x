import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Map "mo:map/Map";
import Int "mo:base/Int";

import Types "Types";

module {
  public type Usage = Types.Usage;
  public type UserUsage = Types.UserUsage;
  public type Plan = Types.Plan;
  
  let WINDOW_MONTH = 2_592_000_000_000_000; // 30 days in nanoseconds
  let WINDOW_MINUTE = 60_000_000_000; // 1 minute in nanoseconds

  let PLANS = {
    free = { monthlyLimit = 3_000; burstLimit = 2_000; };
    paid = { monthlyLimit = 2_000_000; burstLimit = 5_000; };
  };

  public class RateLimiter({ usageByUser: Map.Map<Principal, UserUsage> }) {

    // Check if user has enough quota without consuming tokens
    public func check(user: Principal, tokens: Nat): Bool {
      let now = Int.abs(Time.now());

      let entry = switch (Map.get(usageByUser, Map.phash, user)) {
        case (?u) u;
        case null {
          // default to free plan
          {
            month = { from = now; tokens = 0 };
            minute = { from = now; tokens = 0 };
            plan = PLANS.free;
          };
        };
      };

      var month = entry.month;
      var minute = entry.minute;

      // reset month window if expired
      if (now - month.from > WINDOW_MONTH) {
        month := { from = now; tokens = 0 };
      };

      // reset minute window if expired
      if (now - minute.from > WINDOW_MINUTE) {
        minute := { from = now; tokens = 0 };
      };

      // check limits without consuming
      if (month.tokens + tokens > entry.plan.monthlyLimit or
          minute.tokens + tokens > entry.plan.burstLimit) {
        return false;
      };

      return true;
    };

    // Consume tokens without checking (assumes check was already called)
    public func consume(user: Principal, tokens: Nat) {
      let now = Int.abs(Time.now());

      let entry = switch (Map.get(usageByUser, Map.phash, user)) {
        case (?u) u;
        case null {
          // default to free plan
          {
            month = { from = now; tokens = 0 };
            minute = { from = now; tokens = 0 };
            plan = PLANS.free;
          };
        };
      };

      var month = entry.month;
      var minute = entry.minute;

      // reset month window if expired
      if (now - month.from > WINDOW_MONTH) {
        month := { from = now; tokens = 0 };
      };

      // reset minute window if expired
      if (now - minute.from > WINDOW_MINUTE) {
        minute := { from = now; tokens = 0 };
      };

      // update usage without checking limits
      month := { month with tokens = month.tokens + tokens };
      minute := { minute with tokens = minute.tokens + tokens };

      Map.set<Principal, UserUsage>(usageByUser, Map.phash, user, { entry with month; minute });
    };

  };
};
