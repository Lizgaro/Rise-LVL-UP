export type TaskType = "task" | "idea";
export type TaskStatus = "todo" | "done" | "missed";
export type PlanScope = "inbox" | "day" | "week";

export type HabitMode = "build" | "quit";
export type HabitLogStatus = "done" | "skipped" | "relapse";

export type NoiseType = "off" | "white" | "pink" | "brown";

export interface RPGProfile {
  level: number;
  xpTotal: number;
  xpInLevel: number;
  lastLevelDownAt?: number;
  streakDays: number;
}
