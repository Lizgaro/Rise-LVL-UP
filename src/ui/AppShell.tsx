import { FocusTimerCard } from "./FocusTimerCard";
import { DayPulseCard } from "./DayPulseCard";
import { GoalsCard } from "./GoalsCard";
import { HabitsCard } from "./HabitsCard";
import { NoiseCard } from "./NoiseCard";
import { PlansCard } from "./PlansCard";
import { ProgressCard } from "./ProgressCard";
import { TaskInboxCard } from "./TaskInboxCard";
import { TodayFocusCard } from "./TodayFocusCard";
import { useAppStore } from "../store/use-app-store";

export function AppShell() {
  const uiError = useAppStore((state) => state.uiError);
  const clearUiError = useAppStore((state) => state.clearUiError);

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

      <DayPulseCard />
      <TodayFocusCard />
      <FocusTimerCard />
      <TaskInboxCard />
      <PlansCard />
      <GoalsCard />
      <HabitsCard />
      <ProgressCard />
      <NoiseCard />
    </main>
  );
}
