import { describe, expect, it } from "vitest";
import { selectDailyFocusTarget } from "./focus-target";
import type { Goal, Task } from "../domain/types";

function makeTask(id: string, status: Task["status"] = "todo"): Task {
  return {
    id,
    title: id,
    type: "task",
    status,
    planScope: "day",
    createdAt: 1,
  };
}

function makeGoal(id: string, scope: Goal["scope"] = "week", status: Goal["status"] = "active"): Goal {
  return {
    id,
    title: id,
    scope,
    targetCount: 3,
    currentCount: 0,
    status,
  };
}

describe("selectDailyFocusTarget", () => {
  it("prefers active day goal over day tasks", () => {
    const target = selectDailyFocusTarget(
      [makeTask("task-1")],
      ["task-1"],
      [makeGoal("goal-day", "day", "active")],
    );

    expect(target?.kind).toBe("goal");
    expect(target?.item.id).toBe("goal-day");
  });

  it("falls back to next todo day task when day goal is absent", () => {
    const target = selectDailyFocusTarget(
      [makeTask("task-done", "done"), makeTask("task-next", "todo")],
      ["task-done", "task-next"],
      [makeGoal("goal-week", "week", "active")],
    );

    expect(target?.kind).toBe("task");
    expect(target?.item.id).toBe("task-next");
  });

  it("returns null when no active day goal and no todo day tasks", () => {
    const target = selectDailyFocusTarget(
      [makeTask("task-done", "done")],
      ["task-done"],
      [makeGoal("goal-day-done", "day", "done")],
    );

    expect(target).toBeNull();
  });
});
