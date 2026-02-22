import { useMemo } from "react";
import { selectDailyFocusTarget } from "../core/focus-target";
import { useAppStore } from "../store/use-app-store";

function getTaskStatusLabel(status: "todo" | "done" | "missed"): string {
  if (status === "done") return "выполнено";
  if (status === "missed") return "пропущено";
  return "в работе";
}

export function TodayFocusCard() {
  const tasks = useAppStore((state) => state.tasks);
  const goals = useAppStore((state) => state.goals);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const timer = useAppStore((state) => state.timer);
  const startFocusSession = useAppStore((state) => state.startFocusSession);
  const toggleTaskDone = useAppStore((state) => state.toggleTaskDone);
  const incrementGoalProgress = useAppStore((state) => state.incrementGoalProgress);

  const dayTasks = useMemo(
    () =>
      dayPlan.priorityTaskIds
        .map((id) => tasks.find((task) => task.id === id))
        .filter((task): task is NonNullable<typeof task> => Boolean(task)),
    [dayPlan.priorityTaskIds, tasks],
  );

  const focusTarget = selectDailyFocusTarget(tasks, dayPlan.priorityTaskIds, goals);
  const total = dayTasks.length;
  const done = dayTasks.filter((task) => task.status === "done").length;
  const missed = dayTasks.filter((task) => task.status === "missed").length;

  return (
    <section className="card hero-card">
      <h2>Что делать сейчас</h2>
      {focusTarget?.kind === "goal" ? (
        <>
          <p>
            Цель дня: <strong>{focusTarget.item.title}</strong>
          </p>
          <p className="muted">
            Прогресс: {focusTarget.item.currentCount}/{focusTarget.item.targetCount}
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
              data-testid="hero-goal-step-btn"
              type="button"
              onClick={() => incrementGoalProgress(focusTarget.item.id)}
              disabled={focusTarget.item.status !== "active"}
            >
              + шаг по цели
            </button>
          </div>
        </>
      ) : focusTarget?.kind === "task" ? (
        <>
          <p>
            Главная задача: <strong>{focusTarget.item.title}</strong>
          </p>
          <p className="muted">
            Статус: {getTaskStatusLabel(focusTarget.item.status)} | Сегодня выполнено {done}/{total}
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
              onClick={() => void toggleTaskDone(focusTarget.item.id)}
              disabled={focusTarget.item.status !== "todo"}
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
