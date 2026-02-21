import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { createNoiseController } from "../audio/noise-engine";
import { getLocalDateKey, getLocalWeekStartKey } from "../core/date-keys";
import { setDayPriorities, setWeekPriorities } from "../core/planning";
import { applyEvent } from "../core/progress-rules";
import { TIMER_DEFAULTS } from "../domain/constants";
import type {
  AudioSettings,
  DayPlan,
  DomainEvent,
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
  getTaskById,
  loadPersistedSnapshot,
  saveAudioSettings,
  saveDayPlan,
  saveFocusSession,
  saveGoal,
  saveGoals,
  saveHabit,
  saveHabitLog,
  saveRecoveryQuest,
  saveRpgProfile,
  saveTask,
  saveWeekPlan,
} from "../storage/repository";

type TimerPhase = "idle" | "focus" | "break";

type TimerUiState = {
  focusMinutes: number;
  breakMinutes: number;
  isRunning: boolean;
  phase: TimerPhase;
  remainingMs: number;
  startedAt?: number;
  endsAt?: number;
};

type XpEvent = {
  id: string;
  label: string;
  delta: number;
  createdAt: number;
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
  xpEvents: XpEvent[];
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
  toggleTimerPause: () => void;
  applyMissedTasks: (now?: number) => Promise<void>;
  closeDayPlan: () => Promise<void>;
  tickTimer: (now?: number) => void;
  completeFocusSession: () => void;
  cancelFocusSession: () => void;
  setNoiseType: (type: NoiseType) => void;
  setNoiseVolume: (volume: number) => void;
  flushPersistence: () => Promise<void>;
  clearUiError: () => void;
}

export type AppStoreState = AppState & AppActions;

const noiseController = createNoiseController();

function makeId(): string {
  return crypto.randomUUID();
}

function todayKey(now: number = Date.now()): string {
  return getLocalDateKey(now);
}

function weekStartKey(now: number = Date.now()): string {
  return getLocalWeekStartKey(now);
}

const initialRpg: RPGProfile = {
  level: 1,
  xpTotal: 0,
  xpInLevel: 0,
  streakDays: 0,
  dailyXpEarned: 0,
  recoveryBoostActionsRemaining: 0,
};

const MS_IN_MINUTE = 60_000;
const TIMER_STORAGE_KEY = "rise-lvl-up:timer-v1";
const MAX_XP_EVENTS = 20;
const STORE_SYNC_CHANNEL = "rise-lvl-up:store-sync-v1";
const PERSISTENCE_ERROR_MESSAGE =
  "Ошибка сохранения данных. Проверь резервную копию и перезагрузи приложение.";

type SyncMessage = {
  type: "snapshot_saved";
  sourceId: string;
  at: number;
};

function isSyncMessage(value: unknown): value is SyncMessage {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<SyncMessage>;
  return payload.type === "snapshot_saved" && typeof payload.sourceId === "string" && typeof payload.at === "number";
}

function clampMinutes(minutes: number, fallback: number): number {
  if (!Number.isFinite(minutes)) return fallback;
  return Math.max(1, Math.floor(minutes));
}

function createIdleTimer(focusMinutes: number, breakMinutes: number): TimerUiState {
  return {
    focusMinutes,
    breakMinutes,
    isRunning: false,
    phase: "idle",
    remainingMs: focusMinutes * MS_IN_MINUTE,
    startedAt: undefined,
    endsAt: undefined,
  };
}

function hasStorage(): boolean {
  return typeof localStorage !== "undefined";
}

function saveTimerSnapshot(timer: TimerUiState): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
  } catch {
    // Ignore storage failures to keep timer usable.
  }
}

