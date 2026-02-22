import type { Task } from "../domain/types";

export type TaskListView = "all" | "active" | "day" | "week" | "month" | "done" | "missed";

export function filterTasksByView(tasks: Task[], view: TaskListView): Task[] {
  if (view === "all") return tasks;
  if (view === "active") return tasks.filter((task) => task.status === "todo");
  if (view === "day") return tasks.filter((task) => task.planScope === "day");
  if (view === "week") return tasks.filter((task) => task.planScope === "week");
  if (view === "month") return tasks.filter((task) => task.planScope === "month");
  if (view === "done") return tasks.filter((task) => task.status === "done");
  if (view === "missed") return tasks.filter((task) => task.status === "missed");
  return tasks;
}
