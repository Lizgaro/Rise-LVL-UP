export type PwaStatus = {
  needRefresh: boolean;
  offlineReady: boolean;
};

export type PwaStatusEvent = {
  type: "need_refresh" | "offline_ready" | "reset";
};

export const initialPwaStatus: PwaStatus = {
  needRefresh: false,
  offlineReady: false,
};

export function nextPwaStatus(current: PwaStatus, event: PwaStatusEvent): PwaStatus {
  if (event.type === "need_refresh") {
    return {
      ...current,
      needRefresh: true,
    };
  }

  if (event.type === "offline_ready") {
    return {
      ...current,
      offlineReady: true,
    };
  }

  return initialPwaStatus;
}
