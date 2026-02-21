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
import { getTaskById, getTasks, saveTask } from "../storage/repository";

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
  setDayPlan: (taskIds: string[]) => void;
  setWeekPlan: (taskIds: string[]) => void;
  addGoal: (title: string, targetCount: number) => string;
  incrementGoalProgress: (goalId: string) => void;
  addHabit: (title: string, mode: HabitMode) => string;
  markHabitStatus: (habitId: string, status: HabitLogStatus, note?: string) => void;
  startFocusSession: (focusMinutes?: number, breakMinutes?: number) => void;
  completeFocusSession: () => void;
  cancelFocusSession: () => void;
  setNoiseType: (type: NoiseType) => void;
  setNoiseVolume: (volume: number) => void;
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
): RPGProfile {
  const next = applyEvent(profile, event);
  return next;
}

export function createAppStore() {
  return createStore<AppStoreState>()((set, get) => ({
    ...initialState,

    loadInitial: async () => {
      const tasks = await getTasks();
      set({ tasks });
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

      set((prev) => {
        const tasks = prev.tasks.some((task) => task.id === id)
          ? prev.tasks.map((task) => (task.id === id ? nextTask : task))
          : [nextTask, ...prev.tasks];

        let rpg = prev.rpg;
        if (isCompleting) {
          rpg = applyProgressWithBonus(rpg, { type: "task_done" });
          if (prev.dayPlan.priorityTaskIds.includes(id)) {
            rpg = applyProgressWithBonus(rpg, { type: "day_priority_done" });
          }
          if (nextTask.goalId) {
            rpg = applyProgressWithBonus(rpg, { type: "goal_step_done" });
          }
        }

        return { tasks, rpg };
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

    setDayPlan: (taskIds) => {
      try {
        const priorityTaskIds = setDayPriorities(taskIds);
        set((state) => ({
          dayPlan: {
            ...state.dayPlan,
            date: todayKey(),
            priorityTaskIds,
          },
          uiError: undefined,
        }));
      } catch (error) {
        set({ uiError: (error as Error).message });
      }
    },

    setWeekPlan: (taskIds) => {
      try {
        const priorityTaskIds = setWeekPriorities(taskIds);
        set((state) => ({
          weekPlan: {
            ...state.weekPlan,
            weekStartDate: weekStartKey(),
            priorityTaskIds,
          },
          uiError: undefined,
        }));
      } catch (error) {
        set({ uiError: (error as Error).message });
      }
    },

    addGoal: (title, targetCount) => {
      const goal: Goal = {
        id: makeId(),
        title: title.trim() || "Новая цель",
        scope: "week",
        targetCount: Math.max(1, targetCount),
        currentCount: 0,
        status: "active",
      };

      set((state) => ({
        goals: [goal, ...state.goals],
        weekPlan: {
          ...state.weekPlan,
          goalIds: [...new Set([...state.weekPlan.goalIds, goal.id])],
        },
      }));

      return goal.id;
    },

    incrementGoalProgress: (goalId) => {
      set((state) => {
        const goals: Goal[] = state.goals.map((goal) => {
          if (goal.id !== goalId || goal.status !== "active") return goal;
          const currentCount = Math.min(goal.targetCount, goal.currentCount + 1);
          const status: Goal["status"] = currentCount >= goal.targetCount ? "done" : "active";
          return {
            ...goal,
            currentCount,
            status,
          };
        });

        const rpg = applyProgressWithBonus(state.rpg, { type: "goal_step_done" });
        return { goals, rpg };
      });
    },

    addHabit: (title, mode) => {
      const habit: Habit = {
        id: makeId(),
        title: title.trim() || "Новая привычка",
        mode,
        createdAt: Date.now(),
        active: true,
      };

      set((state) => ({
        habits: [habit, ...state.habits],
      }));
      return habit.id;
    },

    markHabitStatus: (habitId, status, note) => {
      const log: HabitLog = {
        id: makeId(),
        habitId,
        date: todayKey(),
        status,
        note,
      };

      set((state) => {
        let rpg = state.rpg;
        if (status === "done") rpg = applyProgressWithBonus(rpg, { type: "habit_done" });
        if (status === "skipped") rpg = applyProgressWithBonus(rpg, { type: "habit_skipped" });
        if (status === "relapse") rpg = applyProgressWithBonus(rpg, { type: "habit_relapse" });

        let recoveryQuest = state.recoveryQuest;
        if (status === "relapse") {
          recoveryQuest = {
            id: makeId(),
            sourceEvent: "habit_relapse",
            title: "Квест восстановления: 1 фокус-сессия + 1 маленькая задача",
            xpBonusMultiplier: 1.5,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            status: "active",
          };
        }

        return {
          habitLogs: [log, ...state.habitLogs],
          rpg,
          recoveryQuest,
        };
      });
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

    completeFocusSession: () => {
      set((state) => {
        const minutes = state.timer.focusMinutes;
        const rpg = applyProgressWithBonus(state.rpg, {
          type: "focus_completed",
          minutes,
        });
        const lastFocusSession: FocusSession = {
          id: makeId(),
          focusMinutes: state.timer.focusMinutes,
          breakMinutes: state.timer.breakMinutes,
          startedAt: state.timer.startedAt ?? Date.now(),
          endedAt: Date.now(),
          status: "done",
        };

        return {
          rpg,
          timer: {
            ...state.timer,
            isRunning: false,
            startedAt: undefined,
          },
          lastFocusSession,
        };
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

    setNoiseType: (type) => {
      noiseController.setType(type);
      if (type === "off") noiseController.stop();
      set((state) => ({
        noise: {
          ...state.noise,
          noiseType: type,
        },
      }));
    },

    setNoiseVolume: (volume) => {
      noiseController.setVolume(volume);
      set((state) => ({
        noise: {
          ...state.noise,
          volume: noiseController.getState().volume,
        },
      }));
    },

    clearUiError: () => set({ uiError: undefined }),
  }));
}

export const appStore = createAppStore();

export function useAppStore<T>(selector: (state: AppStoreState) => T): T {
  return useStore(appStore, selector);
}
