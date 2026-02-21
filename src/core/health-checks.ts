export type HealthCheckId = "microphone" | "audio" | "storage";
export type HealthCheckStatus = "ready" | "warn";

export interface RuntimeCapabilities {
  microphoneReady: boolean;
  audioReady: boolean;
  indexedDbReady: boolean;
}

export interface HealthCheckItem {
  id: HealthCheckId;
  title: string;
  status: HealthCheckStatus;
  detail: string;
}

type RuntimeScope = {
  SpeechRecognition?: unknown;
  webkitSpeechRecognition?: unknown;
  AudioContext?: unknown;
  webkitAudioContext?: unknown;
  indexedDB?: unknown;
  navigator?: {
    mediaDevices?: unknown;
  };
};

export function detectRuntimeCapabilities(scope?: RuntimeScope): RuntimeCapabilities {
  const runtime =
    scope ??
    (typeof globalThis !== "undefined"
      ? (globalThis as unknown as RuntimeScope)
      : undefined);

  const hasSpeechApi = Boolean(runtime?.SpeechRecognition || runtime?.webkitSpeechRecognition);
  const hasMediaDevices = Boolean(runtime?.navigator?.mediaDevices);
  const hasAudioApi = Boolean(runtime?.AudioContext || runtime?.webkitAudioContext);
  const hasIndexedDb = Boolean(runtime?.indexedDB);

  return {
    microphoneReady: hasSpeechApi || hasMediaDevices,
    audioReady: hasAudioApi,
    indexedDbReady: hasIndexedDb,
  };
}

export function buildHealthChecks(capabilities: RuntimeCapabilities): HealthCheckItem[] {
  return [
    {
      id: "microphone",
      title: "Микрофон",
      status: capabilities.microphoneReady ? "ready" : "warn",
      detail: capabilities.microphoneReady
        ? "Голосовой ввод доступен"
        : "Микрофон или Speech API недоступен",
    },
    {
      id: "audio",
      title: "Аудио",
      status: capabilities.audioReady ? "ready" : "warn",
      detail: capabilities.audioReady ? "Web Audio доступен" : "Web Audio недоступен",
    },
    {
      id: "storage",
      title: "Хранилище",
      status: capabilities.indexedDbReady ? "ready" : "warn",
      detail: capabilities.indexedDbReady ? "IndexedDB доступна" : "IndexedDB недоступна",
    },
  ];
}
