import { registerSW } from "virtual:pwa-register";

export function registerPwaWorker(): void {
  if (typeof window === "undefined") return;

  registerSW({
    immediate: true,
  });
}
