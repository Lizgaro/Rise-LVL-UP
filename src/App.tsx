import { useEffect, useState } from "react";
import { appStore } from "./store/use-app-store";
import { AppShell } from "./ui/AppShell";

export default function App() {
  const [isReady, setIsReady] = useState(() => typeof window === "undefined");

  useEffect(() => {
    if (isReady) return;

    let mounted = true;
    void appStore
      .getState()
      .loadInitial()
      .catch(() => undefined)
      .finally(() => {
        if (!mounted) return;
        setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, [isReady]);

  if (!isReady) {
    return (
      <main className="page">
        <section className="card">
          <h1>Rise LVL UP</h1>
          <p className="muted">Загружаем локальные данные...</p>
        </section>
      </main>
    );
  }

  return <AppShell />;
}
