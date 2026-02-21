import { describe, expect, it } from "vitest";
import { buildHealthChecks } from "./health-checks";

describe("buildHealthChecks", () => {
  it("marks all systems ready when capabilities exist", () => {
    const checks = buildHealthChecks({
      microphoneReady: true,
      audioReady: true,
      indexedDbReady: true,
    });

    expect(checks.every((check) => check.status === "ready")).toBe(true);
    expect(checks.map((check) => check.id)).toEqual(["microphone", "audio", "storage"]);
  });

  it("reports warnings when capabilities are missing", () => {
    const checks = buildHealthChecks({
      microphoneReady: false,
      audioReady: false,
      indexedDbReady: false,
    });

    expect(checks.every((check) => check.status === "warn")).toBe(true);
    expect(checks[0]?.detail).toContain("недоступ");
    expect(checks[1]?.detail).toContain("недоступ");
    expect(checks[2]?.detail).toContain("недоступ");
  });
});
