import { test; suite } "mo:test";
import Debug "mo:base/Debug";
import DateHelper "../src/backend/utils/DateHelper";
import DateTime "mo:date-time";
import { verify; Testify } "Testify";

// Helper to create nanosecond timestamp from date components
func makeTimestampNs(year: Int, month: Int, day: Int, hour: Int, minute: Int, second: Int) : Int {
  let dt = DateTime.DateTime();
  let result = dt.toTimestamp({ year; month; day; hour; minute; second });
  switch (result) {
    case (#Err(e)) { Debug.trap("Failed to create timestamp: " # debug_show(e)); };
    case (#Ok(seconds)) { seconds * 1_000_000_000 };
  };
};

// Helper to extract date components from nanosecond timestamp
func getDateComponents(timestampNs: Int) : { year: Int; month: Int; day: Int; hour: Int; minute: Int; second: Int } {
  let dt = DateTime.DateTime();
  let result = dt.fromTimestamp(timestampNs / 1_000_000_000);
  switch (result) {
    case (#Err(e)) { Debug.trap("Failed to parse timestamp: " # debug_show(e)); };
    case (#Ok(components)) { components };
  };
};

// Helper to unwrap Result or trap
func unwrapOk(result: { #ok: Int; #err: Text }) : Int {
  switch (result) {
    case (#err(e)) { Debug.trap("Unexpected error: " # e); };
    case (#ok(v)) { v };
  };
};

suite("DateHelper", func() {

  test("Add 1 month to Jan 1 2025 gives Feb 1 2025", func() {
    let jan1 = makeTimestampNs(2025, 1, 1, 12, 0, 0);

    // Verify input date is correct
    let jan1Components = getDateComponents(jan1);
    verify(jan1Components.year, 2025, Testify.int.equal);
    verify(jan1Components.month, 1, Testify.int.equal);
    verify(jan1Components.day, 1, Testify.int.equal);

    let result = unwrapOk(DateHelper.addMonthsToTimestamp(jan1, 1));
    let resultComponents = getDateComponents(result);

    // Verify output date
    verify(resultComponents.year, 2025, Testify.int.equal);
    verify(resultComponents.month, 2, Testify.int.equal);
    verify(resultComponents.day, 1, Testify.int.equal);
    // Time of day preserved
    verify(resultComponents.hour, 12, Testify.int.equal);
    verify(resultComponents.minute, 0, Testify.int.equal);
    verify(resultComponents.second, 0, Testify.int.equal);

    // January has 31 days
    let diffDays = (result - jan1) / (24 * 60 * 60 * 1_000_000_000);
    verify(diffDays, 31, Testify.int.equal);
  });

  test("Add 2 months to Jan 1 2025 gives Mar 1 2025", func() {
    let jan1 = makeTimestampNs(2025, 1, 1, 12, 0, 0);

    let result = unwrapOk(DateHelper.addMonthsToTimestamp(jan1, 2));
    let resultComponents = getDateComponents(result);

    verify(resultComponents.year, 2025, Testify.int.equal);
    verify(resultComponents.month, 3, Testify.int.equal);
    verify(resultComponents.day, 1, Testify.int.equal);

    // 31 (Jan) + 28 (Feb, non-leap year 2025) = 59 days
    let diffDays = (result - jan1) / (24 * 60 * 60 * 1_000_000_000);
    verify(diffDays, 59, Testify.int.equal);
  });

  test("Add 1 month to Jan 31 gives Feb 28 (month-end capping)", func() {
    let jan31 = makeTimestampNs(2025, 1, 31, 12, 0, 0);

    // Verify input
    let jan31Components = getDateComponents(jan31);
    verify(jan31Components.month, 1, Testify.int.equal);
    verify(jan31Components.day, 31, Testify.int.equal);

    let result = unwrapOk(DateHelper.addMonthsToTimestamp(jan31, 1));
    let resultComponents = getDateComponents(result);

    // Feb doesn't have 31 days, should cap to Feb 28 (2025 is not a leap year)
    verify(resultComponents.year, 2025, Testify.int.equal);
    verify(resultComponents.month, 2, Testify.int.equal);
    verify(resultComponents.day, 28, Testify.int.equal);
    // Time preserved
    verify(resultComponents.hour, 12, Testify.int.equal);
  });

  test("Add 1 month to Mar 31 gives Apr 30 (month-end capping)", func() {
    let mar31 = makeTimestampNs(2025, 3, 31, 15, 30, 45);

    let result = unwrapOk(DateHelper.addMonthsToTimestamp(mar31, 1));
    let resultComponents = getDateComponents(result);

    // April has 30 days, should cap to Apr 30
    verify(resultComponents.year, 2025, Testify.int.equal);
    verify(resultComponents.month, 4, Testify.int.equal);
    verify(resultComponents.day, 30, Testify.int.equal);
    // Time preserved
    verify(resultComponents.hour, 15, Testify.int.equal);
    verify(resultComponents.minute, 30, Testify.int.equal);
    verify(resultComponents.second, 45, Testify.int.equal);
  });

  test("Add 10 days to Jan 15 gives Jan 25", func() {
    let jan15 = makeTimestampNs(2025, 1, 15, 8, 0, 0);

    let result = unwrapOk(DateHelper.addDaysToTimestamp(jan15, 10));
    let resultComponents = getDateComponents(result);

    verify(resultComponents.year, 2025, Testify.int.equal);
    verify(resultComponents.month, 1, Testify.int.equal);
    verify(resultComponents.day, 25, Testify.int.equal);
    verify(resultComponents.hour, 8, Testify.int.equal);

    let diffDays = (result - jan15) / (24 * 60 * 60 * 1_000_000_000);
    verify(diffDays, 10, Testify.int.equal);
  });

  test("Add days crossing month boundary", func() {
    let jan28 = makeTimestampNs(2025, 1, 28, 12, 0, 0);

    let result = unwrapOk(DateHelper.addDaysToTimestamp(jan28, 5));
    let resultComponents = getDateComponents(result);

    // Jan 28 + 5 days = Feb 2
    verify(resultComponents.year, 2025, Testify.int.equal);
    verify(resultComponents.month, 2, Testify.int.equal);
    verify(resultComponents.day, 2, Testify.int.equal);
  });

});

suite("DateTime library edge cases", func() {

  test("Jan 31 + 1 month = Feb 28 (non-leap year)", func() {
    let dt = DateTime.DateTime();
    let jan31 = { year = 2025; month = 1; day = 31 };

    let result = dt.add({ date = jan31; amount = 1; unit = #Month });

    switch (result) {
      case (#Err(e)) { Debug.trap("Failed: " # debug_show(e)); };
      case (#Ok(feb)) {
        verify(feb.year, 2025, Testify.int.equal);
        verify(feb.month, 2, Testify.int.equal);
        verify(feb.day, 28, Testify.int.equal);
      };
    };
  });

  test("Jan 31 + 2 months = Mar 31", func() {
    let dt = DateTime.DateTime();
    let jan31 = { year = 2025; month = 1; day = 31 };

    let result = dt.add({ date = jan31; amount = 2; unit = #Month });

    switch (result) {
      case (#Err(e)) { Debug.trap("Failed: " # debug_show(e)); };
      case (#Ok(mar)) {
        verify(mar.year, 2025, Testify.int.equal);
        verify(mar.month, 3, Testify.int.equal);
        verify(mar.day, 31, Testify.int.equal);
      };
    };
  });

  test("Jan 29 2024 + 1 month = Feb 29 (leap year)", func() {
    let dt = DateTime.DateTime();
    let jan29 = { year = 2024; month = 1; day = 29 };

    let result = dt.add({ date = jan29; amount = 1; unit = #Month });

    switch (result) {
      case (#Err(e)) { Debug.trap("Failed: " # debug_show(e)); };
      case (#Ok(feb)) {
        verify(feb.year, 2024, Testify.int.equal);
        verify(feb.month, 2, Testify.int.equal);
        verify(feb.day, 29, Testify.int.equal); // 2024 is a leap year
      };
    };
  });

});
