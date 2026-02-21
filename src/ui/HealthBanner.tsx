import { useMemo } from "react";
import { buildHealthChecks, detectRuntimeCapabilities } from "../core/health-checks";

export function HealthBanner() {
  const checks = useMemo(
    () => buildHealthChecks(detectRuntimeCapabilities(typeof window !== "undefined" ? window : undefined)),
    [],
  );

  return (
    <section className="card health-card">
      <h2>Готовность окружения</h2>
      <div className="health-grid">
        {checks.map((check) => (
          <article key={check.id} className={`health-pill ${check.status}`}>
            <strong>{check.title}</strong>
            <p className="muted">{check.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
