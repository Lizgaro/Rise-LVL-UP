import { describe, expect, it } from "vitest";
import { buildVoiceIntentPreview } from "./intent-preview";

describe("buildVoiceIntentPreview", () => {
  it("builds preview for day task", () => {
    const preview = buildVoiceIntentPreview({
      kind: "task",
      title: "прочитать 20 страниц",
      scope: "day",
    });

    expect(preview.canConfirm).toBe(true);
    expect(preview.title).toContain("прочитать 20 страниц");
    expect(preview.chips).toContain("Задача");
    expect(preview.chips).toContain("Сегодня");
  });

  it("builds preview for quit habit", () => {
    const preview = buildVoiceIntentPreview({
      kind: "habit",
      title: "без сигарет",
      mode: "quit",
    });

    expect(preview.canConfirm).toBe(true);
    expect(preview.chips).toContain("Привычка");
    expect(preview.chips).toContain("Избавиться");
  });

  it("disables confirmation for unknown intent", () => {
    const preview = buildVoiceIntentPreview({
      kind: "unknown",
      text: "???",
    });

    expect(preview.canConfirm).toBe(false);
    expect(preview.title).toContain("Не удалось");
  });
});
