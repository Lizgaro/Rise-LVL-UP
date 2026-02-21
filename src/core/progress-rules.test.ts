import { describe, expect, it } from "vitest";
import { applyEvent } from "./progress-rules";
import type { RPGProfile } from "../domain/types";

describe("ProgressRules", () => {
  it("awards xp for task completion", () => {
    const initial: RPGProfile = {
      level: 1,
      xpTotal: 0,
      xpInLevel: 0,
      streakDays: 0,
    };

    const next = applyEvent(initial, { type: "task_done" });
    expect(next.xpTotal).toBe(25);
  });

  it("limits level-down to once per 24h", () => {
    const now = Date.now();
    const initial: RPGProfile = {
      level: 2,
      xpTotal: 200,
      xpInLevel: 5,
      streakDays: 0,
      lastLevelDownAt: now,
    };

    const next = applyEvent(initial, { type: "habit_relapse", now: now + 60_000 });
    expect(next.level).toBe(2);
  });
});
