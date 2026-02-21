import { useMemo, useState } from "react";
import { buildWeeklySummary } from "../core/analytics";
import { buildReviewInsights } from "../core/review-insights";
import { useAppStore } from "../store/use-app-store";

const MAX_WEEK_PRIORITIES = 10;

export function ReviewCard() {
  const tasks = useAppStore((state) => state.tasks);
  const goals = useAppStore((state) => state.goals);
  const habits = useAppStore((state) => state.habits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const setDayPlan = useAppStore((state) => state.setDayPlan);
  const setWeekPlan = useAppStore((state) => state.setWeekPlan);
  const setTaskScope = useAppStore((state) => state.setTaskScope);
  const closeDayPlan = useAppStore((state) => state.closeDayPlan);

  const [notes, setNotes] = useState({
    reviewedDay: false,
    plannedTomorrow: false,
    minimizedDistractions: false,
  });
  const [statusMessage, setStatusMessage] = useState("");

  const dayPriorityTasks = useMemo(
    () =>
      dayPlan.priorityTaskIds
        .map((id) => tasks.find((task) => task.id === id))
        .filter((task): task is NonNullable<typeof task> => Boolean(task)),
    [dayPlan.priorityTaskIds, tasks],
  );
  const dayTodoIds = dayPriorityTasks.filter((task) => task.status === "todo").map((task) => task.id);
  const dayDone = dayPriorityTasks.filter((task) => task.status === "done").length;
  const dayMissed = dayPriorityTasks.filter((task) => task.status === "missed").length;
  const weeklySummary = useMemo(
    () => buildWeeklySummary(tasks, goals, habits, habitLogs, weekPlan),
    [tasks, goals, habits, habitLogs, weekPlan],
  );
  const weeklyInsights = useMemo(() => buildReviewInsights(weeklySummary), [weeklySummary]);
  const checklistDone = Object.values(notes).filter(Boolean).length;

  const moveTodoToWeek = async () => {
    if (dayTodoIds.length === 0) {
      setStatusMessage("Нечего переносить: активных дневных приоритетов нет.");
      return;
    }

    const nextWeek = [...weekPlan.priorityTaskIds];
    dayTodoIds.forEach((taskId) => {
      if (nextWeek.length >= MAX_WEEK_PRIORITIES) return;
      if (!nextWeek.includes(taskId)) nextWeek.push(taskId);
    });

    await Promise.all(dayTodoIds.map((taskId) => setTaskScope(taskId, "week")));
    setWeekPlan(nextWeek);
    setDayPlan(dayPlan.priorityTaskIds.filter((taskId) => !dayTodoIds.includes(taskId)));
    setStatusMessage("Незавершенные задачи перенесены в недельный план.");
  };

  return (
    <section className="card review-card">
      <h2>Ревью дня и недели</h2>
      <h3>Чеклист конца дня</h3>
      <p className="muted">
        Приоритеты дня: {dayDone}/{dayPriorityTasks.length}
        {dayMissed > 0 ? ` | Пропущено: ${dayMissed}` : ""}
      </p>
      <label className="check">
        <input
          type="checkbox"
          checked={notes.reviewedDay}
          onChange={(e) => setNotes((current) => ({ ...current, reviewedDay: e.target.checked }))}
        />
        Разобрал прогресс дня
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={notes.plannedTomorrow}
          onChange={(e) => setNotes((current) => ({ ...current, plannedTomorrow: e.target.checked }))}
        />
        Подготовил 3 приоритета на завтра
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={notes.minimizedDistractions}
          onChange={(e) => setNotes((current) => ({ ...current, minimizedDistractions: e.target.checked }))}
        />
        Убрал отвлекающие факторы
      </label>
      <p className="muted">Чеклист: {checklistDone}/3</p>

      <div className="row">
        <button
          data-testid="review-move-day-to-week-btn"
          type="button"
          onClick={() => void moveTodoToWeek()}
          disabled={dayTodoIds.length === 0}
        >
          Перенести остаток в неделю
        </button>
        <button
          data-testid="review-close-day-btn"
          type="button"
          onClick={() => void closeDayPlan()}
          disabled={dayPriorityTasks.length === 0}
        >
          Закрыть день
        </button>
      </div>

      {statusMessage ? <p className="muted">{statusMessage}</p> : null}

      <h3>Итоги недели</h3>
      <p className="muted">
        Приоритеты: {weeklySummary.prioritiesDone}/{weeklySummary.prioritiesTotal}
        {weeklySummary.prioritiesMissed > 0 ? ` | Пропущено: ${weeklySummary.prioritiesMissed}` : ""}
      </p>
      <p className="muted">
        Цели: {weeklySummary.goalsDone}/{weeklySummary.goalsTotal} | Привычки done: {weeklySummary.habitDoneLogs}
        {` | Срывы: ${weeklySummary.relapses}`}
      </p>
      <ul className="list compact">
        {weeklyInsights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </section>
  );
}
