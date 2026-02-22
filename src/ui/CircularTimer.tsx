import { useMemo } from "react";
import { useAppStore } from "../store/use-app-store";

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function CircularTimer() {
  const timer = useAppStore((state) => state.timer);
  const startFocusSession = useAppStore((state) => state.startFocusSession);
  const toggleTimerPause = useAppStore((state) => state.toggleTimerPause);
  const cancelFocusSession = useAppStore((state) => state.cancelFocusSession);
  const completeFocusSession = useAppStore((state) => state.completeFocusSession);

  const totalMs = useMemo(() => {
    if (timer.phase === "break") return timer.breakMinutes * 60 * 1000;
    return timer.focusMinutes * 60 * 1000;
  }, [timer.phase, timer.focusMinutes, timer.breakMinutes]);

  const progress = useMemo(() => {
    if (timer.phase === "idle") return 100;
    const p = (timer.remainingMs / totalMs) * 100;
    return Math.max(0, Math.min(100, p));
  }, [timer.phase, timer.remainingMs, totalMs]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Invert progress for the stroke-dashoffset to animate "emptying" or "filling"
  // Design shows it filling or emptying. Usually for a timer it empties.
  // Design: stroke-dashoffset="70" with dasharray="282.7". 70/282.7 ~= 0.25 (25% hidden? or shown?)
  // Usually offset = circumference * (1 - progress/100).
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isIdle = timer.phase === "idle";
  const isRunning = timer.isRunning;

  const handleMainAction = () => {
    if (isIdle) {
      startFocusSession();
    } else {
      toggleTimerPause();
    }
  };

  const handleStopAction = () => {
    if (isIdle) return;
    // If running, we might want to stop/cancel.
    // Design has a "Stop" button (square).
    // Logic: if running, cancel? Or complete?
    // Usually "Stop" means cancel/reset in this context.
    cancelFocusSession();
  };

  // Design has Play/Pause and Stop.
  // Play button: material-symbols: play_arrow
  // Stop button: material-symbols: stop

  return (
    <section className="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
      {/* Decorative Glow Background */}
      <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
        <div className={`w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000 ${timer.phase === 'break' ? 'bg-blue-500/10' : 'bg-primary/5'}`}></div>
      </div>

      {/* Timer Container */}
      <div className="relative flex items-center justify-center w-[400px] h-[400px]">
        {/* Progress Ring */}
        <svg className="w-full h-full progress-ring timer-glow" viewBox="0 0 100 100">
          <circle
            className="text-white/5"
            cx="50" cy="50"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
          ></circle>
          <circle
            className={`transition-all duration-1000 ease-linear ${timer.phase === 'break' ? 'text-blue-400' : 'text-primary'}`}
            cx="50" cy="50"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="2"
          ></circle>
        </svg>

        {/* Timer Text & Controls */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h3 className="text-[10px] font-bold tracking-[0.4em] text-primary/60 uppercase mb-2">
            {timer.phase === 'break' ? 'Перерыв' : 'Таймер фокуса'}
          </h3>
          <div className="font-display text-8xl font-light tracking-tighter text-slate-100 tabular-nums">
            {formatTime(timer.remainingMs)}
          </div>

          <div className="flex gap-6 mt-8 relative z-20">
            <button
              onClick={handleMainAction}
              className="size-14 rounded-full bg-surface-dark ronin-border flex items-center justify-center text-slate-100 hover:bg-primary hover:text-background-dark transition-all"
            >
              <span className="material-symbols-outlined text-2xl">
                {isRunning ? "pause" : "play_arrow"}
              </span>
            </button>

            {!isIdle && (
              <button
                onClick={handleStopAction}
                className="size-14 rounded-full bg-surface-dark ronin-border flex items-center justify-center text-slate-100 hover:bg-crimson/20 hover:text-crimson transition-all"
              >
                <span className="material-symbols-outlined text-2xl">stop</span>
              </button>
            )}

            {!isIdle && timer.phase === 'focus' && (
               <button
               onClick={completeFocusSession}
               className="size-14 rounded-full bg-surface-dark ronin-border flex items-center justify-center text-slate-100 hover:bg-green-500/20 hover:text-green-500 transition-all"
               title="Завершить досрочно"
             >
               <span className="material-symbols-outlined text-2xl">check</span>
             </button>
            )}
             {!isIdle && timer.phase === 'break' && (
               <button
               onClick={completeFocusSession} // In break, complete means skip/finish break
               className="size-14 rounded-full bg-surface-dark ronin-border flex items-center justify-center text-slate-100 hover:bg-green-500/20 hover:text-green-500 transition-all"
               title="Пропустить перерыв"
             >
               <span className="material-symbols-outlined text-2xl">skip_next</span>
             </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
