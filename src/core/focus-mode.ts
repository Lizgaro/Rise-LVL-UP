export function shouldUseFocusLayout(focusModeEnabled: boolean, timerRunning: boolean): boolean {
  return focusModeEnabled && timerRunning;
}
