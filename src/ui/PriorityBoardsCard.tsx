import { useMemo } from "react";
import { useAppStore } from "../store/use-app-store";

export function PriorityBoardsCard() {
  const tasks = useAppStore((state) => state.tasks);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const monthPlan = useAppStore((state) => state.monthPlan);
  const setWeekPlan = useAppStore((state) => state.setWeekPlan);
  const setMonthPlan = useAppStore((state) => state.setMonthPlan);

  const selectable = tasks.filter((task) => task.status !== "done");

  const weekTasks = useMemo(
    () => tasks.filter((task) => weekPlan.priorityTaskIds.includes(task.id)),
    [tasks, weekPlan.priorityTaskIds],
  );
  const monthTasks = useMemo(
    () => tasks.filter((task) => monthPlan.priorityTaskIds.includes(task.id)),
    [tasks, monthPlan.priorityTaskIds],
  );

  return (
    <section className="card">
      <h2>Твои цели и приоритеты</h2>
      <div className="grid">
        <div data-testid="week-plan-container">
          <h3>Приоритеты недели</h3>
          <p className="muted">До 10 задач</p>
          {selectable.map((task) => {
            const checked = weekPlan.priorityTaskIds.includes(task.id);
            return (
              <label key={`week-${task.id}`} className="check">
                <input
                  data-testid="week-priority-checkbox"
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

        <div data-testid="month-plan-container">
          <h3>Приоритеты месяца</h3>
          <p className="muted">До 12 задач</p>
          {selectable.map((task) => {
            const checked = monthPlan.priorityTaskIds.includes(task.id);
            return (
              <label key={`month-${task.id}`} className="check">
                <input
                  data-testid="month-priority-checkbox"
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...monthPlan.priorityTaskIds, task.id]
                      : monthPlan.priorityTaskIds.filter((id) => id !== task.id);
                    setMonthPlan(next);
                  }}
                />
                {task.title}
              </label>
            );
          })}
          <ul className="list compact">
            {monthTasks.map((task) => (
              <li key={`month-item-${task.id}`}>{task.title}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
