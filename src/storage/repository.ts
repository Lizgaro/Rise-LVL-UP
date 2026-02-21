import type { Task } from "../domain/types";
import { db } from "./db";

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
