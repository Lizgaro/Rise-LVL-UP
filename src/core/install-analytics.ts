export type InstallAnalytics = {
  promptShown: number;
  accepted: number;
  dismissed: number;
};

export type InstallAnalyticsStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

type InstallOutcome = "accepted" | "dismissed";

const STORAGE_KEY = "rise-lvl-up:install-analytics-v1";

function defaultAnalytics(): InstallAnalytics {
  return {
    promptShown: 0,
    accepted: 0,
    dismissed: 0,
  };
}

function getStorage(storage?: InstallAnalyticsStorage): InstallAnalyticsStorage | undefined {
  if (storage) return storage;
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

function saveInstallAnalytics(
  data: InstallAnalytics,
  storage?: InstallAnalyticsStorage,
): InstallAnalytics {
  const scope = getStorage(storage);
  if (!scope) return data;
  try {
    scope.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore write failures for local analytics.
  }
  return data;
}

export function loadInstallAnalytics(storage?: InstallAnalyticsStorage): InstallAnalytics {
  const scope = getStorage(storage);
  if (!scope) return defaultAnalytics();

  try {
    const raw = scope.getItem(STORAGE_KEY);
    if (!raw) return defaultAnalytics();
    const parsed = JSON.parse(raw) as Partial<InstallAnalytics>;
    return {
      promptShown: Number(parsed.promptShown) || 0,
      accepted: Number(parsed.accepted) || 0,
      dismissed: Number(parsed.dismissed) || 0,
    };
  } catch {
    return defaultAnalytics();
  }
}

export function recordInstallPromptShown(storage?: InstallAnalyticsStorage): InstallAnalytics {
  const current = loadInstallAnalytics(storage);
  return saveInstallAnalytics(
    {
      ...current,
      promptShown: current.promptShown + 1,
    },
    storage,
  );
}

export function recordInstallOutcome(
  outcome: InstallOutcome,
  storage?: InstallAnalyticsStorage,
): InstallAnalytics {
  const current = loadInstallAnalytics(storage);
  if (outcome === "accepted") {
    return saveInstallAnalytics(
      {
        ...current,
        accepted: current.accepted + 1,
      },
      storage,
    );
  }

  return saveInstallAnalytics(
    {
      ...current,
      dismissed: current.dismissed + 1,
    },
    storage,
  );
}
