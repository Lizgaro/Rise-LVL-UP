import { useMemo } from "react";
import { useAppStore } from "../store/use-app-store";

function getTaskStatusLabel(status: "todo" | "done" | "missed"): string {
  if (status === "done") return "выполнено";
  if (status === "missed") return "пропущено";
  return "в работе";
}

export function TodayFocusCard() {
  const tasks = useAppStore((state) => state.tasks);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const timer = useAppStore((state) => state.timer);
  const startFocusSession = useAppStore((state) => state.startFocusSession);
  const toggleTaskDone = useAppStore((state) => state.toggleTaskDone);

  const dayTasks = useMemo(
    () =>
      dayPlan.priorityTaskIds
        .map((id) => tasks.find((task) => task.id === id))
        .filter((task): task is NonNullable<typeof task> => Boolean(task)),
    [dayPlan.priorityTaskIds, tasks],
  );

  const nextTask = dayTasks.find((task) => task.status === "todo");
  const total = dayTasks.length;
  const done = dayTasks.filter((task) => task.status === "done").length;
  const missed = dayTasks.filter((task) => task.status === "missed").length;

  return (
    <section className="card hero-card">
      <h2>Что делать сейчас</h2>
      {nextTask ? (
        <>
          <p>
            Главная задача: <strong>{nextTask.title}</strong>
          </p>
          <p className="muted">
            Статус: {getTaskStatusLabel(nextTask.status)} | Сегодня выполнено {done}/{total}
          </p>
          <div className="row">
            <button
              data-testid="hero-start-focus-btn"
              type="button"
              onClick={() => startFocusSession(timer.focusMinutes, timer.breakMinutes)}
              disabled={timer.isRunning}
            >
              Старт фокуса
            </button>
            <button
              data-testid="hero-complete-task-btn"
              type="button"
              onClick={() => void toggleTaskDone(nextTask.id)}
              disabled={nextTask.status !== "todo"}
            >
              Задача выполнена
            </button>
          </div>
        </>
      ) : (
        <p className="muted">
          {total === 0
            ? "Добавь приоритеты в разделе \"Планы\", чтобы появился главный фокус дня."
            : `На сегодня нет активных приоритетов. Выполнено: ${done}/${total}, пропущено: ${missed}.`}
        </p>
      )}
    </section>
  );
}
