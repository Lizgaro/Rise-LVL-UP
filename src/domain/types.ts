export type TaskType = "task" | "idea";
export type TaskStatus = "todo" | "done" | "missed";
export type PlanScope = "inbox" | "day" | "week" | "month";

export type HabitMode = "build" | "quit";
export type HabitLogStatus = "done" | "skipped" | "relapse";
export type GoalScope = "day" | "week" | "month" | "custom";
export type GoalStatus = "active" | "done" | "archived";
export type FocusSessionStatus = "running" | "done" | "aborted";
export type RecoveryStatus = "active" | "done" | "expired";

export type NoiseType = "off" | "white" | "pink" | "brown";

export interface Task {
  id: string;
  title: string;
  note?: string;
  type: TaskType;
  status: TaskStatus;
  planScope: PlanScope;
  goalId?: string;
  createdAt: number;
  completedAt?: number;
}

export interface FocusSession {
  id: string;
  focusMinutes: number;
  breakMinutes: number;
  startedAt: number;
  endedAt?: number;
  status: FocusSessionStatus;
}

export interface Habit {
  id: string;
  title: string;
  mode: HabitMode;
  createdAt: number;
  active: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: HabitLogStatus;
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  note?: string;
  scope: GoalScope;
  targetCount: number;
  currentCount: number;
  status: GoalStatus;
  deadline?: string;
}

export interface DayPlan {
  date: string;
  priorityTaskIds: string[];
}

export interface WeekPlan {
  weekStartDate: string;
  priorityTaskIds: string[];
  goalIds: string[];
}

export interface MonthPlan {
  monthStartDate: string;
  priorityTaskIds: string[];
}

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

export interface RecoveryQuest {
  id: string;
  sourceEvent: string;
  title: string;
  xpBonusMultiplier: number;
  requiredTasks?: number;
  completedTasks?: number;
  requiredFocusSessions?: number;
  completedFocusSessions?: number;
  expiresAt: number;
  status: RecoveryStatus;
}

export interface AudioSettings {
  noiseType: NoiseType;
  volume: number;
  enabledPerSession: boolean;
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
