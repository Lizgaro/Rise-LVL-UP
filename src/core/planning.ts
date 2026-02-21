export function setDayPriorities(taskIds: string[]): string[] {
  if (taskIds.length > 3) {
    throw new Error("Можно выбрать максимум 3 приоритета на день");
  }
  return [...new Set(taskIds)];
}

export function setWeekPriorities(taskIds: string[]): string[] {
  if (taskIds.length > 10) {
    throw new Error("Можно выбрать максимум 10 приоритетов на неделю");
  }
  return [...new Set(taskIds)];
}
