import { useEffect, useState } from "react";
import { shouldUseFocusLayout } from "../core/focus-mode";
import { markOnboardingDone, shouldShowOnboarding } from "../core/onboarding";
import { useAppStore } from "../store/use-app-store";
import { DashboardLayout } from "./DashboardLayout";
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
import type { SidebarTab } from "./Sidebar";

type UiTheme = "core-light" | "jules-light" | "jules-ronin";
const THEME_STORAGE_KEY = "rise-lvl-up:ui-theme-v1";

function getInitialTheme(): UiTheme {
  if (typeof window === "undefined") return "core-light";
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "core-light" || saved === "jules-light" || saved === "jules-ronin") return saved;
  return "core-light";
}

export function AppShell() {
  const uiError = useAppStore((state) => state.uiError);
  const clearUiError = useAppStore((state) => state.clearUiError);
  const timerRunning = useAppStore((state) => state.timer.isRunning);
  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowOnboarding());
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [theme, setTheme] = useState<UiTheme>(() => getInitialTheme());
  const focusLayout = shouldUseFocusLayout(focusModeEnabled, timerRunning);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const renderCurrentTab = () => {
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

    if (activeTab === "dashboard") {
      return (
        <>
          {showOnboarding ? (
            <section className="card onboarding-card" data-testid="onboarding-card">
              <h2>Быстрый старт (1 минута)</h2>
              <ol className="onboarding-list">
                <li>Запиши задачу в голос или в список.</li>
                <li>Переведи ее в `Фокус дня` или `Приоритет недели/месяца`.</li>
                <li>Запусти таймер и закрой первую сессию.</li>
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
          <DayPulseCard />
          <TodayFocusCard />
          <FocusTimerCard />
          <PlansCard />
          <PriorityBoardsCard />
        </>
      );
    }

    if (activeTab === "tasks") {
      return (
        <>
          <TaskInboxCard />
          <PlansCard />
          <PriorityBoardsCard />
        </>
      );
    }

    if (activeTab === "goals") {
      return (
        <>
          <GoalsCard />
          <HabitsCard />
          <PriorityBoardsCard />
        </>
      );
    }

    if (activeTab === "review") {
      return (
        <>
          <ReviewCard />
          <ProgressCard />
          <DayPulseCard />
        </>
      );
    }

    return (
      <>
        <section className="card focus-mode-card">
          <h2>Настройки</h2>
          <label className="check">
            <input
              data-testid="focus-mode-toggle"
              type="checkbox"
              checked={focusModeEnabled}
              onChange={(e) => setFocusModeEnabled(e.target.checked)}
            />
            Включать минимальный экран во время таймера
          </label>
          <label className="check">
            Тема
            <select
              className="theme-switch"
              data-testid="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as UiTheme)}
            >
              <option value="core-light">Core Light</option>
              <option value="jules-light">Jules White</option>
              <option value="jules-ronin">Jules Ronin Dark</option>
            </select>
          </label>
          <p className="muted">
            {focusLayout
              ? "Активен минимальный режим: оставлены только ключевые блоки."
              : "Выбери тему интерфейса и режим работы таймера."}
          </p>
        </section>
        <HealthBanner />
        <NoiseCard />
      </>
    );
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} minimalMode={focusLayout}>
      {uiError ? (
        <div className="error" data-testid="ui-error-message">
          <span>{uiError}</span>
          <button type="button" onClick={clearUiError}>
            Закрыть
          </button>
        </div>
      ) : null}
      {renderCurrentTab()}
    </DashboardLayout>
  );
}
