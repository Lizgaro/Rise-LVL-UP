import { useMemo, useState } from "react";
import { useAppStore } from "../store/use-app-store";
import { VoiceQuickAdd } from "./VoiceQuickAdd";

export function TaskInboxCard() {
  const tasks = useAppStore((state) => state.tasks);
  const addTask = useAppStore((state) => state.addTask);
  const toggleTaskDone = useAppStore((state) => state.toggleTaskDone);
  const setTaskScope = useAppStore((state) => state.setTaskScope);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"task" | "idea">("task");

  const openTasks = useMemo(() => tasks.filter((task) => task.status !== "done"), [tasks]);

  return (
    <section className="card">
      <h2>Список задач и идей</h2>
      <div className="row">
        <input
          data-testid="task-input-field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Что планируешь сделать?"
        />
        <select value={type} onChange={(e) => setType(e.target.value as "task" | "idea")}>
          <option value="task">Задача</option>
          <option value="idea">Идея</option>
        </select>
        <button
          data-testid="task-submit-btn"
          type="button"
          onClick={async () => {
            if (!title.trim()) return;
            await addTask(title, type);
            setTitle("");
          }}
        >
          Добавить
        </button>
      </div>
      <VoiceQuickAdd />

      <ul className="list">
        {tasks.map((task) => (
          <li key={task.id} data-testid="task-item-active" className={task.status === "done" ? "done" : ""}>
            <span>{task.title}</span>
            <div className="row compact">
              <button data-testid="task-complete-check" type="button" onClick={() => void toggleTaskDone(task.id)}>
                {task.status === "done" ? "Вернуть" : "Готово"}
              </button>
              <button type="button" onClick={() => void setTaskScope(task.id, "day")}>
                В день
              </button>
              <button type="button" onClick={() => void setTaskScope(task.id, "week")}>
                В неделю
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="muted">Активных: {openTasks.length}</p>
    </section>
  );
}
