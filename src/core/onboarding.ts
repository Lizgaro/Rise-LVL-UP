const ONBOARDING_STORAGE_KEY = "rise-lvl-up:onboarding-v1";
const ONBOARDING_DONE_VALUE = "done";

type OnboardingStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function getStorage(storage?: OnboardingStorage): OnboardingStorage | undefined {
  if (storage) return storage;
  if (typeof window === "undefined") return undefined;
  return window.localStorage;
}

export function shouldShowOnboarding(storage?: OnboardingStorage): boolean {
  const scope = getStorage(storage);
  if (!scope) return true;

  try {
    return scope.getItem(ONBOARDING_STORAGE_KEY) !== ONBOARDING_DONE_VALUE;
  } catch {
    return true;
  }
}

export function markOnboardingDone(storage?: OnboardingStorage): void {
  const scope = getStorage(storage);
  if (!scope) return;

  try {
    scope.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_DONE_VALUE);
  } catch {
    // Ignore storage errors to keep UX usable.
  }
}
