import { useAppStore } from "../store/use-app-store";

export function ProgressCard() {
  const rpg = useAppStore((state) => state.rpg);
  const recoveryQuest = useAppStore((state) => state.recoveryQuest);

  return (
    <section className="card">
      <h2>RPG-прогресс</h2>
      <div className="row compact">
        <span data-testid="stat-level">Уровень: {rpg.level}</span>
        <span>Опыт (XP): {rpg.xpTotal}</span>
      </div>
      <progress data-testid="progress-bar-xp" max={1} value={Math.min(1, rpg.xpInLevel / 400)} />
      {recoveryQuest && recoveryQuest.status === "active" ? (
        <div className="recovery-status">
          <p className="muted">
            Активен recovery-квест: <strong>{recoveryQuest.title}</strong>
          </p>
          <ul className="list compact">
            <li className={recoveryQuest.focusDone ? "done" : ""}>
              {recoveryQuest.focusDone ? "✅" : "⏳"} 1 фокус-сессия
            </li>
            <li className={recoveryQuest.taskDone ? "done" : ""}>
              {recoveryQuest.taskDone ? "✅" : "⏳"} 1 любая задача
            </li>
          </ul>
        </div>
      ) : recoveryQuest && recoveryQuest.status === "done" ? (
        <p className="success">🎉 Recovery-квест выполнен! Бонус к XP получен.</p>
      ) : (
        <p className="muted">Recovery-квестов нет</p>
      )}
    </section>
  );
}
