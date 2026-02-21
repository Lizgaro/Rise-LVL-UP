import { useMemo } from "react";
import { useAppStore } from "../store/use-app-store";

export function ProgressCard() {
  const tasks = useAppStore((state) => state.tasks);
  const dayPlan = useAppStore((state) => state.dayPlan);
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
