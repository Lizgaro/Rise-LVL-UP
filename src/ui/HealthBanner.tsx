import { useEffect, useMemo, useState } from "react";
import { buildHealthChecks, detectRuntimeCapabilities } from "../core/health-checks";
import {
  detectStorageProtection,
  requestStorageProtection,
  type StorageProtectionStatus,
} from "../core/storage-protection";

function storageProtectionLabel(status: StorageProtectionStatus): string {
  if (status === "granted") return "Защита local data: включена";
  if (status === "not_granted") return "Защита local data: не включена";
  return "Защита local data: не поддерживается";
}

export function HealthBanner() {
  const [capabilities, setCapabilities] = useState(() =>
    detectRuntimeCapabilities(typeof window !== "undefined" ? window : undefined),
  );
  const [storageProtection, setStorageProtection] = useState<StorageProtectionStatus>(() =>
    typeof window === "undefined" ? "unsupported" : "not_granted",
  );

  const checks = useMemo(() => buildHealthChecks(capabilities), [capabilities]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateCapabilities = () => {
      setCapabilities(detectRuntimeCapabilities(window));
    };

    updateCapabilities();
    window.addEventListener("online", updateCapabilities);
    window.addEventListener("offline", updateCapabilities);
    return () => {
      window.removeEventListener("online", updateCapabilities);
      window.removeEventListener("offline", updateCapabilities);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    void detectStorageProtection(window).then((status) => {
      if (!mounted) return;
      setStorageProtection(status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const canProtect = storageProtection === "not_granted";

  return (
    <section className="card health-card">
      <h2>Готовность окружения</h2>
      <div className="health-grid">
        {checks.map((check) => (
          <article key={check.id} className={`health-pill ${check.status}`}>
            <strong>{check.title}</strong>
            <p className="muted">
              {check.id === "storage"
                ? `${check.detail}. ${storageProtectionLabel(storageProtection)}`
                : check.detail}
            </p>
            {check.id === "storage" && canProtect ? (
              <button
                data-testid="storage-protect-btn"
                type="button"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  void requestStorageProtection(window).then((status) => {
                    setStorageProtection(status);
                  });
                }}
              >
                Защитить данные
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
