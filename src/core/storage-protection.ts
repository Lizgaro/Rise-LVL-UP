export type StorageProtectionStatus = "granted" | "not_granted" | "unsupported";

type StorageRuntime = {
  navigator?: {
    storage?: {
      persisted?: () => Promise<boolean>;
      persist?: () => Promise<boolean>;
    };
  };
};

function getRuntime(runtime?: StorageRuntime): StorageRuntime {
  if (runtime) return runtime;
  if (typeof globalThis === "undefined") return {};
  return globalThis as unknown as StorageRuntime;
}

export async function detectStorageProtection(runtime?: StorageRuntime): Promise<StorageProtectionStatus> {
  const scope = getRuntime(runtime);
  const persisted = scope.navigator?.storage?.persisted;
  if (!persisted) return "unsupported";

  try {
    return (await persisted()) ? "granted" : "not_granted";
  } catch {
    return "not_granted";
  }
}

export async function requestStorageProtection(runtime?: StorageRuntime): Promise<StorageProtectionStatus> {
  const scope = getRuntime(runtime);
  const persisted = scope.navigator?.storage?.persisted;
  const persist = scope.navigator?.storage?.persist;
  if (!persisted || !persist) return "unsupported";

  try {
    if (await persisted()) return "granted";
    return (await persist()) ? "granted" : "not_granted";
  } catch {
    return "not_granted";
  }
}
