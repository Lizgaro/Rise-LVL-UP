import { useMemo, useState } from "react";
import { filterTasksByView, type TaskListView } from "../core/task-filters";
import { useAppStore } from "../store/use-app-store";

export function TaskInboxCard() {
  const tasks = useAppStore((state) => state.tasks);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const toggleTaskDone = useAppStore((state) => state.toggleTaskDone);
  const setTaskScope = useAppStore((state) => state.setTaskScope);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<"task" | "idea">("task");
  const [view, setView] = useState<TaskListView>("active");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingNote, setEditingNote] = useState("");

  const openTasks = useMemo(() => tasks.filter((task) => task.status !== "done"), [tasks]);
  const filteredTasks = useMemo(() => filterTasksByView(tasks, view), [tasks, view]);

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
      <div className="row">
        <label>
          Фильтр списка
          <select
            data-testid="task-view-filter"
            value={view}
            onChange={(e) => setView(e.target.value as TaskListView)}
          >
            <option value="active">Только активные</option>
            <option value="all">Все</option>
            <option value="day">Приоритет дня</option>
            <option value="week">Приоритет недели</option>
            <option value="month">Приоритет месяца</option>
            <option value="done">Выполненные</option>
            <option value="missed">Пропущенные</option>
          </select>
        </label>
        <span className="muted">Показано: {filteredTasks.length}</span>
      </div>

      <ul className="list">
        {filteredTasks.map((task) => (
          <li key={task.id} data-testid="task-item-active" className={task.status === "done" ? "done" : ""}>
            <span>{task.title}</span>
            {task.note ? <p className="muted">{task.note}</p> : null}
            <div className="row compact">
              <button
                data-testid="task-complete-check"
                type="button"
                onClick={() => void toggleTaskDone(task.id)}
                aria-label={task.status === "done" ? "Отметить как невыполненное" : "Отметить как выполненное"}
              >
                {task.status === "done" ? "Вернуть" : "Готово"}
              </button>
              <button
                type="button"
                onClick={() => void setTaskScope(task.id, "day")}
                aria-label="Запланировать на сегодня"
              >
                В день
              </button>
              <button
                type="button"
                onClick={() => void setTaskScope(task.id, "week")}
                aria-label="Запланировать на неделю"
              >
                В неделю
              </button>
              <button
                type="button"
                onClick={() => void setTaskScope(task.id, "month")}
                aria-label="Запланировать на месяц"
              >
                В месяц
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingTaskId(task.id);
                  setEditingTitle(task.title);
                  setEditingNote(task.note ?? "");
                }}
              >
                Редактировать
              </button>
            </div>
            {editingTaskId === task.id ? (
              <div className="row">
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Название задачи"
                />
                <input
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  placeholder="Заметка"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await updateTask(task.id, { title: editingTitle, note: editingNote });
                    setEditingTaskId(null);
                  }}
                >
                  Сохранить
                </button>
                <button type="button" onClick={() => setEditingTaskId(null)}>
                  Отмена
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {filteredTasks.length === 0 ? <p className="muted">По этому фильтру задач пока нет.</p> : null}

      <p className="muted">Активных: {openTasks.length}</p>
    </section>
  );
}