function loadTimerSnapshot(): TimerUiState | undefined {
  if (!hasStorage()) return undefined;

  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<TimerUiState>;
    const focusMinutes = clampMinutes(parsed.focusMinutes ?? TIMER_DEFAULTS.focusMinutes, TIMER_DEFAULTS.focusMinutes);
    const breakMinutes = clampMinutes(parsed.breakMinutes ?? TIMER_DEFAULTS.breakMinutes, TIMER_DEFAULTS.breakMinutes);
    const phase: TimerPhase =
      parsed.phase === "focus" || parsed.phase === "break" || parsed.phase === "idle"
        ? parsed.phase
        : "idle";
    const isRunning = Boolean(parsed.isRunning) && phase !== "idle";
    const remainingMs = Math.max(0, Number(parsed.remainingMs ?? focusMinutes * MS_IN_MINUTE));
    const startedAt = typeof parsed.startedAt === "number" ? parsed.startedAt : undefined;
    const endsAt = typeof parsed.endsAt === "number" ? parsed.endsAt : undefined;

    return {
      focusMinutes,
      breakMinutes,
      phase,
      isRunning,
      remainingMs,
      startedAt,
      endsAt,
    };
  } catch {
    return undefined;
  }
}

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
  xpEvents: [],
  timer: createIdleTimer(TIMER_DEFAULTS.focusMinutes, TIMER_DEFAULTS.breakMinutes),
  noise: {
    noiseType: "off",
    volume: noiseController.getState().volume,
    enabledPerSession: false,
  },
};

function applyProgressWithBonus(
  profile: RPGProfile,
  event: DomainEvent,
): RPGProfile {
  const next = applyEvent(profile, event);
  return next;
}

function progressEventLabel(event: DomainEvent): string {
  switch (event.type) {
    case "task_done":
      return "Задача выполнена";
    case "day_priority_done":
      return "Приоритет дня выполнен";
    case "goal_step_done":
      return "Шаг по цели";
    case "focus_completed":
      return `Фокус-сессия ${event.minutes} мин`;
    case "habit_done":
      return "Привычка выполнена";
    case "habit_skipped":
      return "Привычка: пропуск";
    case "habit_relapse":
      return "Привычка: срыв";
    case "task_missed":
      return "Пропущен приоритет";
    default:
      return "Прогресс";
  }
}

function mergeXpEvents(current: XpEvent[], additions: XpEvent[]): XpEvent[] {
  if (additions.length === 0) return current;
  return [...additions, ...current].slice(0, MAX_XP_EVENTS);
}

function applyProgressEvents(
  profile: RPGProfile,
  events: DomainEvent[],
  now: number = Date.now(),
): {
  rpg: RPGProfile;
  xpEvents: XpEvent[];
} {
  let rpg = profile;
  const xpEvents: XpEvent[] = [];

  events.forEach((event, index) => {
    const eventNow = now + index;
    const before = rpg.xpTotal;
    rpg = applyProgressWithBonus(rpg, { ...event, now: eventNow });
    const delta = rpg.xpTotal - before;
    if (delta !== 0) {
      xpEvents.unshift({
        id: makeId(),
        label: progressEventLabel(event),
        delta,
        createdAt: eventNow,
      });
    }
  });

  return { rpg, xpEvents };
}

type RecoveryProgressEvent = "task_done" | "focus_completed";

function normalizeRecoveryQuest(quest: RecoveryQuest): RecoveryQuest {
  return {
    ...quest,
    requiredTasks: quest.requiredTasks ?? 1,
    completedTasks: quest.completedTasks ?? 0,
    requiredFocusSessions: quest.requiredFocusSessions ?? 1,
    completedFocusSessions: quest.completedFocusSessions ?? 0,
  };
}

function advanceRecoveryQuest(
  quest: RecoveryQuest | undefined,
  event: RecoveryProgressEvent,
  now: number,
): RecoveryQuest | undefined {
  if (!quest) return quest;
  if (quest.status !== "active") return quest;

  const normalized = normalizeRecoveryQuest(quest);
  const hasExpired = now > normalized.expiresAt;
  if (hasExpired) {
    return { ...normalized, status: "expired" };
  }

  const completedTasks =
    event === "task_done"
      ? Math.min(normalized.requiredTasks ?? 1, (normalized.completedTasks ?? 0) + 1)
      : normalized.completedTasks ?? 0;

  const completedFocusSessions =
    event === "focus_completed"
      ? Math.min(normalized.requiredFocusSessions ?? 1, (normalized.completedFocusSessions ?? 0) + 1)
      : normalized.completedFocusSessions ?? 0;

  const isDone =
    completedTasks >= (normalized.requiredTasks ?? 1) &&
    completedFocusSessions >= (normalized.requiredFocusSessions ?? 1);

  return {
    ...normalized,
    completedTasks,
    completedFocusSessions,
    status: isDone ? "done" : "active",
  };
}

