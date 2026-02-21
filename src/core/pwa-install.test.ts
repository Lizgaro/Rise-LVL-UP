import { describe, expect, it } from "vitest";
import { isStandaloneMode } from "./pwa-install";

describe("pwa-install", () => {
  it("detects standalone mode via display-mode media query", () => {
    const value = isStandaloneMode({
      window: {
        matchMedia: (query: string) => ({
          matches: query === "(display-mode: standalone)",
        }),
      },
      navigator: {},
    });
    expect(value).toBe(true);
  });

  it("detects standalone mode for ios navigator.standalone", () => {
    const value = isStandaloneMode({
      window: {
        matchMedia: () => ({ matches: false }),
      },
      navigator: {
        standalone: true,
      },
    });
    expect(value).toBe(true);
  });

  it("returns false when app is in browser tab", () => {
    const value = isStandaloneMode({
      window: {
        matchMedia: () => ({ matches: false }),
      },
      navigator: {},
    });
    expect(value).toBe(false);
  });
});
