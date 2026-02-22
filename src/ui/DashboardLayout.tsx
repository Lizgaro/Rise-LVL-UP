import type { ReactNode } from "react";
import { Sidebar, type SidebarTab } from "./Sidebar";
import { TopBar } from "./TopBar";
import { VoiceFooter } from "./VoiceFooter";

type DashboardLayoutProps = {
  children: ReactNode;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  minimalMode?: boolean;
};

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  minimalMode = false,
}: DashboardLayoutProps) {
  if (minimalMode) {
    return (
      <main className="dashboard-container minimal">
        <section className="dashboard-main">
          <div className="dashboard-content minimal-content">{children}</div>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <section className="dashboard-main">
        <TopBar />
        <main className="dashboard-content">{children}</main>
        <VoiceFooter />
      </section>
    </div>
  );
}
