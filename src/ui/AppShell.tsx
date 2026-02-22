import { Header } from "./Header";
import { SidebarGoals } from "./SidebarGoals";
import { CircularTimer } from "./CircularTimer";
import { SidebarStats } from "./SidebarStats";
import { QuickCapture } from "./QuickCapture";

export function AppShell() {
  return (
    <>
      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(#c5a159 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      ></div>

      <Header />

      <main className="flex-1 flex px-8 py-6 gap-8 overflow-hidden min-h-0">
        <SidebarGoals />
        <CircularTimer />
        <SidebarStats />
      </main>

      <QuickCapture />
    </>
  );
}
