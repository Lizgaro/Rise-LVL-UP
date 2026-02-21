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

const MAIN_ROW_ID = "main";

export interface PersistedSnapshot {
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  habitLogs: HabitLog[];
  dayPlan?: DayPlan;
  weekPlan?: WeekPlan;
  rpg?: RPGProfile;
  recoveryQuest?: RecoveryQuest;
  audioSettings?: AudioSettings;
  lastFocusSession?: FocusSession;
}

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

export async function saveGoal(goal: Goal): Promise<void> {
  await db.goals.put(goal);
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await db.goals.bulkPut(goals);
}

export async function saveHabit(habit: Habit): Promise<void> {
  await db.habits.put(habit);
}

export async function saveHabitLog(log: HabitLog): Promise<void> {
  await db.habitLogs.put(log);
}

export async function saveDayPlan(dayPlan: DayPlan): Promise<void> {
  await db.dayPlans.put(dayPlan);
}

export async function saveWeekPlan(weekPlan: WeekPlan): Promise<void> {
  await db.weekPlans.put(weekPlan);
}

export async function saveRpgProfile(rpg: RPGProfile): Promise<void> {
  await db.rpgProfiles.put({ ...rpg, id: MAIN_ROW_ID });
}

export async function saveRecoveryQuest(recoveryQuest?: RecoveryQuest): Promise<void> {
  if (recoveryQuest) {
    await db.recoveryQuests.clear();
    await db.recoveryQuests.put(recoveryQuest);
    return;
  }
  await db.recoveryQuests.clear();
}

export async function saveAudioSettings(audioSettings: AudioSettings): Promise<void> {
  await db.audioSettings.put({ ...audioSettings, id: MAIN_ROW_ID });
}

export async function saveFocusSession(session: FocusSession): Promise<void> {
  await db.focusSessions.put(session);
}

export async function loadPersistedSnapshot(): Promise<PersistedSnapshot> {
  const [
    tasks,
    goals,
    habits,
    habitLogs,
    dayPlans,
    weekPlans,
    rpgRow,
    recoveryQuest,
    audioSettingsRow,
    focusSessions,
  ] = await Promise.all([
    getTasks(),
    db.goals.toArray(),
    db.habits.toArray(),
    db.habitLogs.toArray(),
    db.dayPlans.toArray(),
    db.weekPlans.toArray(),
    db.rpgProfiles.get(MAIN_ROW_ID),
    db.recoveryQuests.orderBy("expiresAt").reverse().first(),
    db.audioSettings.get(MAIN_ROW_ID),
    db.focusSessions.orderBy("startedAt").reverse().toArray(),
  ]);

  const dayPlan = dayPlans.sort((a, b) => b.date.localeCompare(a.date))[0];
  const weekPlan = weekPlans.sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate))[0];
  const rpg = rpgRow
    ? (({ id, ...rest }) => rest)(rpgRow)
    : undefined;
  const audioSettings = audioSettingsRow
    ? (({ id, ...rest }) => rest)(audioSettingsRow)
    : undefined;
  const lastFocusSession = focusSessions[0];

  return {
    tasks,
    goals,
    habits,
    habitLogs,
    dayPlan,
    weekPlan,
    rpg,
    recoveryQuest,
    audioSettings,
    lastFocusSession,
  };
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
