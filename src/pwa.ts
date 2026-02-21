import { initialPwaStatus, nextPwaStatus, type PwaStatus } from "./core/pwa-status";

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;

let status: PwaStatus = initialPwaStatus;
let updateServiceWorker: UpdateServiceWorker | undefined;
const listeners = new Set<(next: PwaStatus) => void>();
let hasRegistrationStarted = false;

function emitStatus(): void {
  listeners.forEach((listener) => listener(status));
}

function applyStatus(event: Parameters<typeof nextPwaStatus>[1]): void {
  status = nextPwaStatus(status, event);
  emitStatus();
}

export function subscribePwaStatus(listener: (next: PwaStatus) => void): () => void {
  listeners.add(listener);
  listener(status);
  return () => {
    listeners.delete(listener);
  };
}

export async function applyPwaUpdate(): Promise<void> {
  if (!updateServiceWorker) return;
  await updateServiceWorker(true);
  applyStatus({ type: "reset" });
}

export function registerPwaWorker(): void {
  if (typeof window === "undefined") return;
  if (hasRegistrationStarted) return;
  hasRegistrationStarted = true;

  void import("virtual:pwa-register")
    .then(({ registerSW }) => {
      updateServiceWorker = registerSW({
        immediate: true,
        onNeedRefresh() {
          applyStatus({ type: "need_refresh" });
        },
        onOfflineReady() {
          applyStatus({ type: "offline_ready" });
        },
      });
    })
    .catch(() => undefined);
}
