import { describe, expect, it } from "vitest";
import { TIMER_DEFAULTS, XP_RULES } from "./constants";

describe("MVP constants", () => {
  it("has expected timer defaults", () => {
    expect(TIMER_DEFAULTS.focusMinutes).toBe(30);
    expect(TIMER_DEFAULTS.breakMinutes).toBe(5);
  });

  it("has soft penalty profile", () => {
    expect(XP_RULES.taskDone).toBe(25);
    expect(XP_RULES.habitRelapse).toBe(-20);
  });
});
