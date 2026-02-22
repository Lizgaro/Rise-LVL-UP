import { useAppStore } from "../store/use-app-store";

export function SidebarGoals() {
  const goals = useAppStore((state) => state.goals);
  const addGoal = useAppStore((state) => state.addGoal);
  const incrementGoalProgress = useAppStore((state) => state.incrementGoalProgress);

  const handleAddGoal = () => {
    const title = window.prompt("Название цели:");
    if (!title) return;
    const target = window.prompt("Целевое количество шагов:", "10");
    if (!target) return;
    addGoal(title, Number(target) || 10);
  };

  return (
    <aside className="w-72 flex flex-col gap-6 shrink-0">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-display font-bold text-slate-100">Ваши цели</h3>
        <button
          onClick={handleAddGoal}
          className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-primary transition-all bg-transparent border-none p-0"
        >
          add
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-200px)]">
        {goals.length === 0 && (
          <p className="text-slate-500 text-sm px-2">Нет активных целей</p>
        )}

        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));

          return (
            <div key={goal.id} className="p-4 bg-surface-dark ronin-border rounded-lg group hover:border-primary/30 transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-slate-300 truncate pr-2" title={goal.title}>
                  {goal.title}
                </span>
                <span className="text-xs font-bold text-primary shrink-0">{percent}%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 mt-2 flex justify-between">
                <span>{goal.currentCount} / {goal.targetCount}</span>
                <button
                   className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-white"
                   onClick={() => incrementGoalProgress(goal.id)}
                >
                  +1
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
