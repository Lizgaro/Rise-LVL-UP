import { afterEach, describe, expect, it, vi } from "vitest";
import { createNoiseController } from "./noise-engine";

describe("NoiseEngine", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("defaults to off", () => {
    const engine = createNoiseController();
    expect(engine.getState().type).toBe("off");
    expect(engine.getState().isPlaying).toBe(false);
  });

  it("builds audio graph and plays when noise type is enabled", () => {
    const createBufferSource = vi.fn(() => ({
      loop: false,
      buffer: null as unknown,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }));
    const createGain = vi.fn(() => ({
      gain: { value: 0 },
      connect: vi.fn(),
    }));
    const createBuffer = vi.fn((_channels: number, length: number) => ({
      getChannelData: vi.fn(() => new Float32Array(length)),
    }));

    class MockAudioContext {
      sampleRate = 44100;
      destination = {};
      createGain = createGain;
      createBuffer = createBuffer;
      createBufferSource = createBufferSource;
      resume = vi.fn(async () => undefined);
    }

    vi.stubGlobal("AudioContext", MockAudioContext);

    const engine = createNoiseController();
    engine.setType("white");
    engine.start();

    expect(createBuffer).toHaveBeenCalled();
    expect(createBufferSource).toHaveBeenCalled();
    expect(engine.getState().isPlaying).toBe(true);
  });
});
