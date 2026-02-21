type MatchMediaResult = {
  matches: boolean;
};

type PwaWindow = {
  matchMedia?: (query: string) => MatchMediaResult;
};

type PwaNavigator = {
  standalone?: boolean;
};

type PwaRuntime = {
  window?: PwaWindow;
  navigator?: PwaNavigator;
};

function getRuntime(runtime?: PwaRuntime): PwaRuntime {
  if (runtime) return runtime;
  if (typeof globalThis === "undefined") return {};
  const globalScope = globalThis as unknown as {
    window?: PwaWindow;
    navigator?: PwaNavigator;
  };
  return {
    window: globalScope.window,
    navigator: globalScope.navigator,
  };
}

export function isStandaloneMode(runtime?: PwaRuntime): boolean {
  const scope = getRuntime(runtime);
  const byMediaQuery = Boolean(scope.window?.matchMedia?.("(display-mode: standalone)").matches);
  const byIosFlag = Boolean(scope.navigator?.standalone);
  return byMediaQuery || byIosFlag;
}
