import { useMemo } from "react";
import { useAppStore } from "../store/use-app-store";

export function Header() {
  const tasks = useAppStore((state) => state.tasks);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const startFocusSession = useAppStore((state) => state.startFocusSession);
  const toggleTaskDone = useAppStore((state) => state.toggleTaskDone);

  const focusTask = useMemo(() => {
    const id = dayPlan.priorityTaskIds[0];
    if (!id) return undefined;
    return tasks.find((t) => t.id === id);
  }, [dayPlan.priorityTaskIds, tasks]);

  return (
    <header className="w-full pt-8 px-8 flex justify-center z-10 shrink-0">
      <div className="max-w-4xl w-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center text-background-dark">
              <span className="material-symbols-outlined font-bold">swords</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight text-slate-100">
                Rise LVL UP
              </h1>
              <p className="text-primary/70 text-xs font-medium tracking-widest uppercase">
                Путь воина
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-dark ronin-border hover:bg-white/5 transition-all text-slate-100">
              <span className="material-symbols-outlined text-primary text-sm">settings</span>
              <span className="text-sm font-medium">Настройки</span>
            </button>
            <button
              className="bg-primary text-background-dark px-6 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all"
              onClick={() => startFocusSession()}
            >
              Начать сессию
            </button>
          </div>
        </div>

        {/* Focus Card */}
        <div className="bg-surface-dark ronin-border p-6 rounded-xl flex items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>

          <div className="flex items-center gap-6 relative z-10">
            <button
              className={`size-8 rounded-lg border-2 ${focusTask?.status === 'done' ? 'bg-primary border-primary' : 'border-primary/40'} flex items-center justify-center text-primary hover:border-primary transition-all group/check`}
              onClick={() => focusTask && toggleTaskDone(focusTask.id)}
              disabled={!focusTask}
            >
              <span className={`material-symbols-outlined ${focusTask?.status === 'done' ? 'text-background-dark opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all`}>check</span>
            </button>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-primary/60 uppercase mb-1">
                Фокус дня
              </p>
              <h2 className="font-display text-xl font-semibold text-slate-100">
                {focusTask ? focusTask.title : "Нет фокуса на сегодня"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {focusTask && (
              <>
                <button className="p-2 rounded-lg hover:bg-crimson/10 text-slate-400 hover:text-crimson transition-all">
                  <span className="material-symbols-outlined">edit_square</span>
                </button>
                <button
                  className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-background-dark transition-all"
                  onClick={() => toggleTaskDone(focusTask.id)}
                >
                  {focusTask.status === 'done' ? 'Вернуть' : 'Готово'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
