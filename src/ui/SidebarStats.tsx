import { useAppStore } from "../store/use-app-store";

export function SidebarStats() {
  const rpg = useAppStore((state) => state.rpg);
  // In a real app, we would query the session history from Dexie/IndexedDB here.
  // For now, we mock the weekly stats for the UI demo.
  const weeklySessions = 3;
  const monthFlowHours = 128;

  return (
    <aside className="w-72 flex flex-col gap-6 shrink-0">
      <div className="flex flex-col gap-6">
        {/* Week Section */}
        <div>
          <h3 className="font-display font-bold text-slate-100 mb-4 px-2">Неделя</h3>
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-surface-dark ronin-border rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
              <span className="text-sm font-medium text-slate-300">
                {weeklySessions} сессии завершено
              </span>
            </div>
            <div className="p-3 bg-surface-dark ronin-border rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg">military_tech</span>
              <span className="text-sm font-medium text-slate-300">
                Стрик: {rpg.streakDays} дней
              </span>
            </div>
          </div>
        </div>

        {/* Month Section */}
        <div>
          <h3 className="font-display font-bold text-slate-100 mb-4 px-2">Месяц</h3>
          <div className="relative bg-surface-dark ronin-border rounded-lg p-4 overflow-hidden aspect-video">
            <div className="absolute top-0 right-0 p-3">
              <span className="material-symbols-outlined text-primary/40">trending_up</span>
            </div>
            <div className="h-full flex flex-col justify-end">
              <p className="text-2xl font-display font-bold text-slate-100">{monthFlowHours}</p>
              <p className="text-xs text-slate-500 font-medium">Часов в потоке</p>

              {/* Graph bars - static mock for visual design */}
              <div className="mt-4 flex gap-1 h-8 items-end">
                <div className="w-full bg-primary/20 h-[30%] rounded-sm"></div>
                <div className="w-full bg-primary/40 h-[50%] rounded-sm"></div>
                <div className="w-full bg-primary/30 h-[40%] rounded-sm"></div>
                <div className="w-full bg-primary/60 h-[70%] rounded-sm"></div>
                <div className="w-full bg-primary/20 h-[25%] rounded-sm"></div>
                <div className="w-full bg-primary h-[100%] rounded-sm"></div>
                <div className="w-full bg-primary/40 h-[45%] rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
