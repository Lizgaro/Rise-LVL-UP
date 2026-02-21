import type { Task } from "../domain/types";

export function suggestDayPrioritiesFromWeek(
  tasks: Task[],
  weekPriorityTaskIds: string[],
  dayPriorityTaskIds: string[],
  limit: number = 3,
): string[] {
  const max = Math.max(1, Math.floor(limit));
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const selected: string[] = [];

  const tryAdd = (id: string) => {
    if (selected.length >= max) return;
    if (selected.includes(id)) return;
    const item = taskById.get(id);
    if (!item || item.status !== "todo") return;
    selected.push(id);
  };

  dayPriorityTaskIds.forEach(tryAdd);
  weekPriorityTaskIds.forEach(tryAdd);

  return selected;
}
