import { describe, expect, it } from "vitest";
import {
  loadInstallAnalytics,
  recordInstallOutcome,
  recordInstallPromptShown,
  type InstallAnalyticsStorage,
} from "./install-analytics";

function createMemoryStorage(): InstallAnalyticsStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

describe("install-analytics", () => {
  it("returns empty counters when storage has no data", () => {
    const storage = createMemoryStorage();
    expect(loadInstallAnalytics(storage)).toEqual({
      promptShown: 0,
      accepted: 0,
      dismissed: 0,
    });
  });

  it("increments prompt and outcome counters", () => {
    const storage = createMemoryStorage();
    const afterPrompt = recordInstallPromptShown(storage);
    const afterDismiss = recordInstallOutcome("dismissed", storage);
    const afterAccept = recordInstallOutcome("accepted", storage);

    expect(afterPrompt.promptShown).toBe(1);
    expect(afterDismiss.dismissed).toBe(1);
    expect(afterAccept.accepted).toBe(1);
    expect(afterAccept.promptShown).toBe(1);
  });

  it("handles corrupted payload gracefully", () => {
    const storage = createMemoryStorage();
    storage.setItem("rise-lvl-up:install-analytics-v1", "{\"broken\":true}");
    const loaded = loadInstallAnalytics(storage);
    expect(loaded.promptShown).toBe(0);
    expect(loaded.accepted).toBe(0);
    expect(loaded.dismissed).toBe(0);
  });
});
