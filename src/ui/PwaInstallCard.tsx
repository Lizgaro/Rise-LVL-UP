import { useEffect, useState } from "react";
import {
  loadInstallAnalytics,
  recordInstallOutcome,
  recordInstallPromptShown,
  type InstallAnalytics,
} from "../core/install-analytics";
import { isStandaloneMode } from "../core/pwa-install";

type InstallOutcome = "accepted" | "dismissed";

type InstallChoice = {
  outcome: InstallOutcome;
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

export function PwaInstallCard() {
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneMode());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | undefined>();
  const [wasDismissed, setWasDismissed] = useState(false);
  const [analytics, setAnalytics] = useState<InstallAnalytics>(() => loadInstallAnalytics());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setWasDismissed(false);
      setAnalytics(recordInstallPromptShown());
    };

    const onAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(undefined);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (isStandalone) return null;

  return (
    <section className="card pwa-card" data-testid="pwa-install-card">
      <h2>Установить как приложение</h2>
      <p className="muted">PWA-режим быстрее открывается и удобнее на мобильном экране.</p>
      {deferredPrompt ? (
        <div className="row">
          <button
            data-testid="pwa-install-btn"
            type="button"
            onClick={() => {
              void (async () => {
                await deferredPrompt.prompt();
                const choice = await deferredPrompt.userChoice;
                if (choice.outcome === "accepted") {
                  setAnalytics(recordInstallOutcome("accepted"));
                  setIsStandalone(true);
                  setDeferredPrompt(undefined);
                  return;
                }
                setAnalytics(recordInstallOutcome("dismissed"));
                setWasDismissed(true);
              })();
            }}
          >
            Установить приложение
          </button>
          {wasDismissed ? <span className="muted">Можно установить позже</span> : null}
        </div>
      ) : (
        <p className="muted">Если кнопки нет, открой меню браузера и выбери «Установить приложение».</p>
      )}
      <p className="muted">
        Показов: {analytics.promptShown} | Установок: {analytics.accepted} | Отложено: {analytics.dismissed}
      </p>
    </section>
  );
}
