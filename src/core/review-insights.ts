import type { WeeklySummary } from "./analytics";

export function buildReviewInsights(summary: WeeklySummary): string[] {
  const hints: string[] = [];
  const doneRate =
    summary.prioritiesTotal > 0 ? summary.prioritiesDone / summary.prioritiesTotal : 0;

  if (doneRate >= 0.8) {
    hints.push("Сильный ритм недели: удерживай текущий темп.");
  } else {
    hints.push("Сузь фокус: выбери только 3 главных приоритета на завтра.");
  }

  if (summary.goalsTotal > 0 && summary.goalsDone === 0) {
    hints.push("Цели не двигаются: добавь один маленький шаг в план дня.");
  } else if (summary.goalsDone > 0) {
    hints.push("По цели есть прогресс: закрепи его повтором завтра.");
  }

  if (summary.relapses > 0) {
    hints.push("Были срывы: снизь сложность и закрой recovery-квест.");
  } else if (summary.habitDoneLogs > 0) {
    hints.push("Привычки в норме: сохрани ту же частоту отметок.");
  }

  return hints;
}
