import { useEffect, useState } from "react";
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

type WorkspaceView = "focus" | "plan" | "review" | "all";
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
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("focus");
  const [theme, setTheme] = useState<UiTheme>(() => getInitialTheme());
  const focusLayout = shouldUseFocusLayout(focusModeEnabled, timerRunning);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <main className="page">
      <header className="header">
        <h1>Rise LVL UP</h1>
        <p className="muted">Минималистичный личный трекер продуктивности</p>
      </header>

      {showOnboarding ? (
        <section className="card onboarding-card" data-testid="onboarding-card">
          <h2>Быстрый старт (1 минута)</h2>
          <ol className="onboarding-list">
            <li>Выбери рабочий экран: `Фокус`, `Планирование` или `Ревью`.</li>
            <li>Добавь 1-3 задачи и отметь приоритет дня.</li>
            <li>Запусти таймер и закрой первую фокус-сессию.</li>
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
        <div className="error" data-testid="ui-error-message">
          <span>{uiError}</span>
          <button type="button" onClick={clearUiError}>
            Закрыть
          </button>
        </div>
      ) : null}

      <section className="card focus-mode-card">
        <h2>Режим фокуса</h2>
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
          Рабочий экран
          <select
            data-testid="workspace-view-select"
            value={workspaceView}
            onChange={(e) => setWorkspaceView(e.target.value as WorkspaceView)}
          >
            <option value="focus">Фокус</option>
            <option value="plan">Планирование</option>
            <option value="review">Ревью</option>
            <option value="all">Все</option>
          </select>
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
            : workspaceView === "focus"
              ? "Экран фокуса: только ключевые блоки выполнения."
              : workspaceView === "plan"
                ? "Экран планирования: входящие, планы, цели и привычки."
                : workspaceView === "review"
                  ? "Экран ревью: итоги и корректировка курса."
                  : "Полный режим интерфейса."}
        </p>
      </section>

      {focusLayout ? (
        <>
          <DayPulseCard />
          <TodayFocusCard />
          <FocusTimerCard />
          <NoiseCard />
        </>
      ) : (
        <>
          {workspaceView === "focus" ? (
            <>
              <DayPulseCard />
              <TodayFocusCard />
              <FocusTimerCard />
              <TaskInboxCard />
              <NoiseCard />
            </>
          ) : null}

          {workspaceView === "plan" ? (
            <>
              <HealthBanner />
              <TaskInboxCard />
              <PlansCard />
              <PriorityBoardsCard />
              <GoalsCard />
              <HabitsCard />
            </>
          ) : null}

          {workspaceView === "review" ? (
            <>
              <DayPulseCard />
              <ReviewCard />
              <ProgressCard />
            </>
          ) : null}

          {workspaceView === "all" ? (
            <>
              <HealthBanner />
              <DayPulseCard />
              <TodayFocusCard />
              <FocusTimerCard />
              <TaskInboxCard />
              <PlansCard />
              <PriorityBoardsCard />
              <ReviewCard />
              <GoalsCard />
              <HabitsCard />
              <ProgressCard />
              <NoiseCard />
            </>
          ) : null}
        </>
      )}
    </main>
  );
}
