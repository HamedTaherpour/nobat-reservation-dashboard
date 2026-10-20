import { describe, expect, it } from "vitest";
import {
  formatGregorianDateAsJalali,
  formatTimeAsPersian,
  getCanonicalGregorianDate,
  getJalaliDatePickerValue,
  getLocalGregorianDate,
  getMillisecondsUntilNextLocalMidnight,
} from "./date.utils";

describe("local Gregorian date utilities", () => {
  it("formats the device-local calendar date in canonical Gregorian form", () => {
    expect(getLocalGregorianDate(new Date(2026, 0, 2, 0, 0))).toBe("2026-01-02");
    expect(getLocalGregorianDate(new Date(2026, 9, 17, 23, 59))).toBe("2026-10-17");
  });

  it("calculates the remaining time until the next local midnight", () => {
    expect(getMillisecondsUntilNextLocalMidnight(new Date(2026, 9, 17, 23, 59, 59, 500))).toBe(500);
    expect(getMillisecondsUntilNextLocalMidnight(new Date(2026, 9, 17, 0, 0))).toBe(86_400_000);
  });

  it("formats canonical reservation dates and times for Persian presentation", () => {
    expect(formatGregorianDateAsJalali("2026-10-17")).toBe("۱۴۰۵/۰۷/۲۵");
    expect(formatTimeAsPersian("09:30")).toBe("۰۹:۳۰");
  });

  it("converts Jalali picker values to canonical Gregorian dates across a year boundary", () => {
    expect(getJalaliDatePickerValue("2026-03-20").format("YYYY/MM/DD")).toBe("1404/12/29");
    expect(getCanonicalGregorianDate(getJalaliDatePickerValue("2026-03-21"))).toBe("2026-03-21");
  });
});
