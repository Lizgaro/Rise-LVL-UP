import { useEffect, useState } from "react";
import { buildPwaUpdateCopy } from "../core/pwa-update-copy";
import { applyPwaUpdate, subscribePwaStatus } from "../pwa";
import type { PwaStatus } from "../core/pwa-status";
import { useAppStore } from "../store/use-app-store";

const initialStatus: PwaStatus = {
  needRefresh: false,
  offlineReady: false,
};

export function PwaUpdateCard() {
  const [status, setStatus] = useState<PwaStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [dismissedOfflineReady, setDismissedOfflineReady] = useState(false);
  const timerRunning = useAppStore((state) => state.timer.isRunning);

  useEffect(() => {
    return subscribePwaStatus((next) => {
      setStatus(next);
      if (next.needRefresh) {
        setDismissedOfflineReady(false);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const showOfflineReady = status.offlineReady && !status.needRefresh && !dismissedOfflineReady;
  if (!status.needRefresh && !showOfflineReady) return null;

  const copy = buildPwaUpdateCopy({
    needRefresh: status.needRefresh,
    isOnline,
    timerRunning,
    isUpdating,
  });

  return (
    <section className="card pwa-update-card" data-testid="pwa-update-card">
      <h2>{copy.title}</h2>
      {status.needRefresh ? (
        <>
          <p className="muted">{copy.body}</p>
          {copy.hint ? <p className="muted">{copy.hint}</p> : null}
          <button
            data-testid="pwa-update-now-btn"
            type="button"
            disabled={copy.buttonDisabled}
            onClick={() => {
              setIsUpdating(true);
              void applyPwaUpdate().finally(() => {
                setIsUpdating(false);
              });
            }}
          >
            {copy.buttonLabel}
          </button>
        </>
      ) : (
        <>
          <p className="muted">Офлайн-режим готов. Приложение доступно без сети.</p>
          <button
            data-testid="pwa-offline-close-btn"
            type="button"
            onClick={() => setDismissedOfflineReady(true)}
          >
            Понятно
          </button>
        </>
      )}
    </section>
  );
}
