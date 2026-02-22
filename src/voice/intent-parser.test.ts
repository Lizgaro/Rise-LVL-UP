import { describe, expect, it } from "vitest";
import { parseVoiceInput } from "./intent-parser";

describe("parseVoiceInput", () => {
  it("detects goal intent", () => {
    const parsed = parseVoiceInput("цель прочитать книгу 20 страниц");
    expect(parsed.kind).toBe("goal");
    if (parsed.kind !== "goal") return;
    expect(parsed.title).toContain("прочитать книгу");
  });

  it("detects quit-habit intent", () => {
    const parsed = parseVoiceInput("привычка бросить курить");
    expect(parsed.kind).toBe("habit");
    if (parsed.kind !== "habit") return;
    expect(parsed.mode).toBe("quit");
  });

  it("detects task with day scope intent", () => {
    const parsed = parseVoiceInput("сегодня сделать 30 отжиманий");
    expect(parsed.kind).toBe("task");
    if (parsed.kind !== "task") return;
    expect(parsed.scope).toBe("day");
    expect(parsed.title).toContain("30 отжиманий");
  });

  it("detects task with month scope intent", () => {
    const parsed = parseVoiceInput("на месяц подготовить лендинг");
    expect(parsed.kind).toBe("task");
    if (parsed.kind !== "task") return;
    expect(parsed.scope).toBe("month");
  });

  it("detects completion command intent", () => {
    const parsed = parseVoiceInput("задачу подготовить отчет выполнил");
    expect(parsed.kind).toBe("complete_task");
    if (parsed.kind !== "complete_task") return;
    expect(parsed.query).toContain("подготовить отчет");
  });
});
