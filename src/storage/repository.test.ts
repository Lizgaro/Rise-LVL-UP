import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import {
  clearAllData,
  exportBackup,
  getTasks,
  importBackup,
  loadPersistedSnapshot,
  saveDayPlan,
  saveGoal,
  saveMonthPlan,
  saveRpgProfile,
  saveTask,
  saveWeekPlan,
} from "./repository";
import type { Goal, Task } from "../domain/types";

describe("Repository", () => {
  afterEach(async () => {
    await clearAllData();
  });

  it("persists and reads tasks", async () => {
    const task: Task = {
      id: "t1",
      title: "Тест",
      type: "task",
      status: "todo",
      planScope: "inbox",
      createdAt: 1,
    };

    await saveTask(task);
    const tasks = await getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Тест");
  });

  it("exports and imports full backup snapshot", async () => {
    const task: Task = {
      id: "t2",
      title: "Подготовить отчет",
      type: "task",
      status: "todo",
      planScope: "day",
      createdAt: 2,
    };
    const goal: Goal = {
      id: "g2",
      title: "Закрыть спринт",
      scope: "week",
      targetCount: 3,
      currentCount: 1,
      status: "active",
    };

    await saveTask(task);
    await saveGoal(goal);
    await saveDayPlan({ date: "2026-02-21", priorityTaskIds: [task.id] });
    await saveWeekPlan({
      weekStartDate: "2026-02-16",
      priorityTaskIds: [task.id],
      goalIds: [goal.id],
    });
    await saveMonthPlan({
      monthStartDate: "2026-02-01",
      priorityTaskIds: [task.id],
    });
    await saveRpgProfile({
      level: 2,
      xpTotal: 120,
      xpInLevel: 20,
      streakDays: 2,
      dailyXpEarned: 40,
      recoveryBoostActionsRemaining: 0,
    });

    const backup = await exportBackup();
    await clearAllData();
    await importBackup(backup);

    const restored = await loadPersistedSnapshot();
    expect(restored.tasks).toHaveLength(1);
    expect(restored.goals).toHaveLength(1);
    expect(restored.dayPlan?.priorityTaskIds).toContain(task.id);
    expect(restored.weekPlan?.goalIds).toContain(goal.id);
    expect(restored.monthPlan?.priorityTaskIds).toContain(task.id);
    expect(restored.rpg?.level).toBe(2);
  });
});
