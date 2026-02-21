import { useMemo } from "react";
import { buildHabitStreaks, buildWeeklySummary } from "../core/analytics";
import { useAppStore } from "../store/use-app-store";

export function ProgressCard() {
  const tasks = useAppStore((state) => state.tasks);
  const goals = useAppStore((state) => state.goals);
  const habits = useAppStore((state) => state.habits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const rpg = useAppStore((state) => state.rpg);
  const xpEvents = useAppStore((state) => state.xpEvents);
  const recoveryQuest = useAppStore((state) => state.recoveryQuest);
  const dayTasks = useMemo(
    () =>
      dayPlan.priorityTaskIds
        .map((id) => tasks.find((task) => task.id === id))
        .filter((task): task is NonNullable<typeof task> => Boolean(task)),
    [dayPlan.priorityTaskIds, tasks],
  );
  const dayDone = dayTasks.filter((task) => task.status === "done").length;
  const dayMissed = dayTasks.filter((task) => task.status === "missed").length;
  const dayTotal = dayTasks.length;
  const habitStreaks = useMemo(
    () => buildHabitStreaks(habits, habitLogs),
    [habits, habitLogs],
  );
  const weeklySummary = useMemo(
    () => buildWeeklySummary(tasks, goals, habits, habitLogs, weekPlan),
    [tasks, goals, habits, habitLogs, weekPlan],
  );

  return (
    <section className="card">
      <h2>RPG-прогресс</h2>
      <div className="row compact">
        <span data-testid="stat-level">Уровень: {rpg.level}</span>
        <span>Опыт (XP): {rpg.xpTotal}</span>
      </div>
      <progress data-testid="progress-bar-xp" max={1} value={Math.min(1, rpg.xpInLevel / 400)} />
      <h3>Сегодняшний прогресс</h3>
      <p className="muted">
        Выполнено: {dayDone}/{dayTotal} {dayMissed > 0 ? `| Пропущено: ${dayMissed}` : ""}
      </p>
      <progress data-testid="progress-bar-day" max={Math.max(1, dayTotal)} value={dayDone} />

      <h3>Последние XP-события</h3>
      {xpEvents.length === 0 ? (
        <p className="muted">Пока нет XP-событий</p>
      ) : (
        <ul className="list compact">
          {xpEvents.slice(0, 5).map((event) => (
            <li key={event.id}>
              <div className="row compact">
                <span>{event.label}</span>
                <strong className={event.delta > 0 ? "xp-plus" : "xp-minus"}>
                  {event.delta > 0 ? "+" : ""}
                  {event.delta} XP
                </strong>
              </div>
            </li>
          ))}
        </ul>
      )}
      <h3>Стрики привычек</h3>
      {habitStreaks.length === 0 ? (
        <p className="muted">Добавь привычки, чтобы отслеживать стрики.</p>
      ) : (
        <ul className="list compact">
          {habitStreaks.slice(0, 5).map((habit) => (
            <li key={habit.habitId}>
              <div className="row compact">
                <span>{habit.title}</span>
                <strong>{habit.streakDays} дн.</strong>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3>Итоги недели</h3>
      <p className="muted">
        Приоритеты: {weeklySummary.prioritiesDone}/{weeklySummary.prioritiesTotal}
        {weeklySummary.prioritiesMissed > 0 ? ` | Пропущено: ${weeklySummary.prioritiesMissed}` : ""}
      </p>
      <p className="muted">
        Цели: {weeklySummary.goalsDone}/{weeklySummary.goalsTotal} | Привычки done: {weeklySummary.habitDoneLogs}
        {` | Срывы: ${weeklySummary.relapses}`}
      </p>
      {recoveryQuest ? (
        <p className="muted">
          Активен recovery-квест: <strong>{recoveryQuest.title}</strong>
        </p>
      ) : (
        <p className="muted">Recovery-квестов нет</p>
      )}
    </section>
  );
}
