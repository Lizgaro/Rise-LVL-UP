import { describe, expect, it } from "vitest";
import { initialPwaStatus, nextPwaStatus } from "./pwa-status";

describe("pwa-status", () => {
  it("marks offline ready without update requirement", () => {
    const next = nextPwaStatus(initialPwaStatus, { type: "offline_ready" });
    expect(next.offlineReady).toBe(true);
    expect(next.needRefresh).toBe(false);
  });

  it("marks need refresh and keeps offline status", () => {
    const withOffline = nextPwaStatus(initialPwaStatus, { type: "offline_ready" });
    const next = nextPwaStatus(withOffline, { type: "need_refresh" });
    expect(next.needRefresh).toBe(true);
    expect(next.offlineReady).toBe(true);
  });

  it("resets transient update status after apply", () => {
    const withUpdate = nextPwaStatus(initialPwaStatus, { type: "need_refresh" });
    const next = nextPwaStatus(withUpdate, { type: "reset" });
    expect(next.needRefresh).toBe(false);
    expect(next.offlineReady).toBe(false);
  });
});
