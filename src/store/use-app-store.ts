import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { createNoiseController } from "../audio/noise-engine";
import { setDayPriorities, setWeekPriorities } from "../core/planning";
import { applyEvent } from "../core/progress-rules";
import { TIMER_DEFAULTS } from "../domain/constants";
import type {
  AudioSettings,
  DayPlan,
  FocusSession,
  Goal,
  Habit,
  HabitLog,
  HabitLogStatus,
  HabitMode,
  NoiseType,
  RecoveryQuest,
  RPGProfile,
  Task,
  TaskType,
  WeekPlan,
} from "../domain/types";
import {
  getAudioSettings,
  getDayPlan,
  getGoals,
  getHabitLogs,
  getHabits,
  getRecoveryQuests,
  getRPGProfile,
  getTaskById,
  getTasks,
  getWeekPlan,
  saveAudioSettings,
  saveDayPlan,
  saveFocusSession,
  saveGoal,
  saveHabit,
  saveHabitLog,
  saveRecoveryQuest,
  saveRPGProfile,
  saveTask,
  saveWeekPlan,
} from "../storage/repository";

type TimerUiState = {
  focusMinutes: number;
  breakMinutes: number;
  isRunning: boolean;
  startedAt?: number;
};

export interface AppState {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  habitLogs: HabitLog[];
  dayPlan: DayPlan;
  weekPlan: WeekPlan;
  rpg: RPGProfile;
  recoveryQuest?: RecoveryQuest;
  timer: TimerUiState;
  noise: AudioSettings;
  lastFocusSession?: FocusSession;
  uiError?: string;
}

export interface AppActions {
  loadInitial: () => Promise<void>;
  addTask: (title: string, type: TaskType) => Promise<string>;
  toggleTaskDone: (id: string) => Promise<void>;
  setTaskScope: (id: string, scope: Task["planScope"]) => Promise<void>;
  setDayPlan: (taskIds: string[]) => Promise<void>;
  setWeekPlan: (taskIds: string[]) => Promise<void>;
  addGoal: (title: string, targetCount: number) => Promise<string>;
  incrementGoalProgress: (goalId: string) => Promise<void>;
  addHabit: (title: string, mode: HabitMode) => Promise<string>;
  markHabitStatus: (habitId: string, status: HabitLogStatus, note?: string) => Promise<void>;
  startFocusSession: (focusMinutes?: number, breakMinutes?: number) => void;
  completeFocusSession: () => Promise<void>;
  cancelFocusSession: () => void;
  setNoiseType: (type: NoiseType) => Promise<void>;
  setNoiseVolume: (volume: number) => Promise<void>;
  clearUiError: () => void;
}

export type AppStoreState = AppState & AppActions;

const noiseController = createNoiseController();

function makeId(): string {
  return crypto.randomUUID();
}

