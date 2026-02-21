import { describe, expect, it } from "vitest";
import {
  getDateKeyAtOffset,
  getLocalDateKey,
  getLocalWeekStartKey,
  getWeekStartKeyAtOffset,
} from "./date-keys";

describe("date keys", () => {
  it("applies timezone offset when building date key", () => {
    const now = Date.parse("2026-01-01T00:30:00.000Z");
    expect(getDateKeyAtOffset(now, 180)).toBe("2025-12-31");
    expect(getDateKeyAtOffset(now, -180)).toBe("2026-01-01");
  });

  it("computes local monday for week start using offset", () => {
    const mondayUtc = Date.parse("2026-01-05T00:30:00.000Z");
    expect(getWeekStartKeyAtOffset(mondayUtc, 0)).toBe("2026-01-05");
    expect(getWeekStartKeyAtOffset(mondayUtc, 120)).toBe("2025-12-29");
  });

  it("returns local keys in y-m-d format", () => {
    const now = Date.parse("2026-03-10T10:45:00.000Z");
    expect(getLocalDateKey(now)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(getLocalWeekStartKey(now)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
