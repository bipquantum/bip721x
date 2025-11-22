import Result "mo:base/Result";
import DateTime "mo:date-time";

module {

  // Conversion constants
  private let NS_PER_SECOND : Int = 1_000_000_000;

  /// Adds calendar months to a timestamp.
  /// Input and output are in nanoseconds.
  /// Handles month-end edge cases (e.g., Jan 31 + 1 month = Feb 28/29, Mar 31 + 1 month = Apr 30)
  /// Preserves time of day.
  public func addMonthsToTimestamp(timestampNs: Int, months: Int) : Result.Result<Int, Text> {
    let dt = DateTime.DateTime();

    // Convert nanoseconds to seconds for the library
    let timestampSeconds = timestampNs / NS_PER_SECOND;

    // Convert timestamp to DateTimeComponents
    let dateTime = switch (dt.fromTimestamp(timestampSeconds)) {
      case (#Err(e)) { return #err("Failed to parse timestamp: " # debug_show(e)); };
      case (#Ok(dtc)) { dtc };
    };

    // Add months
    let newDate = switch (dt.add({
      date = { year = dateTime.year; month = dateTime.month; day = dateTime.day };
      amount = months;
      unit = #Month;
    })) {
      case (#Err(e)) { return #err("Failed to add months: " # debug_show(e)); };
      case (#Ok(d)) { d };
    };

    // Convert back to timestamp (returns seconds)
    let resultSeconds = switch (dt.toTimestamp({
      year = newDate.year;
      month = newDate.month;
      day = newDate.day;
      hour = dateTime.hour;
      minute = dateTime.minute;
      second = dateTime.second;
    })) {
      case (#Err(e)) { return #err("Failed to convert to timestamp: " # debug_show(e)); };
      case (#Ok(ts)) { ts };
    };

    #ok(resultSeconds * NS_PER_SECOND);
  };

  /// Adds days to a timestamp.
  /// Input and output are in nanoseconds.
  /// Preserves time of day.
  public func addDaysToTimestamp(timestampNs: Int, days: Int) : Result.Result<Int, Text> {
    let dt = DateTime.DateTime();

    // Convert nanoseconds to seconds for the library
    let timestampSeconds = timestampNs / NS_PER_SECOND;

    // Convert timestamp to DateTimeComponents
    let dateTime = switch (dt.fromTimestamp(timestampSeconds)) {
      case (#Err(e)) { return #err("Failed to parse timestamp: " # debug_show(e)); };
      case (#Ok(dtc)) { dtc };
    };

    // Add days
    let newDate = switch (dt.add({
      date = { year = dateTime.year; month = dateTime.month; day = dateTime.day };
      amount = days;
      unit = #Day;
    })) {
      case (#Err(e)) { return #err("Failed to add days: " # debug_show(e)); };
      case (#Ok(d)) { d };
    };

    // Convert back to timestamp (returns seconds)
    let resultSeconds = switch (dt.toTimestamp({
      year = newDate.year;
      month = newDate.month;
      day = newDate.day;
      hour = dateTime.hour;
      minute = dateTime.minute;
      second = dateTime.second;
    })) {
      case (#Err(e)) { return #err("Failed to convert to timestamp: " # debug_show(e)); };
      case (#Ok(ts)) { ts };
    };

    #ok(resultSeconds * NS_PER_SECOND);
  };

};
