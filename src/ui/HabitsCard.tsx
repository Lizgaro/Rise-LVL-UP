import { useState } from "react";
import { useAppStore } from "../store/use-app-store";

export function HabitsCard() {
  const habits = useAppStore((state) => state.habits);
  const addHabit = useAppStore((state) => state.addHabit);
  const markHabitStatus = useAppStore((state) => state.markHabitStatus);

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"build" | "quit">("build");

  return (
    <section className="card">
      <h2>Привычки</h2>
      <div className="row">
        <input
          data-testid="habit-input-field"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая привычка"
        />
        <select value={mode} onChange={(e) => setMode(e.target.value as "build" | "quit")}>
          <option value="build">Развить</option>
          <option value="quit">Избавиться</option>
        </select>
        <button
          data-testid="habit-submit-btn"
          type="button"
          onClick={() => {
            if (!title.trim()) return;
            addHabit(title, mode);
            setTitle("");
          }}
        >
          Добавить
        </button>
      </div>

      <ul className="list">
        {habits.map((habit) => (
          <li key={habit.id}>
            <span>
              {habit.title} ({habit.mode === "build" ? "Развить" : "Избавиться"})
            </span>
            <div className="row compact">
              <button type="button" onClick={() => markHabitStatus(habit.id, "done")}>
                Сделано
              </button>
              <button type="button" onClick={() => markHabitStatus(habit.id, "skipped")}>
                Пропуск
              </button>
              <button data-testid="habit-relapse-btn" type="button" onClick={() => markHabitStatus(habit.id, "relapse")}>
                Срыв
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
