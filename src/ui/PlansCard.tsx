import { useMemo } from "react";
import { suggestDayPrioritiesFromWeek } from "../core/planning-suggestions";
import { useAppStore } from "../store/use-app-store";

export function PlansCard() {
  const tasks = useAppStore((state) => state.tasks);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const setDayPlan = useAppStore((state) => state.setDayPlan);

  const dayTasks = useMemo(
    () => tasks.filter((task) => dayPlan.priorityTaskIds.includes(task.id)),
    [dayPlan.priorityTaskIds, tasks],
  );
  const weekTasks = useMemo(
    () => tasks.filter((task) => weekPlan.priorityTaskIds.includes(task.id)),
    [tasks, weekPlan.priorityTaskIds],
  );

  const selectable = tasks.filter((task) => task.status !== "done");

  return (
    <section className="card" data-testid="day-plan-container">
      <h2>Фокус дня</h2>
      <p className="muted">До 3 приоритетов, чтобы не перегружать день.</p>
      <button
        data-testid="suggest-day-priorities-btn"
        type="button"
        onClick={() =>
          setDayPlan(
            suggestDayPrioritiesFromWeek(
              tasks,
              weekPlan.priorityTaskIds,
              dayPlan.priorityTaskIds,
              3,
            ),
          )
        }
      >
        Подобрать 3 из недели
      </button>
      {selectable.map((task) => {
        const checked = dayPlan.priorityTaskIds.includes(task.id);
        return (
          <label key={`day-${task.id}`} className="check">
            <input
              data-testid="day-priority-checkbox"
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...dayPlan.priorityTaskIds, task.id]
                  : dayPlan.priorityTaskIds.filter((id) => id !== task.id);
                setDayPlan(next);
              }}
            />
            {task.title}
          </label>
        );
      })}
      <ul className="list compact">
        {dayTasks.map((task) => (
          <li key={`day-item-${task.id}`}>{task.title}</li>
        ))}
      </ul>
      {weekTasks.length > 0 ? (
        <p className="muted">Недельный бэклог для подбора: {weekTasks.length}</p>
      ) : null}
    </section>
  );
}
