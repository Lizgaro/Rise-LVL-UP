import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import {
  clearAllData,
  getAudioSettings,
  getDayPlan,
  getGoals,
  getHabitLogs,
  getHabits,
  getRecoveryQuests,
  getRPGProfile,
  getTasks,
  getWeekPlan,
  saveAudioSettings,
  saveDayPlan,
  saveGoal,
  saveHabit,
  saveHabitLog,
  saveRecoveryQuest,
  saveRPGProfile,
  saveTask,
  saveWeekPlan,
} from "./repository";
import type { Goal, Habit, RPGProfile, Task } from "../domain/types";

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

  it("persists and reads habits", async () => {
    const habit: Habit = {
      id: "h1",
      title: "Meditation",
      mode: "build",
      createdAt: Date.now(),
      active: true,
    };
    await saveHabit(habit);
    const habits = await getHabits();
    expect(habits).toHaveLength(1);
    expect(habits[0].title).toBe("Meditation");
  });

  it("persists and reads RPG profile", async () => {
    const profile: RPGProfile = {
      level: 5,
      xpTotal: 1000,
      xpInLevel: 200,
      streakDays: 3,
    };
    await saveRPGProfile(profile);
    const loaded = await getRPGProfile();
    expect(loaded?.level).toBe(5);
    expect(loaded?.xpTotal).toBe(1000);
  });

  it("persists and reads plans", async () => {
    await saveDayPlan({ date: "2026-02-21", priorityTaskIds: ["t1"] });
    const plan = await getDayPlan("2026-02-21");
    expect(plan?.priorityTaskIds).toContain("t1");
  });
});
