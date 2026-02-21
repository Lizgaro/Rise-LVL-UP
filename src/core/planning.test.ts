import { describe, expect, it } from "vitest";
import { setDayPriorities } from "./planning";

describe("Planning", () => {
  it("enforces max 3 day priorities", () => {
    expect(() => setDayPriorities(["1", "2", "3", "4"])).toThrow(
      "Можно выбрать максимум 3 приоритета на день",
    );
  });
});
