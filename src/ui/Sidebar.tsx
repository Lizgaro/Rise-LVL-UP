export type SidebarTab = "dashboard" | "tasks" | "goals" | "review" | "settings";

type SidebarProps = {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
};

const navItems: Array<{ tab: SidebarTab; icon: string; label: string }> = [
  { tab: "dashboard", icon: "dashboard", label: "Фокус" },
  { tab: "tasks", icon: "task_alt", label: "Задачи" },
  { tab: "goals", icon: "flag", label: "Цели" },
  { tab: "review", icon: "bar_chart_4_bars", label: "Ревью" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="dashboard-sidebar asanoha-pattern">
      <div className="sidebar-inner">
        <div className="brand-row">
          <div className="brand-icon">
            <span className="material-symbols-outlined">shield_moon</span>
          </div>
          <div>
            <h1 className="heading-font brand-title">RISE</h1>
            <p className="brand-subtitle">Modern Samurai</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.tab}
              type="button"
              className={`nav-link ${activeTab === item.tab ? "active" : ""}`}
              onClick={() => onTabChange(item.tab)}
              data-testid={`sidebar-tab-${item.tab}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => onTabChange("settings")}
            data-testid="sidebar-tab-settings"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Настройки</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
