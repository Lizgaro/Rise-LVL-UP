import { describe, expect, it } from "vitest";
import { createNoiseController } from "./noise-engine";

describe("NoiseEngine", () => {
  it("defaults to off", () => {
    const engine = createNoiseController();
    expect(engine.getState().type).toBe("off");
    expect(engine.getState().isPlaying).toBe(false);
  });
});
