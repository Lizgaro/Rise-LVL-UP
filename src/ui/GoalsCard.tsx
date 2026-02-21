import { useState } from "react";
import { useAppStore } from "../store/use-app-store";

export function GoalsCard() {
  const goals = useAppStore((state) => state.goals);
  const addGoal = useAppStore((state) => state.addGoal);
  const incrementGoalProgress = useAppStore((state) => state.incrementGoalProgress);

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(5);

  return (
    <section className="card">
      <h2>Цели</h2>
      <div className="row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Новая цель" />
        <input
          type="number"
          min={1}
          value={target}
          onChange={(e) => setTarget(Math.max(1, Number(e.target.value)))}
        />
        <button
          data-testid="goal-submit-btn"
          type="button"
          onClick={() => {
            if (!title.trim()) return;
            addGoal(title, target);
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
              <button type="button" onClick={() => incrementGoalProgress(goal.id)} aria-label="Добавить прогресс">
                + шаг
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
