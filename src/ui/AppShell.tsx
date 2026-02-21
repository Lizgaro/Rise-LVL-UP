import { useState } from "react";
import { shouldUseFocusLayout } from "../core/focus-mode";
import { FocusTimerCard } from "./FocusTimerCard";
import { DayPulseCard } from "./DayPulseCard";
import { GoalsCard } from "./GoalsCard";
import { HabitsCard } from "./HabitsCard";
import { HealthBanner } from "./HealthBanner";
import { NoiseCard } from "./NoiseCard";
import { PlansCard } from "./PlansCard";
import { ProgressCard } from "./ProgressCard";
import { ReviewCard } from "./ReviewCard";
import { TaskInboxCard } from "./TaskInboxCard";
import { TodayFocusCard } from "./TodayFocusCard";
import { useAppStore } from "../store/use-app-store";

export function AppShell() {
  const uiError = useAppStore((state) => state.uiError);
  const clearUiError = useAppStore((state) => state.clearUiError);
  const timerRunning = useAppStore((state) => state.timer.isRunning);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const focusLayout = shouldUseFocusLayout(focusModeEnabled, timerRunning);

  return (
    <main className="page">
      <header className="header">
        <h1>Rise LVL UP</h1>
        <p className="muted">Минималистичный личный трекер продуктивности</p>
      </header>

      {uiError ? (
        <div className="error">
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
        <p className="muted">
          {focusLayout
            ? "Активен минимальный режим: оставлены только ключевые блоки."
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
          <HealthBanner />
          <DayPulseCard />
          <TodayFocusCard />
          <FocusTimerCard />
          <TaskInboxCard />
          <PlansCard />
          <ReviewCard />
          <GoalsCard />
          <HabitsCard />
          <ProgressCard />
          <NoiseCard />
        </>
      )}
    </main>
  );
}
