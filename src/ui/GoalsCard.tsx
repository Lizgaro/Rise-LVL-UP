import { useState } from "react";
import { useAppStore } from "../store/use-app-store";
import type { Goal } from "../domain/types";

function scopeLabel(scope: Goal["scope"]): string {
  if (scope === "day") return "День";
  if (scope === "week") return "Неделя";
  if (scope === "month") return "Месяц";
  return "Своя";
}

export function GoalsCard() {
  const goals = useAppStore((state) => state.goals);
  const addGoal = useAppStore((state) => state.addGoal);
  const updateGoal = useAppStore((state) => state.updateGoal);
  const incrementGoalProgress = useAppStore((state) => state.incrementGoalProgress);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(5);
  const [scope, setScope] = useState<Goal["scope"]>("week");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingNote, setEditingNote] = useState("");
  const [editingScope, setEditingScope] = useState<Goal["scope"]>("week");

  return (
    <section className="card">
      <h2>Твои цели</h2>
      <div className="row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новая цель" />
        <input
          type="number"
          min={1}
          value={target}
          onChange={(e) => setTarget(Math.max(1, Number(e.target.value)))}
        />
        <select value={scope} onChange={(e) => setScope(e.target.value as Goal["scope"])}>
          <option value="day">День (фокус дня)</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="custom">Своя</option>
        </select>
        <button
          data-testid="goal-submit-btn"
          type="button"
          onClick={() => {
            if (!title.trim()) return;
            addGoal(title, target, scope);
            setTitle("");
          }}
        >
          Добавить цель
        </button>
      </div>

      <ul className="list">
        {goals.map((goal) => (
          <li key={goal.id}>
            <div className="row compact">
              <strong>{goal.title}</strong>
              <span>
                {goal.currentCount}/{goal.targetCount}
              </span>
              <span className="chip">{scopeLabel(goal.scope)}</span>
              <button type="button" onClick={() => incrementGoalProgress(goal.id)} aria-label="Добавить прогресс">
                + шаг
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingGoalId(goal.id);
                  setEditingTitle(goal.title);
                  setEditingNote(goal.note ?? "");
                  setEditingScope(goal.scope);
                }}
              >
                Редактировать
              </button>
            </div>
            {goal.note ? <p className="muted">{goal.note}</p> : null}
            {editingGoalId === goal.id ? (
              <div className="row">
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Название цели"
                />
                <input
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                  placeholder="Заметка"
                />
                <select value={editingScope} onChange={(e) => setEditingScope(e.target.value as Goal["scope"])}>
                  <option value="day">День</option>
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                  <option value="custom">Своя</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    updateGoal(goal.id, {
                      title: editingTitle,
                      note: editingNote,
                      scope: editingScope,
                    });
                    setEditingGoalId(null);
                  }}
                >
                  Сохранить
                </button>
                <button type="button" onClick={() => setEditingGoalId(null)}>
                  Отмена
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
