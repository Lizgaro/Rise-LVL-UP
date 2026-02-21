import type { AppStoreState } from "../store/use-app-store";

type TimerPhase = AppStoreState["timer"]["phase"];
export type TimerShortcutAction = "start" | "togglePause" | "cancel";

export function resolveTimerShortcut(key: string, phase: TimerPhase): TimerShortcutAction | null {
  const normalized = key.toLowerCase();
  const isSpace = key === " " || normalized === "spacebar";

  if (isSpace) {
    return phase === "idle" ? "start" : "togglePause";
  }

  if (normalized === "s") {
    return phase === "idle" ? "start" : null;
  }

  if (normalized === "r") {
    return phase === "idle" ? null : "cancel";
  }

  return null;
}
