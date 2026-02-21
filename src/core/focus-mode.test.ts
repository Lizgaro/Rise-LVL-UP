import { describe, expect, it } from "vitest";
import { shouldUseFocusLayout } from "./focus-mode";

describe("shouldUseFocusLayout", () => {
  it("enables focus layout only when mode is on and timer is running", () => {
    expect(shouldUseFocusLayout(true, true)).toBe(true);
  });

  it("keeps full layout in other states", () => {
    expect(shouldUseFocusLayout(false, true)).toBe(false);
    expect(shouldUseFocusLayout(true, false)).toBe(false);
    expect(shouldUseFocusLayout(false, false)).toBe(false);
  });
});