function expireRecoveryQuest(quest: RecoveryQuest | undefined, now: number): RecoveryQuest | undefined {
  if (!quest) return quest;
  if (quest.status !== "active") return normalizeRecoveryQuest(quest);
  if (now <= quest.expiresAt) return normalizeRecoveryQuest(quest);
  return {
    ...normalizeRecoveryQuest(quest),
    status: "expired",
  };
}

function advanceTimerState(
  state: Pick<AppStoreState, "timer" | "rpg" | "lastFocusSession" | "recoveryQuest">,
  now: number,
): {
  timer: TimerUiState;
  rpg: RPGProfile;
  xpEvents: XpEvent[];
  recoveryQuest?: RecoveryQuest;
  lastFocusSession?: FocusSession;
  changed: boolean;
} {
  let timer = state.timer;
  let rpg = state.rpg;
  let xpEvents: XpEvent[] = [];
  let recoveryQuest = state.recoveryQuest;
  let lastFocusSession = state.lastFocusSession;
  let changed = false;

  while (timer.isRunning && timer.endsAt && now >= timer.endsAt) {
    if (timer.phase === "focus") {
      const endedAt = timer.endsAt;
      const progress = applyProgressEvents(rpg, [{ type: "focus_completed", minutes: timer.focusMinutes }], endedAt);
      rpg = progress.rpg;
      xpEvents = mergeXpEvents(xpEvents, progress.xpEvents);
      recoveryQuest = advanceRecoveryQuest(recoveryQuest, "focus_completed", endedAt);
      lastFocusSession = {
        id: makeId(),
        focusMinutes: timer.focusMinutes,
        breakMinutes: timer.breakMinutes,
        startedAt: timer.startedAt ?? endedAt - timer.focusMinutes * MS_IN_MINUTE,
        endedAt,
        status: "done",
      };

      const breakMs = timer.breakMinutes * MS_IN_MINUTE;
      if (breakMs > 0) {
        timer = {
          ...timer,
          phase: "break",
          startedAt: endedAt,
          endsAt: endedAt + breakMs,
          remainingMs: Math.max(0, endedAt + breakMs - now),
          isRunning: true,
        };
      } else {
        timer = createIdleTimer(timer.focusMinutes, timer.breakMinutes);
      }
      changed = true;
      continue;
    }

    timer = createIdleTimer(timer.focusMinutes, timer.breakMinutes);
    changed = true;
  }

  if (timer.isRunning && timer.endsAt) {
    const remainingMs = Math.max(0, timer.endsAt - now);
    if (remainingMs !== timer.remainingMs) {
      timer = { ...timer, remainingMs };
      changed = true;
    }
  } else if (!timer.isRunning && timer.phase === "idle") {
    const remainingMs = timer.focusMinutes * MS_IN_MINUTE;
    if (timer.remainingMs !== remainingMs) {
      timer = { ...timer, remainingMs };
      changed = true;
    }
  }

  return { timer, rpg, xpEvents, recoveryQuest, lastFocusSession, changed };
}

