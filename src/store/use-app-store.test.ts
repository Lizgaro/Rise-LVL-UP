import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAllData } from "../storage/repository";
import { createAppStore } from "./use-app-store";

const TIMER_STORAGE_KEY = "rise-lvl-up:timer-v1";

describe("AppStore", () => {
  beforeEach(() => {
    const memoryStorage = (() => {
      const map = new Map<string, string>();
      return {
        getItem: (key: string) => map.get(key) ?? null,
        setItem: (key: string, value: string) => {
          map.set(key, value);
        },
        removeItem: (key: string) => {
          map.delete(key);
        },
        clear: () => {
          map.clear();
        },
      };
    })();

    vi.stubGlobal("localStorage", memoryStorage);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await clearAllData();
  });

  it("adds task and applies xp on completion", async () => {
    const store = createAppStore();
    const id = await store.getState().addTask("Прочитать 10 страниц", "task");
    await store.getState().toggleTaskDone(id);

    expect(store.getState().rpg.xpTotal).toBeGreaterThan(0);
    expect(store.getState().tasks.find((t) => t.id === id)?.status).toBe("done");
  });

  it("runs countdown and auto-switches from focus to break", () => {
    const store = createAppStore();
    store.getState().startFocusSession(10, 1);

    const focusEndsAt = store.getState().timer.endsAt;
    expect(focusEndsAt).toBeDefined();
    store.getState().tickTimer((focusEndsAt ?? 0) + 1);

    const state = store.getState();
    expect(state.timer.phase).toBe("break");
    expect(state.timer.isRunning).toBe(true);
    expect(state.rpg.xpTotal).toBeGreaterThan(0);
  });

  it("ends break automatically and returns timer to idle", () => {
    const store = createAppStore();
    store.getState().startFocusSession(1, 1);
    const focusEndsAt = store.getState().timer.endsAt ?? 0;
    store.getState().tickTimer(focusEndsAt + 1);

    const breakEndsAt = store.getState().timer.endsAt;
    expect(breakEndsAt).toBeDefined();
    store.getState().tickTimer((breakEndsAt ?? 0) + 1);

    const state = store.getState();
    expect(state.timer.phase).toBe("idle");
    expect(state.timer.isRunning).toBe(false);
  });

  it("restores active timer from local storage during load", async () => {
    const now = 2_000_000;
    const spy = vi.spyOn(Date, "now").mockReturnValue(now);
    localStorage.setItem(
      TIMER_STORAGE_KEY,
      JSON.stringify({
        focusMinutes: 30,
        breakMinutes: 5,
        phase: "focus",
        isRunning: true,
        startedAt: now - 10_000,
        endsAt: now + 20_000,
        remainingMs: 20_000,
      }),
    );

    const store = createAppStore();
    await store.getState().loadInitial();

    const timer = store.getState().timer;
    expect(timer.phase).toBe("focus");
    expect(timer.isRunning).toBe(true);
    expect(timer.remainingMs).toBe(20_000);
    spy.mockRestore();
  });

  it("restores goals habits plans rpg and noise from indexeddb", async () => {
    const store = createAppStore();
    const taskId = await store.getState().addTask("Сделать тренировку", "task");
    store.getState().setDayPlan([taskId]);
    store.getState().setWeekPlan([taskId]);
    const goalId = store.getState().addGoal("Прочитать книгу", 2);
    store.getState().incrementGoalProgress(goalId);
    const habitId = store.getState().addHabit("Без сигарет", "quit");
    store.getState().markHabitStatus(habitId, "relapse", "Срыв после стресса");
    store.getState().setNoiseType("pink");
    store.getState().setNoiseVolume(0.65);

    const persistedRpg = store.getState().rpg;
    await store.getState().flushPersistence();

    const restored = createAppStore();
    await restored.getState().loadInitial();
    const next = restored.getState();

    expect(next.goals.find((goal) => goal.id === goalId)?.currentCount).toBe(1);
    expect(next.habits.find((habit) => habit.id === habitId)?.mode).toBe("quit");
    expect(next.habitLogs.some((log) => log.habitId === habitId)).toBe(true);
    expect(next.dayPlan.priorityTaskIds).toContain(taskId);
    expect(next.weekPlan.priorityTaskIds).toContain(taskId);
    expect(next.weekPlan.goalIds).toContain(goalId);
    expect(next.rpg.xpTotal).toBe(persistedRpg.xpTotal);
    expect(next.rpg.level).toBe(persistedRpg.level);
    expect(next.recoveryQuest?.status).toBe("active");
    expect(next.noise.noiseType).toBe("pink");
    expect(next.noise.volume).toBe(0.65);
  });
});
