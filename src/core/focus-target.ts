import type { Goal, Task } from "../domain/types";

export type DailyFocusTarget =
  | { kind: "goal"; item: Goal }
  | { kind: "task"; item: Task };

export function selectDailyFocusTarget(
  tasks: Task[],
  dayPriorityTaskIds: string[],
  goals: Goal[],
): DailyFocusTarget | null {
  const dayGoal = goals.find((goal) => goal.scope === "day" && goal.status === "active");
  if (dayGoal) {
    return { kind: "goal", item: dayGoal };
  }

  const dayTasks = dayPriorityTaskIds
    .map((id) => tasks.find((task) => task.id === id))
    .filter((task): task is Task => Boolean(task));
  const nextTask = dayTasks.find((task) => task.status === "todo");
  if (nextTask) {
    return { kind: "task", item: nextTask };
  }

  return null;
}
