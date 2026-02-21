import { describe, expect, it } from "vitest";
import { resolveTimerShortcut } from "./timer-shortcuts";

describe("resolveTimerShortcut", () => {
  it("starts timer from idle by Space or S", () => {
    expect(resolveTimerShortcut(" ", "idle")).toBe("start");
    expect(resolveTimerShortcut("s", "idle")).toBe("start");
    expect(resolveTimerShortcut("S", "idle")).toBe("start");
  });

  it("toggles pause on Space during active phases", () => {
    expect(resolveTimerShortcut(" ", "focus")).toBe("togglePause");
    expect(resolveTimerShortcut(" ", "break")).toBe("togglePause");
  });

  it("resets active timer by R", () => {
    expect(resolveTimerShortcut("r", "focus")).toBe("cancel");
    expect(resolveTimerShortcut("R", "break")).toBe("cancel");
    expect(resolveTimerShortcut("r", "idle")).toBeNull();
  });
});
