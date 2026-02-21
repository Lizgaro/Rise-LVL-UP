import type { NoiseType } from "../domain/types";

export interface NoiseState {
  type: NoiseType;
  volume: number;
  isPlaying: boolean;
}

export interface NoiseController {
  getState: () => NoiseState;
  setType: (type: NoiseType) => void;
  setVolume: (volume: number) => void;
  start: () => void;
  stop: () => void;
}

type AudioContextCtor = new () => AudioContext;

type AudioRuntime = {
  context: AudioContext;
  gainNode: GainNode;
  source?: AudioBufferSourceNode;
};

const NOISE_BUFFER_SECONDS = 2;

function getAudioContextCtor(): AudioContextCtor | undefined {
  const globalScope = globalThis as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return globalScope.AudioContext ?? globalScope.webkitAudioContext;
}

function createNoiseBuffer(context: AudioContext, type: NoiseType): AudioBuffer {
  const frameCount = Math.max(1, Math.floor(context.sampleRate * NOISE_BUFFER_SECONDS));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < frameCount; i += 1) {
      channel[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  if (type === "pink") {
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < frameCount; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      const out = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      channel[i] = out * 0.11;
    }
    return buffer;
  }

  let lastOut = 0;
  for (let i = 0; i < frameCount; i += 1) {
    const white = Math.random() * 2 - 1;
    const out = (lastOut + 0.02 * white) / 1.02;
    lastOut = out;
    channel[i] = out * 3.5;
  }
  return buffer;
}

export function createNoiseController(): NoiseController {
  let runtime: AudioRuntime | undefined;
  let state: NoiseState = {
    type: "off",
    volume: 0.4,
    isPlaying: false,
  };

  const getState = () => state;

  const ensureRuntime = (): AudioRuntime | undefined => {
    if (runtime) return runtime;

    const Ctor = getAudioContextCtor();
    if (!Ctor) return undefined;

    const context = new Ctor();
    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    runtime = { context, gainNode };
    return runtime;
  };

  const stopSource = () => {
    if (!runtime?.source) return;
    try {
      runtime.source.stop();
    } catch {
      // No-op: source may already be stopped.
    }
    runtime.source.disconnect?.();
    runtime.source = undefined;
  };

  const setType = (type: NoiseType) => {
    state = {
      ...state,
      type,
      isPlaying: type === "off" ? false : state.isPlaying,
    };

    if (type === "off") {
      stopSource();
      return;
    }

    if (state.isPlaying) {
      start();
    }
  };

  const setVolume = (volume: number) => {
    const next = Math.max(0, Math.min(1, volume));
    state = { ...state, volume: next };
    if (runtime) {
      runtime.gainNode.gain.value = next;
    }
  };

  const start = () => {
    if (state.type === "off") return;

    const audio = ensureRuntime();
    if (!audio) {
      state = { ...state, isPlaying: false };
      return;
    }

    stopSource();
    try {
      const source = audio.context.createBufferSource();
      source.buffer = createNoiseBuffer(audio.context, state.type);
      source.loop = true;
      source.connect(audio.gainNode);
      audio.gainNode.gain.value = state.volume;
      void audio.context.resume();
      source.start();
      runtime = { ...audio, source };
      state = { ...state, isPlaying: true };
    } catch {
      state = { ...state, isPlaying: false };
    }
  };

  const stop = () => {
    stopSource();
    state = { ...state, isPlaying: false };
  };

  return {
    getState,
    setType,
    setVolume,
    start,
    stop,
  };
}
