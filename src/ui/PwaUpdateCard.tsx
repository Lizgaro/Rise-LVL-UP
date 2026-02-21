import { useEffect, useState } from "react";
import { applyPwaUpdate, subscribePwaStatus } from "../pwa";
import type { PwaStatus } from "../core/pwa-status";

const initialStatus: PwaStatus = {
  needRefresh: false,
  offlineReady: false,
};

export function PwaUpdateCard() {
  const [status, setStatus] = useState<PwaStatus>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  const [dismissedOfflineReady, setDismissedOfflineReady] = useState(false);

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

  return (
    <section className="card pwa-update-card" data-testid="pwa-update-card">
      <h2>PWA-статус</h2>
      {status.needRefresh ? (
        <>
          <p className="muted">Доступна новая версия приложения.</p>
          {!isOnline ? <p className="muted">Вы офлайн. Подключись к сети для обновления.</p> : null}
          <button
            data-testid="pwa-update-now-btn"
            type="button"
            disabled={isUpdating || !isOnline}
            onClick={() => {
              setIsUpdating(true);
              void applyPwaUpdate().finally(() => {
                setIsUpdating(false);
              });
            }}
          >
            {isUpdating ? "Обновляем..." : "Обновить сейчас"}
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
