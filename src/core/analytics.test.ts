import { describe, expect, it } from "vitest";
import { buildHabitStreaks, buildWeeklySummary } from "./analytics";
import type { Goal, Habit, HabitLog, Task, WeekPlan } from "../domain/types";

describe("analytics", () => {
  it("builds streak for build habit by consecutive done days", () => {
    const habit: Habit = {
      id: "h1",
      title: "Читать 20 минут",
      mode: "build",
      createdAt: new Date("2026-02-01T00:00:00.000Z").getTime(),
      active: true,
    };
    const logs: HabitLog[] = [
      { id: "l1", habitId: "h1", date: "2026-02-21", status: "done" },
      { id: "l2", habitId: "h1", date: "2026-02-20", status: "done" },
      { id: "l3", habitId: "h1", date: "2026-02-19", status: "skipped" },
    ];

    const result = buildHabitStreaks([habit], logs, new Date("2026-02-21T12:00:00.000Z").getTime());
    expect(result[0].streakDays).toBe(2);
  });

  it("builds streak for quit habit as days without relapse", () => {
    const habit: Habit = {
      id: "h-quit",
      title: "Без сигарет",
      mode: "quit",
      createdAt: new Date("2026-02-01T00:00:00.000Z").getTime(),
      active: true,
    };
    const logs: HabitLog[] = [
      { id: "q1", habitId: "h-quit", date: "2026-02-18", status: "relapse" },
      { id: "q2", habitId: "h-quit", date: "2026-02-20", status: "done" },
    ];

    const result = buildHabitStreaks([habit], logs, new Date("2026-02-21T12:00:00.000Z").getTime());
    expect(result[0].streakDays).toBe(3);
  });

  it("builds weekly summary for priorities goals and habits", () => {
    const tasks: Task[] = [
      { id: "t1", title: "A", type: "task", status: "done", planScope: "week", createdAt: 1 },
      { id: "t2", title: "B", type: "task", status: "missed", planScope: "week", createdAt: 1 },
      { id: "t3", title: "C", type: "task", status: "todo", planScope: "week", createdAt: 1 },
    ];
    const goals: Goal[] = [
      { id: "g1", title: "Goal 1", scope: "week", targetCount: 5, currentCount: 5, status: "done" },
      { id: "g2", title: "Goal 2", scope: "week", targetCount: 5, currentCount: 2, status: "active" },
    ];
    const habits: Habit[] = [
      {
        id: "h1",
        title: "Тренировка",
        mode: "build",
        createdAt: new Date("2026-02-01T00:00:00.000Z").getTime(),
        active: true,
      },
    ];
    const logs: HabitLog[] = [
      { id: "l1", habitId: "h1", date: "2026-02-20", status: "done" },
      { id: "l2", habitId: "h1", date: "2026-02-21", status: "relapse" },
      { id: "l3", habitId: "h1", date: "2026-02-10", status: "done" },
    ];
    const weekPlan: WeekPlan = {
      weekStartDate: "2026-02-16",
      priorityTaskIds: ["t1", "t2", "t3"],
      goalIds: ["g1", "g2"],
    };

    const summary = buildWeeklySummary(tasks, goals, habits, logs, weekPlan, new Date("2026-02-21T12:00:00.000Z").getTime());
    expect(summary.prioritiesDone).toBe(1);
    expect(summary.prioritiesMissed).toBe(1);
    expect(summary.goalsDone).toBe(1);
    expect(summary.habitDoneLogs).toBe(1);
    expect(summary.relapses).toBe(1);
  });
});
