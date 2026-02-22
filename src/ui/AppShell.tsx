import { useState } from "react";
import { shouldUseFocusLayout } from "../core/focus-mode";
import { markOnboardingDone, shouldShowOnboarding } from "../core/onboarding";
import { FocusTimerCard } from "./FocusTimerCard";
import { DayPulseCard } from "./DayPulseCard";
import { GoalsCard } from "./GoalsCard";
import { HabitsCard } from "./HabitsCard";
import { HealthBanner } from "./HealthBanner";
import { NoiseCard } from "./NoiseCard";
import { PlansCard } from "./PlansCard";
import { PriorityBoardsCard } from "./PriorityBoardsCard";
import { ProgressCard } from "./ProgressCard";
import { PwaInstallCard } from "./PwaInstallCard";
import { PwaUpdateCard } from "./PwaUpdateCard";
import { ReviewCard } from "./ReviewCard";
import { TaskInboxCard } from "./TaskInboxCard";
import { TodayFocusCard } from "./TodayFocusCard";
import { useAppStore } from "../store/use-app-store";
import { DashboardLayout } from "./DashboardLayout";
import type { SidebarTab } from "./Sidebar";

export function AppShell() {
  const uiError = useAppStore((state) => state.uiError);
  const clearUiError = useAppStore((state) => state.clearUiError);
  const timerRunning = useAppStore((state) => state.timer.isRunning);

  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");

  const focusLayout = shouldUseFocusLayout(focusModeEnabled, timerRunning);

  const renderContent = () => {
    if (focusLayout) {
      return (
        <>
          <DayPulseCard />
          <TodayFocusCard />
          <FocusTimerCard />
          <NoiseCard />
        </>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <>
             <HealthBanner />
             <DayPulseCard />
             <TodayFocusCard />
             <FocusTimerCard />
             <PlansCard />
             <PriorityBoardsCard />
             <GoalsCard />
          </>
        );
      case "journal":
        return (
          <>
            <ReviewCard />
            <ProgressCard />
          </>
        );
      case "tasks":
        return (
          <>
            <TaskInboxCard />
            <PriorityBoardsCard />
            <HabitsCard />
          </>
        );
      case "stats":
        return (
          <>
            <DayPulseCard />
            <ProgressCard />
          </>
        );
      case "settings":
         return (
             <section className="card focus-mode-card">
                <h2>Настройки фокуса</h2>
                <label className="check">
                  <input
                    data-testid="focus-mode-toggle"
                    type="checkbox"
                    checked={focusModeEnabled}
                    onChange={(e) => setFocusModeEnabled(e.target.checked)}
                  />
                  Включать минимальный экран во время таймера
                </label>
                 <p className="muted">
                    При активном таймере и включенной опции интерфейс будет скрывать все лишнее.
                 </p>
                 <div style={{ marginTop: '20px' }}>
                    <NoiseCard />
                 </div>
             </section>
         )
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        minimalMode={focusLayout}
    >
      {showOnboarding ? (
        <section className="card onboarding-card" data-testid="onboarding-card">
          <h2>Быстрый старт (1 минута)</h2>
          <ol className="onboarding-list">
            <li>Выбери вкладку `Задачи` и добавь пару дел.</li>
            <li>На `Главной` выбери фокус дня.</li>
            <li>Запусти таймер и работай!</li>
          </ol>
          <button
            data-testid="onboarding-complete-btn"
            type="button"
            onClick={() => {
              markOnboardingDone();
              setShowOnboarding(false);
            }}
          >
            Понятно, начинаю
          </button>
        </section>
      ) : null}

      <PwaInstallCard />
      <PwaUpdateCard />

      {uiError ? (
        <div className="error">
          <span>{uiError}</span>
          <button type="button" onClick={clearUiError}>
            Закрыть
          </button>
        </div>
      ) : null}

      {renderContent()}
    </DashboardLayout>
  );
}
