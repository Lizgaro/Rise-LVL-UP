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
import { db } from "./db";

// Tasks
export async function saveTask(task: Task): Promise<void> {
  await db.tasks.put(task);
}

export async function getTasks(): Promise<Task[]> {
  return db.tasks.orderBy("createdAt").reverse().toArray();
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  return db.tasks.get(id);
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

// Habits
export async function saveHabit(habit: Habit): Promise<void> {
  await db.habits.put(habit);
}

export async function getHabits(): Promise<Habit[]> {
  return db.habits.toArray();
}

// Habit Logs
export async function saveHabitLog(log: HabitLog): Promise<void> {
  await db.habitLogs.put(log);
}

export async function getHabitLogs(): Promise<HabitLog[]> {
  return db.habitLogs.toArray();
}

// Goals
export async function saveGoal(goal: Goal): Promise<void> {
  await db.goals.put(goal);
}

export async function getGoals(): Promise<Goal[]> {
  return db.goals.toArray();
}

// Focus Sessions
export async function saveFocusSession(session: FocusSession): Promise<void> {
  await db.focusSessions.put(session);
}

export async function getFocusSessions(): Promise<FocusSession[]> {
  return db.focusSessions.toArray();
}

// Recovery Quests
export async function saveRecoveryQuest(quest: RecoveryQuest): Promise<void> {
  await db.recoveryQuests.put(quest);
}

export async function getRecoveryQuests(): Promise<RecoveryQuest[]> {
  return db.recoveryQuests.toArray();
}

export async function deleteRecoveryQuest(id: string): Promise<void> {
  await db.recoveryQuests.delete(id);
}

// Plans
export async function saveDayPlan(plan: DayPlan): Promise<void> {
  await db.dayPlans.put(plan);
}

export async function getDayPlan(date: string): Promise<DayPlan | undefined> {
  return db.dayPlans.get(date);
}

export async function saveWeekPlan(plan: WeekPlan): Promise<void> {
  await db.weekPlans.put(plan);
}

export async function getWeekPlan(weekStartDate: string): Promise<WeekPlan | undefined> {
  return db.weekPlans.get(weekStartDate);
}

// RPG Profile
export async function saveRPGProfile(profile: RPGProfile): Promise<void> {
  await db.rpgProfiles.put({ ...profile, id: "main" });
}

export async function getRPGProfile(): Promise<RPGProfile | undefined> {
  return db.rpgProfiles.get("main");
}

// Audio Settings
export async function saveAudioSettings(settings: AudioSettings): Promise<void> {
  await db.audioSettings.put({ ...settings, id: "main" });
}

export async function getAudioSettings(): Promise<AudioSettings | undefined> {
  return db.audioSettings.get("main");
}

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.tasks.clear(),
    db.habits.clear(),
    db.habitLogs.clear(),
    db.goals.clear(),
    db.focusSessions.clear(),
    db.recoveryQuests.clear(),
    db.dayPlans.clear(),
    db.weekPlans.clear(),
    db.rpgProfiles.clear(),
    db.audioSettings.clear(),
  ]);
}
