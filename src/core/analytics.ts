import type { Goal, Habit, HabitLog, Task, WeekPlan } from "../domain/types";

export interface HabitStreakItem {
  habitId: string;
  title: string;
  mode: Habit["mode"];
  streakDays: number;
}

export interface WeeklySummary {
  prioritiesDone: number;
  prioritiesMissed: number;
  prioritiesTotal: number;
  goalsDone: number;
  goalsTotal: number;
  habitDoneLogs: number;
  relapses: number;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function dateKeyDaysDiff(fromDateKey: string, toDateKeyValue: string): number {
  const fromTs = new Date(`${fromDateKey}T00:00:00.000Z`).getTime();
  const toTs = new Date(`${toDateKeyValue}T00:00:00.000Z`).getTime();
  return Math.max(0, Math.floor((toTs - fromTs) / ONE_DAY_MS));
}

function weekStartKey(now: number): string {
  const d = new Date(now);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export function buildHabitStreaks(
  habits: Habit[],
  habitLogs: HabitLog[],
  now: number = Date.now(),
): HabitStreakItem[] {
  const today = toDateKey(now);

  return habits
    .filter((habit) => habit.active)
    .map((habit) => {
      const logs = habitLogs.filter((log) => log.habitId === habit.id);

      if (habit.mode === "build") {
        const byDay = new Map<string, HabitLog["status"]>();
        for (const log of logs) {
          if (!byDay.has(log.date)) {
            byDay.set(log.date, log.status);
          }
        }

        let streakDays = 0;
        for (let i = 0; i < 365; i += 1) {
          const dayKey = toDateKey(now - i * ONE_DAY_MS);
          if (byDay.get(dayKey) === "done") {
            streakDays += 1;
          } else {
            break;
          }
        }

        return {
          habitId: habit.id,
          title: habit.title,
          mode: habit.mode,
          streakDays,
        };
      }

      const relapseDates = logs
        .filter((log) => log.status === "relapse")
        .map((log) => log.date)
        .sort((a, b) => (a < b ? 1 : -1));
      const lastRelapse = relapseDates[0];

      const streakDays = lastRelapse
        ? dateKeyDaysDiff(lastRelapse, today)
        : dateKeyDaysDiff(toDateKey(habit.createdAt), today) + 1;

      return {
        habitId: habit.id,
        title: habit.title,
        mode: habit.mode,
        streakDays,
      };
    })
    .sort((a, b) => b.streakDays - a.streakDays);
}

export function buildWeeklySummary(
  tasks: Task[],
  goals: Goal[],
  habits: Habit[],
  habitLogs: HabitLog[],
  weekPlan: WeekPlan,
  now: number = Date.now(),
): WeeklySummary {
  const today = toDateKey(now);
  const start = weekPlan.weekStartDate || weekStartKey(now);

  const priorityTasks = tasks.filter((task) => weekPlan.priorityTaskIds.includes(task.id));
  const prioritiesDone = priorityTasks.filter((task) => task.status === "done").length;
  const prioritiesMissed = priorityTasks.filter((task) => task.status === "missed").length;
  const prioritiesTotal = priorityTasks.length;

  const weekGoals = goals.filter((goal) => weekPlan.goalIds.includes(goal.id));
  const goalsDone = weekGoals.filter((goal) => goal.status === "done").length;
  const goalsTotal = weekGoals.length;

  const activeHabitIds = new Set(habits.filter((habit) => habit.active).map((habit) => habit.id));
  const weekLogs = habitLogs.filter(
    (log) => activeHabitIds.has(log.habitId) && isDateInRange(log.date, start, today),
  );
  const habitDoneLogs = weekLogs.filter((log) => log.status === "done").length;
  const relapses = weekLogs.filter((log) => log.status === "relapse").length;

  return {
    prioritiesDone,
    prioritiesMissed,
    prioritiesTotal,
    goalsDone,
    goalsTotal,
    habitDoneLogs,
    relapses,
  };
}
