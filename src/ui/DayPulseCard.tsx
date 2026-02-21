import { useMemo } from "react";
import type { RecoveryQuest } from "../domain/types";
import { useAppStore } from "../store/use-app-store";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function timerStatusLabel(phase: "idle" | "focus" | "break"): string {
  if (phase === "focus") return "Фокус";
  if (phase === "break") return "Перерыв";
  return "Ожидание";
}

function recoveryLabel(recoveryQuest?: RecoveryQuest): string {
  if (!recoveryQuest) return "Нет активного квеста";
  if (recoveryQuest.status === "done") return "Квест восстановления завершен";
  if (recoveryQuest.status === "expired") return "Квест восстановления истек";
  return `${recoveryQuest.completedFocusSessions ?? 0}/${recoveryQuest.requiredFocusSessions ?? 1} фокус • ${
    recoveryQuest.completedTasks ?? 0
  }/${recoveryQuest.requiredTasks ?? 1} задачи`;
}

export function DayPulseCard() {
  const tasks = useAppStore((state) => state.tasks);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const timer = useAppStore((state) => state.timer);
  const rpg = useAppStore((state) => state.rpg);
  const recoveryQuest = useAppStore((state) => state.recoveryQuest);

  const dayTasks = useMemo(
    () =>
      dayPlan.priorityTaskIds
        .map((id) => tasks.find((task) => task.id === id))
        .filter((task): task is NonNullable<typeof task> => Boolean(task)),
    [dayPlan.priorityTaskIds, tasks],
  );

  const doneCount = dayTasks.filter((task) => task.status === "done").length;
  const missedCount = dayTasks.filter((task) => task.status === "missed").length;
  const totalCount = dayTasks.length;
  const todoCount = Math.max(0, totalCount - doneCount - missedCount);
  const doneRate = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
  const timerHint = timer.isRunning
    ? `${timerStatusLabel(timer.phase)} • ${formatRemaining(timer.remainingMs)}`
    : `${timer.focusMinutes}/${timer.breakMinutes} мин`;

  return (
    <section className="card pulse-card">
      <h2>Пульс дня</h2>
      <div className="pulse-grid">
        <article className="pulse-item">
          <p className="muted">Приоритеты</p>
          <strong>
            {doneCount}/{totalCount}
          </strong>
          <p className="muted">
            Осталось: {todoCount}
            {missedCount > 0 ? ` | Пропущено: ${missedCount}` : ""}
          </p>
        </article>

        <article className="pulse-item">
          <p className="muted">Фокус</p>
          <strong>{timerHint}</strong>
          <p className="muted">{timer.isRunning ? "Сессия запущена" : "Готов к старту"}</p>
        </article>

        <article className="pulse-item">
          <p className="muted">RPG</p>
          <strong>LVL {rpg.level}</strong>
          <p className="muted">
            XP сегодня: {rpg.dailyXpEarned ?? 0} | Стрик: {rpg.streakDays} дн.
          </p>
        </article>

        <article className="pulse-item">
          <p className="muted">Восстановление</p>
          <strong>{recoveryQuest?.status === "active" ? "Активно" : "Спокойно"}</strong>
          <p className="muted">{recoveryLabel(recoveryQuest)}</p>
        </article>
      </div>

      <progress
        data-testid="progress-bar-pulse"
        max={Math.max(1, totalCount)}
        value={doneCount}
      />
      <p className="muted">Темп дня: {doneRate}%</p>
    </section>
  );
}