export function createAppStore() {
  const sourceId = makeId();
  let persistenceQueue: Promise<void> = Promise.resolve();
  let isApplyingRemoteSync = false;
  let syncInFlight: Promise<void> | undefined;
  let syncChannel: BroadcastChannel | undefined;
  let syncBroadcastTimer: number | undefined;

  const reportPersistenceError = (error: unknown): void => {
    console.error("Persistence write failed", error);
    appStoreRef?.setState({ uiError: PERSISTENCE_ERROR_MESSAGE });
  };

  const scheduleSyncBroadcast = (): void => {
    if (isApplyingRemoteSync) return;
    if (typeof window === "undefined") return;
    if (!syncChannel) return;
    if (syncBroadcastTimer !== undefined) return;

    syncBroadcastTimer = window.setTimeout(() => {
      syncBroadcastTimer = undefined;
      const message: SyncMessage = { type: "snapshot_saved", sourceId, at: Date.now() };
      syncChannel?.postMessage(message);
    }, 120);
  };

  const enqueuePersistence = (work: () => Promise<void>): void => {
    persistenceQueue = persistenceQueue
      .then(async () => {
        await work();
        scheduleSyncBroadcast();
      })
      .catch((error) => {
        reportPersistenceError(error);
      });
  };
  let appStoreRef: ReturnType<typeof createStore<AppStoreState>> | undefined;
  const runRemoteSync = async (): Promise<void> => {
    if (!appStoreRef || syncInFlight) return;
    isApplyingRemoteSync = true;
    syncInFlight = appStoreRef
      .getState()
      .loadInitial()
      .catch((error) => {
        console.error("Cross-tab sync failed", error);
      })
      .finally(() => {
        isApplyingRemoteSync = false;
        syncInFlight = undefined;
      });
    await syncInFlight;
  };

  const store = createStore<AppStoreState>()((set, get) => ({
    ...initialState,

    loadInitial: async () => {
      const snapshot = await loadPersistedSnapshot();
      const storedTimer = loadTimerSnapshot();
      const now = Date.now();
      const nextRecoveryQuest = expireRecoveryQuest(snapshot.recoveryQuest, now);
      set((state) => ({
        tasks: snapshot.tasks,
        goals: snapshot.goals,
        habits: snapshot.habits,
        habitLogs: snapshot.habitLogs,
        dayPlan: snapshot.dayPlan ?? state.dayPlan,
        weekPlan: snapshot.weekPlan ?? state.weekPlan,
        rpg: snapshot.rpg ?? state.rpg,
        recoveryQuest: nextRecoveryQuest,
        noise: snapshot.audioSettings ?? state.noise,
        lastFocusSession: snapshot.lastFocusSession ?? state.lastFocusSession,
        timer: storedTimer ?? state.timer,
      }));

      const persistedNoise = snapshot.audioSettings;
      if (persistedNoise) {
        noiseController.setVolume(persistedNoise.volume);
        noiseController.setType(persistedNoise.noiseType);
        if (persistedNoise.noiseType === "off") noiseController.stop();
      }

      const hydratedQuest = get().recoveryQuest;
      const enforcedQuest = expireRecoveryQuest(hydratedQuest, now);
      if (enforcedQuest?.status !== hydratedQuest?.status) {
        set({ recoveryQuest: enforcedQuest });
      }

      if (enforcedQuest?.status !== snapshot.recoveryQuest?.status) {
        enqueuePersistence(async () => {
          await saveRecoveryQuest(enforcedQuest);
        });
      }

      await get().applyMissedTasks(now);
      get().tickTimer(now);
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
      scheduleSyncBroadcast();
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
      scheduleSyncBroadcast();

      set((prev) => {
        const tasks = prev.tasks.some((task) => task.id === id)
          ? prev.tasks.map((task) => (task.id === id ? nextTask : task))
          : [nextTask, ...prev.tasks];

        const progressEvents: DomainEvent[] = [];
        if (isCompleting) {
          progressEvents.push({ type: "task_done" });
          if (prev.dayPlan.priorityTaskIds.includes(id)) {
            progressEvents.push({ type: "day_priority_done" });
          }
          if (nextTask.goalId) {
            progressEvents.push({ type: "goal_step_done" });
          }
        }
        const progress = applyProgressEvents(prev.rpg, progressEvents);
        const rpg = progress.rpg;
        const xpEvents = mergeXpEvents(prev.xpEvents, progress.xpEvents);
        const recoveryQuest = isCompleting
          ? advanceRecoveryQuest(prev.recoveryQuest, "task_done", Date.now())
          : prev.recoveryQuest;

        enqueuePersistence(async () => {
          await saveRpgProfile(rpg);
          await saveRecoveryQuest(recoveryQuest);
        });

        return { tasks, rpg, xpEvents, recoveryQuest };
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
      scheduleSyncBroadcast();
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
        const dayPlan = get().dayPlan;
        enqueuePersistence(async () => {
          await saveDayPlan(dayPlan);
        });
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
        const weekPlan = get().weekPlan;
        enqueuePersistence(async () => {
          await saveWeekPlan(weekPlan);
        });
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

      const weekPlan = get().weekPlan;
      enqueuePersistence(async () => {
        await saveGoal(goal);
        await saveWeekPlan(weekPlan);
      });

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

        const progress = applyProgressEvents(state.rpg, [{ type: "goal_step_done" }]);
        const rpg = progress.rpg;
        const xpEvents = mergeXpEvents(state.xpEvents, progress.xpEvents);
        enqueuePersistence(async () => {
          await saveGoals(goals);
          await saveRpgProfile(rpg);
        });
        return { goals, rpg, xpEvents };
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
      enqueuePersistence(async () => {
        await saveHabit(habit);
      });
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
        const progressEvents: DomainEvent[] = [];
        if (status === "done") progressEvents.push({ type: "habit_done" });
        if (status === "skipped") progressEvents.push({ type: "habit_skipped" });
        if (status === "relapse") progressEvents.push({ type: "habit_relapse" });
        const progress = applyProgressEvents(state.rpg, progressEvents);
        const rpg = progress.rpg;
        const xpEvents = mergeXpEvents(state.xpEvents, progress.xpEvents);

        let recoveryQuest = state.recoveryQuest;
        if (status === "relapse") {
          recoveryQuest = {
            id: makeId(),
            sourceEvent: "habit_relapse",
            title: "Квест восстановления: 1 фокус-сессия + 1 маленькая задача",
            xpBonusMultiplier: 1.5,
            requiredTasks: 1,
            completedTasks: 0,
            requiredFocusSessions: 1,
            completedFocusSessions: 0,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            status: "active",
          };
        }

        enqueuePersistence(async () => {
          await saveHabitLog(log);
          await saveRpgProfile(rpg);
          await saveRecoveryQuest(recoveryQuest);
        });

        return {
          habitLogs: [log, ...state.habitLogs],
          rpg,
          xpEvents,
          recoveryQuest,
        };
      });
    },

    applyMissedTasks: async (now) => {
      const checkNow = now ?? Date.now();
      const state = get();
      const isDayExpired = state.dayPlan.date < todayKey(checkNow);
      const isWeekExpired = state.weekPlan.weekStartDate < weekStartKey(checkNow);

      if (!isDayExpired && !isWeekExpired) return;

      const dayPriority = new Set(isDayExpired ? state.dayPlan.priorityTaskIds : []);
      const weekPriority = new Set(isWeekExpired ? state.weekPlan.priorityTaskIds : []);
      const nextTasks: Task[] = [];
      const missedTasks: Task[] = [];

      for (const task of state.tasks) {
        const shouldMiss =
          task.status === "todo" && (dayPriority.has(task.id) || weekPriority.has(task.id));

        if (!shouldMiss) {
          nextTasks.push(task);
          continue;
        }

        const missedTask: Task = { ...task, status: "missed" };
        nextTasks.push(missedTask);
        missedTasks.push(missedTask);
      }

      if (missedTasks.length === 0) return;

      await Promise.all(missedTasks.map((task) => saveTask(task)));

      const progressEvents: DomainEvent[] = missedTasks.map(() => ({ type: "task_missed" }));
      const progress = applyProgressEvents(state.rpg, progressEvents, checkNow);
      const rpg = progress.rpg;
      const xpEvents = mergeXpEvents(state.xpEvents, progress.xpEvents);

      set({ tasks: nextTasks, rpg, xpEvents });
      enqueuePersistence(async () => {
        await saveRpgProfile(rpg);
      });
    },

    closeDayPlan: async () => {
      const state = get();
      const dayIds = new Set(state.dayPlan.priorityTaskIds);
      const clearedDayPlan: DayPlan = {
        ...state.dayPlan,
        date: todayKey(),
        priorityTaskIds: [],
      };

      if (dayIds.size === 0) {
        set({ dayPlan: clearedDayPlan });
        enqueuePersistence(async () => {
          await saveDayPlan(clearedDayPlan);
        });
        return;
      }

      const missedTasks: Task[] = [];
      const nextTasks = state.tasks.map((task) => {
        if (!dayIds.has(task.id)) return task;
        if (task.status !== "todo") return task;
        const missedTask: Task = { ...task, status: "missed" };
        missedTasks.push(missedTask);
        return missedTask;
      });

      if (missedTasks.length === 0) {
        set({ dayPlan: clearedDayPlan });
        enqueuePersistence(async () => {
          await saveDayPlan(clearedDayPlan);
        });
        return;
      }

      await Promise.all(missedTasks.map((task) => saveTask(task)));
      const progress = applyProgressEvents(
        state.rpg,
        missedTasks.map(() => ({ type: "task_missed" as const })),
      );
      const rpg = progress.rpg;
      const xpEvents = mergeXpEvents(state.xpEvents, progress.xpEvents);

      set({
        tasks: nextTasks,
        dayPlan: clearedDayPlan,
        rpg,
        xpEvents,
      });

      enqueuePersistence(async () => {
        await saveRpgProfile(rpg);
        await saveDayPlan(clearedDayPlan);
      });
    },

    startFocusSession: (focusMinutes, breakMinutes) => {
      const now = Date.now();
      set((state) => {
        const nextFocusMinutes = clampMinutes(focusMinutes ?? state.timer.focusMinutes, state.timer.focusMinutes);
        const nextBreakMinutes = clampMinutes(breakMinutes ?? state.timer.breakMinutes, state.timer.breakMinutes);
        const remainingMs = nextFocusMinutes * MS_IN_MINUTE;
        const timer: TimerUiState = {
          focusMinutes: nextFocusMinutes,
          breakMinutes: nextBreakMinutes,
          phase: "focus",
          isRunning: true,
          startedAt: now,
          endsAt: now + remainingMs,
          remainingMs,
        };
        saveTimerSnapshot(timer);
        return { timer };
      });
    },

    toggleTimerPause: () => {
      const now = Date.now();
      set((state) => {
        if (state.timer.phase === "idle") return {};

        if (state.timer.isRunning) {
          const remainingMs = state.timer.endsAt
            ? Math.max(0, state.timer.endsAt - now)
            : state.timer.remainingMs;
          const timer: TimerUiState = {
            ...state.timer,
            isRunning: false,
            remainingMs,
            startedAt: undefined,
            endsAt: undefined,
          };
          saveTimerSnapshot(timer);
          return { timer };
        }

        const remainingMs = Math.max(0, state.timer.remainingMs);
        const timer: TimerUiState = {
          ...state.timer,
          isRunning: true,
          startedAt: now,
          endsAt: now + remainingMs,
          remainingMs,
        };
        saveTimerSnapshot(timer);
        return { timer };
      });
    },

    tickTimer: (now) => {
      const tickNow = now ?? Date.now();
      set((state) => {
        const next = advanceTimerState(state, tickNow);
        const hasRpgChange = next.rpg !== state.rpg;
        const hasXpEvents = next.xpEvents.length > 0;
        const hasSessionChange = next.lastFocusSession !== state.lastFocusSession;
        const hasRecoveryChange = next.recoveryQuest !== state.recoveryQuest;
        if (!next.changed && !hasRpgChange && !hasSessionChange && !hasXpEvents && !hasRecoveryChange) return {};
        saveTimerSnapshot(next.timer);
        enqueuePersistence(async () => {
          if (hasRpgChange) {
            await saveRpgProfile(next.rpg);
          }
          if (hasSessionChange && next.lastFocusSession) {
            await saveFocusSession(next.lastFocusSession);
          }
          if (hasRecoveryChange) {
            await saveRecoveryQuest(next.recoveryQuest);
          }
        });
        return {
          timer: next.timer,
          rpg: next.rpg,
          xpEvents: mergeXpEvents(state.xpEvents, next.xpEvents),
          recoveryQuest: next.recoveryQuest,
          lastFocusSession: next.lastFocusSession,
        };
      });
    },

    completeFocusSession: () => {
      const now = Date.now();
      set((state) => {
        if (!state.timer.isRunning) return {};

        if (state.timer.phase === "focus") {
          const progress = applyProgressEvents(state.rpg, [
            {
              type: "focus_completed",
              minutes: state.timer.focusMinutes,
            },
          ]);
          const rpg = progress.rpg;
          const xpEvents = mergeXpEvents(state.xpEvents, progress.xpEvents);
          const recoveryQuest = advanceRecoveryQuest(state.recoveryQuest, "focus_completed", now);
          const lastFocusSession: FocusSession = {
            id: makeId(),
            focusMinutes: state.timer.focusMinutes,
            breakMinutes: state.timer.breakMinutes,
            startedAt: state.timer.startedAt ?? now - state.timer.focusMinutes * MS_IN_MINUTE,
            endedAt: now,
            status: "done",
          };

          const breakMs = state.timer.breakMinutes * MS_IN_MINUTE;
          const timer =
            breakMs > 0
              ? {
                  ...state.timer,
                  phase: "break" as const,
                  isRunning: true,
                  startedAt: now,
                  endsAt: now + breakMs,
                  remainingMs: breakMs,
                }
              : createIdleTimer(state.timer.focusMinutes, state.timer.breakMinutes);
          saveTimerSnapshot(timer);
          enqueuePersistence(async () => {
            await saveRpgProfile(rpg);
            await saveFocusSession(lastFocusSession);
            await saveRecoveryQuest(recoveryQuest);
          });
          return { rpg, xpEvents, recoveryQuest, timer, lastFocusSession };
        }

        const timer = createIdleTimer(state.timer.focusMinutes, state.timer.breakMinutes);
        saveTimerSnapshot(timer);
        return { timer };
      });
    },

    cancelFocusSession: () => {
      set((state) => {
        const timer = createIdleTimer(state.timer.focusMinutes, state.timer.breakMinutes);
        saveTimerSnapshot(timer);
        return { timer };
      });
    },

    setNoiseType: (type) => {
      noiseController.setType(type);
      if (type === "off") {
        noiseController.stop();
      } else {
        noiseController.start();
      }
      set((state) => ({
        noise: {
          ...state.noise,
          noiseType: type,
        },
      }));
      const noise = get().noise;
      enqueuePersistence(async () => {
        await saveAudioSettings(noise);
      });
    },

    setNoiseVolume: (volume) => {
      noiseController.setVolume(volume);
      set((state) => ({
        noise: {
          ...state.noise,
          volume: noiseController.getState().volume,
        },
      }));
      const noise = get().noise;
      enqueuePersistence(async () => {
        await saveAudioSettings(noise);
      });
    },

    flushPersistence: async () => {
      await persistenceQueue;
    },

    clearUiError: () => set({ uiError: undefined }),
  }));

  appStoreRef = store;

  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    syncChannel = new window.BroadcastChannel(STORE_SYNC_CHANNEL);
    syncChannel.onmessage = (event: MessageEvent<unknown>) => {
      const payload = event.data;
      if (!isSyncMessage(payload)) return;
      if (payload.sourceId === sourceId) return;
      void runRemoteSync();
    };
  }

  return store;
}

export const appStore = createAppStore();

export function useAppStore<T>(selector: (state: AppStoreState) => T): T {
  return useStore(appStore, selector);
}
