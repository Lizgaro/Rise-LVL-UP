import { describe, expect, it } from "vitest";
import { markOnboardingDone, shouldShowOnboarding } from "./onboarding";

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("onboarding", () => {
  it("shows onboarding by default", () => {
    expect(shouldShowOnboarding()).toBe(true);
  });

  it("hides onboarding after done flag is saved", () => {
    const storage = createMemoryStorage();
    expect(shouldShowOnboarding(storage)).toBe(true);
    markOnboardingDone(storage);
    expect(shouldShowOnboarding(storage)).toBe(false);
  });

  it("stays resilient when storage throws", () => {
    const brokenStorage = {
      getItem: () => {
        throw new Error("read failed");
      },
      setItem: () => {
        throw new Error("write failed");
      },
    };
    expect(shouldShowOnboarding(brokenStorage)).toBe(true);
    expect(() => markOnboardingDone(brokenStorage)).not.toThrow();
  });
});
