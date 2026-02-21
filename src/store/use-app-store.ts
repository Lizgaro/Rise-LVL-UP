import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { applyEvent } from "../core/progress-rules";
import type { RPGProfile, Task, TaskType } from "../domain/types";
import { getTaskById, getTasks, saveTask } from "../storage/repository";

export interface AppState {
  tasks: Task[];
  rpg: RPGProfile;
}

export interface AppActions {
  loadInitial: () => Promise<void>;
  addTask: (title: string, type: TaskType) => Promise<string>;
  toggleTaskDone: (id: string) => Promise<void>;
}

export type AppStoreState = AppState & AppActions;

const initialRpg: RPGProfile = {
  level: 1,
  xpTotal: 0,
  xpInLevel: 0,
  streakDays: 0,
  dailyXpEarned: 0,
  recoveryBoostActionsRemaining: 0,
};

function makeTaskId(): string {
  return crypto.randomUUID();
}

export function createAppStore() {
  return createStore<AppStoreState>()((set, get) => ({
    tasks: [],
    rpg: initialRpg,

    loadInitial: async () => {
      const tasks = await getTasks();
      set({ tasks });
    },

    addTask: async (title, type) => {
      const trimmed = title.trim();
      if (!trimmed) throw new Error("Название задачи не может быть пустым");

      const task: Task = {
        id: makeTaskId(),
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
      const existing = get().tasks.find((task) => task.id === id) ?? (await getTaskById(id));
      if (!existing) return;

      const isCompleting = existing.status !== "done";
      const nextTask: Task = {
        ...existing,
        status: isCompleting ? "done" : "todo",
        completedAt: isCompleting ? Date.now() : undefined,
      };

      await saveTask(nextTask);

      set((state) => {
        const tasks = state.tasks.some((task) => task.id === id)
          ? state.tasks.map((task) => (task.id === id ? nextTask : task))
          : [nextTask, ...state.tasks];

        const rpg = isCompleting ? applyEvent(state.rpg, { type: "task_done" }) : state.rpg;
        return { tasks, rpg };
      });
    },
  }));
}

export const appStore = createAppStore();

export function useAppStore<T>(selector: (state: AppStoreState) => T): T {
  return useStore(appStore, selector);
}
