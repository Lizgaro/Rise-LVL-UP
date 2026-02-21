import { describe, expect, it } from "vitest";
import { buildReviewInsights } from "./review-insights";

describe("buildReviewInsights", () => {
  it("returns reinforcement hints for strong week", () => {
    const hints = buildReviewInsights({
      prioritiesDone: 5,
      prioritiesMissed: 0,
      prioritiesTotal: 5,
      goalsDone: 2,
      goalsTotal: 2,
      habitDoneLogs: 9,
      relapses: 0,
    });

    expect(hints.join(" ")).toContain("ритм");
    expect(hints.join(" ")).toContain("цели");
  });

  it("returns correction hints for weak week", () => {
    const hints = buildReviewInsights({
      prioritiesDone: 1,
      prioritiesMissed: 3,
      prioritiesTotal: 5,
      goalsDone: 0,
      goalsTotal: 2,
      habitDoneLogs: 1,
      relapses: 2,
    });

    expect(hints.join(" ")).toContain("приоритет");
    expect(hints.join(" ")).toContain("срыв");
  });
});
