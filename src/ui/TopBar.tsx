import { useAppStore } from "../store/use-app-store";
import { LEVEL_RULES } from "../domain/constants";

function xpNeedForLevel(level: number): number {
  return LEVEL_RULES.base + LEVEL_RULES.perLevel * (level - 1);
}

export function TopBar() {
  const rpg = useAppStore((state) => state.rpg);

  const level = Math.max(1, rpg.level);
  const currentXp = rpg.xpInLevel;
  const targetXp = xpNeedForLevel(level);

  const progressPercent = Math.min(100, (currentXp / targetXp) * 100);

  return (
    <header className="dashboard-header flex items-center justify-between">
      <div className="flex items-center gap-6 grow">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-60">Путь меча</span>
          <span className="heading-font text-sm font-bold">Уровень {level}</span>
        </div>
        <div className="flex-1 max-w-md relative flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl" style={{ transform: 'rotate(-45deg)' }}>colorize</span>
          <div className="h-1.5 w-full bg-primary-10 rounded-full overflow-hidden">
            <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold tabular-nums">{Math.round(currentXp)}/{targetXp} XP</span>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-8">
        <button className="size-8 flex items-center justify-center rounded-full hover:bg-primary-10 transition-colors" type="button">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
        <div className="size-9 rounded-lg bg-paper-dark flex items-center justify-center border border-primary-10 overflow-hidden">
          <span className="material-symbols-outlined text-ink-50">person</span>
        </div>
      </div>
    </header>
  );
}
