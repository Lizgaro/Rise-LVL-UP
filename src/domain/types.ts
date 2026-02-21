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
  dailyXpDate?: string;
  dailyXpEarned?: number;
  recoveryBoostActionsRemaining?: number;
}

export type DomainEvent =
  | { type: "task_done"; now?: number }
  | { type: "day_priority_done"; now?: number }
  | { type: "goal_step_done"; now?: number }
  | { type: "focus_completed"; minutes: number; now?: number }
  | { type: "habit_done"; now?: number }
  | { type: "habit_skipped"; now?: number }
  | { type: "habit_relapse"; now?: number }
  | { type: "task_missed"; now?: number };
