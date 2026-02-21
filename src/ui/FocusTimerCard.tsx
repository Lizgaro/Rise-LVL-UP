import { useState } from "react";
import { useAppStore } from "../store/use-app-store";

export function FocusTimerCard() {
  const timer = useAppStore((state) => state.timer);
  const startFocusSession = useAppStore((state) => state.startFocusSession);
  const completeFocusSession = useAppStore((state) => state.completeFocusSession);
  const cancelFocusSession = useAppStore((state) => state.cancelFocusSession);

  const [focusMinutes, setFocusMinutes] = useState(timer.focusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(timer.breakMinutes);

  return (
    <section className="card">
      <h2>Фокус-таймер</h2>
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
          Завершить
        </button>
        <button type="button" onClick={cancelFocusSession} disabled={!timer.isRunning}>
          Отмена
        </button>
      </div>
      <p className="muted">{timer.isRunning ? "Сессия идет..." : "Сессия не запущена"}</p>
    </section>
  );
}
