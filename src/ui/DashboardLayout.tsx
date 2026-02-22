import type { ReactNode } from "react";
import { Sidebar, type SidebarTab } from "./Sidebar";
import { TopBar } from "./TopBar";
import { VoiceFooter } from "./VoiceFooter";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  minimalMode?: boolean;
}

export function DashboardLayout({ children, activeTab, onTabChange, minimalMode = false }: DashboardLayoutProps) {
  if (minimalMode) {
     return (
        <main className="dashboard-container">
             <div className="dashboard-main p-8 items-center justify-center">
                <div className="max-w-3xl w-full flex flex-col gap-8">
                    {children}
                </div>
             </div>
        </main>
     )
  }

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      <div className="dashboard-main">
        <TopBar />
        <main className="dashboard-content">
          {children}
        </main>
        <VoiceFooter />
        <div className="bg-decor asanoha-pattern"></div>
      </div>
    </div>
  );
}