function todayKey(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

function weekStartKey(now: number = Date.now()): string {
  const d = new Date(now);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

const initialRpg: RPGProfile = {
  level: 1,
  xpTotal: 0,
  xpInLevel: 0,
  streakDays: 0,
  dailyXpEarned: 0,
  recoveryBoostActionsRemaining: 0,
};

const initialState: Omit<AppStoreState, keyof AppActions> = {
  tasks: [],
  goals: [],
  habits: [],
  habitLogs: [],
  dayPlan: {
    date: todayKey(),
    priorityTaskIds: [],
  },
  weekPlan: {
    weekStartDate: weekStartKey(),
    priorityTaskIds: [],
    goalIds: [],
  },
  rpg: initialRpg,
  timer: {
    focusMinutes: TIMER_DEFAULTS.focusMinutes,
    breakMinutes: TIMER_DEFAULTS.breakMinutes,
    isRunning: false,
  },
  noise: {
    noiseType: "off",
    volume: noiseController.getState().volume,
    enabledPerSession: false,
  },
};

function applyProgressWithBonus(
  profile: RPGProfile,
  event:
    | { type: "task_done" | "day_priority_done" | "goal_step_done" | "habit_done" | "habit_skipped" | "habit_relapse" | "task_missed" }
    | { type: "focus_completed"; minutes: number },
  quest?: RecoveryQuest,
): RPGProfile {
  let multiplier = 1.0;
  if (quest && quest.status === "active") {
    multiplier = quest.xpBonusMultiplier;
  }

  const next = applyEvent(profile, event, multiplier);
  return next;
}

export function createAppStore() {
  return createStore<AppStoreState>()((set, get) => ({
    ...initialState,

    loadInitial: async () => {
      const tasks = await getTasks();
      const habits = await getHabits();
      const habitLogs = await getHabitLogs();
      const goals = await getGoals();
      const rpg = await getRPGProfile();
      const audio = await getAudioSettings();
      const quests = await getRecoveryQuests();
      const day = await getDayPlan(todayKey());
      const week = await getWeekPlan(weekStartKey());

      let activeQuest = quests.find((q) => q.status === "active");
      if (activeQuest && Date.now() > activeQuest.expiresAt) {
        activeQuest = { ...activeQuest, status: "expired" };
        await saveRecoveryQuest(activeQuest);
        activeQuest = undefined;
      }

      set((state) => ({
        tasks,
        habits,
        habitLogs,
        goals,
        rpg: rpg ?? state.rpg,
        noise: audio ?? state.noise,
        recoveryQuest: activeQuest,
        dayPlan: day ?? state.dayPlan,
        weekPlan: week ?? state.weekPlan,
      }));
    },

    addTask: async (title, type) => {
      const trimmed = title.trim();
      if (!trimmed) {
        set({ uiError: "Название задачи не может быть пустым" });
        throw new Error("Название задачи не может быть пустым");
      }

      const task: Task = {
        id: makeId(),
        title: trimmed,
        type,
        status: "todo",
        planScope: "inbox",
        createdAt: Date.now(),
      };

      await saveTask(task);
      set((state) => ({ tasks: [task, ...state.tasks] }));
      return task.id;
    },

    toggleTaskDone: async (id) => {
      const state = get();
      const existing = state.tasks.find((task) => task.id === id) ?? (await getTaskById(id));
      if (!existing) return;

      const isCompleting = existing.status !== "done";
      const nextTask: Task = {
        ...existing,
        status: isCompleting ? "done" : "todo",
        completedAt: isCompleting ? Date.now() : undefined,
      };

      await saveTask(nextTask);

      const prevState = get();
      let rpg = prevState.rpg;
      let recoveryQuest = prevState.recoveryQuest;

      if (isCompleting) {
        rpg = applyProgressWithBonus(rpg, { type: "task_done" }, recoveryQuest);
        if (prevState.dayPlan.priorityTaskIds.includes(id)) {
          rpg = applyProgressWithBonus(rpg, { type: "day_priority_done" }, recoveryQuest);
        }
        if (nextTask.goalId) {
          rpg = applyProgressWithBonus(rpg, { type: "goal_step_done" }, recoveryQuest);
        }

        if (recoveryQuest?.status === "active") {
          recoveryQuest = { ...recoveryQuest, taskDone: true };
          if (recoveryQuest.focusDone) {
            recoveryQuest.status = "done";
          }
          await saveRecoveryQuest(recoveryQuest);
        }
      }

      if (rpg !== prevState.rpg) {
        await saveRPGProfile(rpg);
      }

      set((prev) => {
        const tasks = prev.tasks.some((task) => task.id === id)
          ? prev.tasks.map((task) => (task.id === id ? nextTask : task))
          : [nextTask, ...prev.tasks];
        return { tasks, rpg, recoveryQuest };
      });
    },

    setTaskScope: async (id, scope) => {
      const existing = get().tasks.find((task) => task.id === id) ?? (await getTaskById(id));
      if (!existing) return;

      const nextTask: Task = { ...existing, planScope: scope };
      await saveTask(nextTask);
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? nextTask : task)),
      }));
    },

    setDayPlan: async (taskIds) => {
      try {
        const priorityTaskIds = setDayPriorities(taskIds);
        const nextPlan: DayPlan = {
          date: todayKey(),
          priorityTaskIds,
        };
        await saveDayPlan(nextPlan);
        set({
          dayPlan: nextPlan,
          uiError: undefined,
        });
      } catch (error) {
        set({ uiError: (error as Error).message });
      }
    },

    setWeekPlan: async (taskIds) => {
      try {
        const priorityTaskIds = setWeekPriorities(taskIds);
        const nextPlan: WeekPlan = {
          ...get().weekPlan,
          weekStartDate: weekStartKey(),
          priorityTaskIds,
        };
        await saveWeekPlan(nextPlan);
        set({
          weekPlan: nextPlan,
          uiError: undefined,
        });
      } catch (error) {
        set({ uiError: (error as Error).message });
      }
    },

    addGoal: async (title, targetCount) => {
      const goal: Goal = {
        id: makeId(),
        title: title.trim() || "Новая цель",
        scope: "week",
        targetCount: Math.max(1, targetCount),
        currentCount: 0,
        status: "active",
      };

      await saveGoal(goal);
      const state = get();
      const nextWeekPlan = {
        ...state.weekPlan,
        goalIds: [...new Set([...state.weekPlan.goalIds, goal.id])],
      };
      await saveWeekPlan(nextWeekPlan);

      set((prev) => ({
        goals: [goal, ...prev.goals],
        weekPlan: nextWeekPlan,
      }));

      return goal.id;
    },

    incrementGoalProgress: async (goalId) => {
      const state = get();
      const targetGoal = state.goals.find((g) => g.id === goalId);
      if (!targetGoal || targetGoal.status !== "active") return;

      const currentCount = Math.min(targetGoal.targetCount, targetGoal.currentCount + 1);
      const status: Goal["status"] = currentCount >= targetGoal.targetCount ? "done" : "active";
      const nextGoal: Goal = { ...targetGoal, currentCount, status };

      await saveGoal(nextGoal);

      const rpg = applyProgressWithBonus(state.rpg, { type: "goal_step_done" });
      await saveRPGProfile(rpg);

      set((prev) => {
        const goals = prev.goals.map((g) => (g.id === goalId ? nextGoal : g));
        return { goals, rpg };
      });
    },

    addHabit: async (title, mode) => {
      const habit: Habit = {
        id: makeId(),
        title: title.trim() || "Новая привычка",
        mode,
        createdAt: Date.now(),
        active: true,
      };

      await saveHabit(habit);
      set((state) => ({
        habits: [habit, ...state.habits],
      }));
      return habit.id;
    },

    markHabitStatus: async (habitId, status, note) => {
      const log: HabitLog = {
        id: makeId(),
        habitId,
        date: todayKey(),
        status,
        note,
      };

      await saveHabitLog(log);

      const prevState = get();
      let rpg = prevState.rpg;
      if (status === "done") rpg = applyProgressWithBonus(rpg, { type: "habit_done" });
      if (status === "skipped") rpg = applyProgressWithBonus(rpg, { type: "habit_skipped" });
      if (status === "relapse") rpg = applyProgressWithBonus(rpg, { type: "habit_relapse" });

      let recoveryQuest = prevState.recoveryQuest;
      if (status === "relapse") {
        recoveryQuest = {
          id: makeId(),
          sourceEvent: "habit_relapse",
          title: "Квест восстановления: 1 фокус-сессия + 1 маленькая задача",
          xpBonusMultiplier: 1.5,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          status: "active",
        };
        await saveRecoveryQuest(recoveryQuest);
      }

      if (rpg !== prevState.rpg) {
        await saveRPGProfile(rpg);
      }

      set((state) => ({
        habitLogs: [log, ...state.habitLogs],
        rpg,
        recoveryQuest,
      }));
    },

    startFocusSession: (focusMinutes, breakMinutes) => {
      set((state) => ({
        timer: {
          ...state.timer,
          focusMinutes: focusMinutes ?? state.timer.focusMinutes,
          breakMinutes: breakMinutes ?? state.timer.breakMinutes,
          isRunning: true,
          startedAt: Date.now(),
        },
      }));
    },

    completeFocusSession: async () => {
      const state = get();
      const minutes = state.timer.focusMinutes;
      let recoveryQuest = state.recoveryQuest;

      const rpg = applyProgressWithBonus(state.rpg, {
        type: "focus_completed",
        minutes,
      }, recoveryQuest);

      if (recoveryQuest?.status === "active") {
        recoveryQuest = { ...recoveryQuest, focusDone: true };
        if (recoveryQuest.taskDone) {
          recoveryQuest.status = "done";
        }
        await saveRecoveryQuest(recoveryQuest);
      }

      const lastFocusSession: FocusSession = {
        id: makeId(),
        focusMinutes: state.timer.focusMinutes,
        breakMinutes: state.timer.breakMinutes,
        startedAt: state.timer.startedAt ?? Date.now(),
        endedAt: Date.now(),
        status: "done",
      };

      await saveFocusSession(lastFocusSession);
      await saveRPGProfile(rpg);

      set({
        rpg,
        recoveryQuest,
        timer: {
          ...state.timer,
          isRunning: false,
          startedAt: undefined,
        },
        lastFocusSession,
      });
    },

    cancelFocusSession: () => {
      set((state) => ({
        timer: {
          ...state.timer,
          isRunning: false,
          startedAt: undefined,
        },
      }));
    },

    setNoiseType: async (type) => {
      noiseController.setType(type);
      if (type === "off") noiseController.stop();
      const nextNoise = {
        ...get().noise,
        noiseType: type,
      };
      await saveAudioSettings(nextNoise);
      set({ noise: nextNoise });
    },

    setNoiseVolume: async (volume) => {
      noiseController.setVolume(volume);
      const nextNoise = {
        ...get().noise,
        volume: noiseController.getState().volume,
      };
      await saveAudioSettings(nextNoise);
      set({ noise: nextNoise });
    },

    clearUiError: () => set({ uiError: undefined }),
  }));
}

export const appStore = createAppStore();

export function useAppStore<T>(selector: (state: AppStoreState) => T): T {
  return useStore(appStore, selector);
}
