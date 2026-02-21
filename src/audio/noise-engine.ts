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

export function createNoiseController(): NoiseController {
  let state: NoiseState = {
    type: "off",
    volume: 0.4,
    isPlaying: false,
  };

  const getState = () => state;

  const setType = (type: NoiseType) => {
    state = {
      ...state,
      type,
      isPlaying: type === "off" ? false : state.isPlaying,
    };
  };

  const setVolume = (volume: number) => {
    const next = Math.max(0, Math.min(1, volume));
    state = { ...state, volume: next };
  };

  const start = () => {
    if (state.type === "off") return;
    state = { ...state, isPlaying: true };
  };

  const stop = () => {
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
