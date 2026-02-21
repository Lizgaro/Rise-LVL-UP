import { useEffect, useState } from "react";
import { useAppStore } from "../store/use-app-store";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function FocusTimerCard() {
  const timer = useAppStore((state) => state.timer);
  const startFocusSession = useAppStore((state) => state.startFocusSession);
  const toggleTimerPause = useAppStore((state) => state.toggleTimerPause);
  const tickTimer = useAppStore((state) => state.tickTimer);
  const completeFocusSession = useAppStore((state) => state.completeFocusSession);
  const cancelFocusSession = useAppStore((state) => state.cancelFocusSession);

  const [focusMinutes, setFocusMinutes] = useState(timer.focusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(timer.breakMinutes);

  useEffect(() => {
    if (!timer.isRunning) {
      setFocusMinutes(timer.focusMinutes);
      setBreakMinutes(timer.breakMinutes);
    }
  }, [timer.breakMinutes, timer.focusMinutes, timer.isRunning]);

  useEffect(() => {
    if (!timer.isRunning) return;
    const id = window.setInterval(() => {
      tickTimer();
    }, 1000);
    return () => window.clearInterval(id);
  }, [timer.isRunning, tickTimer]);

  const phaseTitle =
    timer.phase === "focus" ? "Фокус" : timer.phase === "break" ? "Перерыв" : "Готов к старту";

  return (
    <section className="card">
      <h2>Фокус-таймер</h2>
      <div className="row compact">
        <strong data-testid="timer-phase">{phaseTitle}</strong>
        <span data-testid="timer-remaining">{formatRemaining(timer.remainingMs)}</span>
      </div>
      <div className="row">
        <label>
          Фокус, мин
          <input
            data-testid="focus-minutes-input"
            type="number"
            min={1}
            value={focusMinutes}
            onChange={(e) => setFocusMinutes(Number(e.target.value))}
          />
        </label>
        <label>
          Перерыв, мин
          <input
            data-testid="break-minutes-input"
            type="number"
            min={1}
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="row">
        <button
          data-testid="start-focus-btn"
          type="button"
          onClick={() => startFocusSession(focusMinutes, breakMinutes)}
          disabled={timer.isRunning}
        >
          Старт
        </button>
        <button
          data-testid="complete-focus-btn"
          type="button"
          onClick={completeFocusSession}
          disabled={!timer.isRunning}
        >
          {timer.phase === "break" ? "Пропустить перерыв" : "Завершить фокус"}
        </button>
        <button
          data-testid="pause-focus-btn"
          type="button"
          onClick={toggleTimerPause}
          disabled={timer.phase === "idle"}
        >
          {timer.isRunning ? "Пауза" : timer.phase === "idle" ? "Пауза" : "Продолжить"}
        </button>
        <button type="button" onClick={cancelFocusSession} disabled={!timer.isRunning}>
          Отмена
        </button>
      </div>
      <p className="muted">
        {timer.isRunning
          ? "Сессия идет..."
          : timer.phase === "idle"
            ? "Сессия не запущена"
            : "Сессия на паузе"}
      </p>
    </section>
  );
}
