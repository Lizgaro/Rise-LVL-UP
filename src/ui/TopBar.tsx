import { LEVEL_RULES } from "../domain/constants";
import { useAppStore } from "../store/use-app-store";

function xpNeedForLevel(level: number): number {
  return LEVEL_RULES.base + LEVEL_RULES.perLevel * (level - 1);
}

export function TopBar() {
  const rpg = useAppStore((state) => state.rpg);

  const level = Math.max(1, rpg.level);
  const currentXp = Math.max(0, Math.round(rpg.xpInLevel));
  const targetXp = xpNeedForLevel(level);
  const progressPercent = Math.min(100, Math.round((currentXp / targetXp) * 100));

  return (
    <header className="dashboard-header">
      <div className="dashboard-progress">
        <div>
          <span className="top-label">Путь меча</span>
          <p className="top-level">Уровень {level}</p>
        </div>
        <div className="progress-wrap">
          <span className="material-symbols-outlined top-icon">swords</span>
          <div className="top-progress-bar">
            <div className="top-progress-value" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="top-xp">
            {currentXp}/{targetXp} XP
          </span>
        </div>
      </div>
      <div className="top-actions">
        <button className="icon-btn" type="button" aria-label="Уведомления">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="avatar-stub" aria-hidden>
          <span className="material-symbols-outlined">person</span>
        </div>
      </div>
    </header>
  );
}
