import { useMemo } from "react";
import { useAppStore } from "../store/use-app-store";

export function PlansCard() {
  const tasks = useAppStore((state) => state.tasks);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const setDayPlan = useAppStore((state) => state.setDayPlan);
  const setWeekPlan = useAppStore((state) => state.setWeekPlan);

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
    <section className="card">
      <h2>Планы</h2>
      <div className="grid">
        <div>
          <h3>Сегодня</h3>
          <p className="muted">До 3 приоритетов</p>
          {selectable.map((task) => {
            const checked = dayPlan.priorityTaskIds.includes(task.id);
            return (
              <label key={`day-${task.id}`} className="check">
                <input
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
        </div>

        <div>
          <h3>Неделя</h3>
          <p className="muted">До 10 приоритетов</p>
          {selectable.map((task) => {
            const checked = weekPlan.priorityTaskIds.includes(task.id);
            return (
              <label key={`week-${task.id}`} className="check">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...weekPlan.priorityTaskIds, task.id]
                      : weekPlan.priorityTaskIds.filter((id) => id !== task.id);
                    setWeekPlan(next);
                  }}
                />
                {task.title}
              </label>
            );
          })}
          <ul className="list compact">
            {weekTasks.map((task) => (
              <li key={`week-item-${task.id}`}>{task.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
