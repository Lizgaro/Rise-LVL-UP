import Dexie, { type EntityTable } from "dexie";
import type {
  AudioSettings,
  DayPlan,
  FocusSession,
  Goal,
  Habit,
  HabitLog,
  RecoveryQuest,
  RPGProfile,
  Task,
  WeekPlan,
} from "../domain/types";

export class RiseDb extends Dexie {
  tasks!: EntityTable<Task, "id">;
  habits!: EntityTable<Habit, "id">;
  habitLogs!: EntityTable<HabitLog, "id">;
  goals!: EntityTable<Goal, "id">;
  focusSessions!: EntityTable<FocusSession, "id">;
  recoveryQuests!: EntityTable<RecoveryQuest, "id">;
  dayPlans!: EntityTable<DayPlan, "date">;
  weekPlans!: EntityTable<WeekPlan, "weekStartDate">;
  rpgProfiles!: EntityTable<RPGProfile & { id: "main" }, "id">;
  audioSettings!: EntityTable<AudioSettings & { id: "main" }, "id">;

  constructor() {
    super("rise-lvl-up-db");
    this.version(1).stores({
      tasks: "id, status, planScope, createdAt",
      habits: "id, active, mode, createdAt",
      habitLogs: "id, habitId, date, status",
      goals: "id, status, scope",
      focusSessions: "id, status, startedAt",
      recoveryQuests: "id, status, expiresAt",
      dayPlans: "date",
      weekPlans: "weekStartDate",
      rpgProfiles: "id, level",
      audioSettings: "id, noiseType",
    });
  }
}

export const db = new RiseDb();
