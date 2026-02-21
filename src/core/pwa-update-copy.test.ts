import { describe, expect, it } from "vitest";
import { buildPwaUpdateCopy } from "./pwa-update-copy";

describe("pwa-update-copy", () => {
  it("shows default refresh copy when online and idle", () => {
    const copy = buildPwaUpdateCopy({
      needRefresh: true,
      isOnline: true,
      timerRunning: false,
      isUpdating: false,
    });

    expect(copy.title).toContain("новая версия");
    expect(copy.buttonLabel).toBe("Обновить сейчас");
    expect(copy.buttonDisabled).toBe(false);
  });

  it("defers update interaction during active focus session", () => {
    const copy = buildPwaUpdateCopy({
      needRefresh: true,
      isOnline: true,
      timerRunning: true,
      isUpdating: false,
    });

    expect(copy.body).toContain("после фокус-сессии");
    expect(copy.buttonDisabled).toBe(true);
  });

  it("shows offline-safe copy and disables update", () => {
    const copy = buildPwaUpdateCopy({
      needRefresh: true,
      isOnline: false,
      timerRunning: false,
      isUpdating: false,
    });

    expect(copy.hint).toContain("офлайн");
    expect(copy.buttonDisabled).toBe(true);
  });

  it("shows progress copy while updating", () => {
    const copy = buildPwaUpdateCopy({
      needRefresh: true,
      isOnline: true,
      timerRunning: false,
      isUpdating: true,
    });

    expect(copy.buttonLabel).toBe("Обновляем...");
    expect(copy.buttonDisabled).toBe(true);
  });
});
