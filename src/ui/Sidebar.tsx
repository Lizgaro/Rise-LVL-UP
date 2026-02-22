import type { Dispatch, SetStateAction } from "react";

export type SidebarTab = "dashboard" | "journal" | "tasks" | "stats" | "settings";

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: Dispatch<SetStateAction<SidebarTab>>;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="dashboard-sidebar asanoha-pattern">
      <div className="p-8 flex flex-col h-full gap-8 relative z-10">
        {/* Logo/Profile */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary-20">
            <span className="material-symbols-outlined">shield_moon</span>
          </div>
          <div>
            <h1 className="heading-font text-lg font-bold tracking-tight leading-none">RISE</h1>
            <p className="text-xs uppercase tracking-widest text-primary font-bold" style={{ fontSize: '10px', letterSpacing: '0.2em' }}>Modern Samurai</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 grow">
          <button
            onClick={() => onTabChange("dashboard")}
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            type="button"
          >
            <span className={`material-symbols-outlined ${activeTab === "dashboard" ? "fill-1" : ""}`}>dashboard</span>
            <span className="text-sm font-semibold tracking-wide">Главная</span>
          </button>

          <button
            onClick={() => onTabChange("journal")}
            className={`nav-link ${activeTab === "journal" ? "active" : ""}`}
            type="button"
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span className="text-sm font-medium">Журнал</span>
          </button>

          <button
            onClick={() => onTabChange("tasks")}
            className={`nav-link ${activeTab === "tasks" ? "active" : ""}`}
            type="button"
          >
            <span className="material-symbols-outlined">task_alt</span>
            <span className="text-sm font-medium">Задачи</span>
          </button>

          <button
            onClick={() => onTabChange("stats")}
            className={`nav-link ${activeTab === "stats" ? "active" : ""}`}
            type="button"
          >
            <span className="material-symbols-outlined">bar_chart_4_bars</span>
            <span className="text-sm font-medium">Статистика</span>
          </button>
        </nav>

        {/* Bottom Settings */}
        <div className="flex flex-col gap-2">
          <button
             onClick={() => onTabChange("settings")}
             className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
             type="button"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Настройки</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
