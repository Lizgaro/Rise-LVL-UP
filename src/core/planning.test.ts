import { describe, expect, it } from "vitest";
import { setDayPriorities, setMonthPriorities, setWeekPriorities } from "./planning";

describe("Planning", () => {
  it("enforces max 3 day priorities", () => {
    expect(() => setDayPriorities(["1", "2", "3", "4"])).toThrow(
      "Можно выбрать максимум 3 приоритета на день",
    );
  });

  it("enforces max 10 week priorities", () => {
    expect(() =>
      setWeekPriorities(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]),
    ).toThrow("Можно выбрать максимум 10 приоритетов на неделю");
  });

  it("enforces max 12 month priorities", () => {
    expect(() =>
      setMonthPriorities(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"]),
    ).toThrow("Можно выбрать максимум 12 приоритетов на месяц");
  });
});
