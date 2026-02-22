import { describe, expect, it, vi } from "vitest";
import { resolveVoiceIntentWithGemini } from "./gemini-intent";
import type { VoiceIntent } from "./intent-parser";

describe("resolveVoiceIntentWithGemini", () => {
  it("falls back when api key is missing", async () => {
    const fallback = vi.fn((): VoiceIntent => ({
      kind: "task",
      title: "локальная задача",
      scope: "day",
    }));

    const resolved = await resolveVoiceIntentWithGemini("сегодня сделать отчет", fallback, {
      apiKey: "",
    });

    expect(fallback).toHaveBeenCalledOnce();
    expect(resolved.source).toBe("fallback");
    expect(resolved.intent.kind).toBe("task");
  });

  it("always falls back even with api key and fetch provided", async () => {
    const fallback = vi.fn((): VoiceIntent => ({
      kind: "task",
      title: "локальная задача",
      scope: "month",
    }));

    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      kind: "task",
                      title: "Собрать релизный чеклист",
                      scope: "month",
                      rewrittenText: "Собрать релизный чеклист на месяц",
                    }),
                  },
                ],
              },
            },
          ],
        }),
      ),
    );

    const resolved = await resolveVoiceIntentWithGemini("чеклист на месяц", fallback, {
      apiKey: "test-key",
      fetchImpl,
    });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(resolved.source).toBe("fallback");
    expect(resolved.intent.kind).toBe("task");
    if (resolved.intent.kind !== "task") return;
    expect(resolved.intent.scope).toBe("month");
    expect(resolved.rewrittenText).toBe("чеклист на месяц");
  });

  it("falls back on malformed gemini payload", async () => {
    const fallback = vi.fn((): VoiceIntent => ({ kind: "unknown", text: "fallback" }));
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{" }] } }] })));

    const resolved = await resolveVoiceIntentWithGemini("что-то", fallback, {
      apiKey: "test-key",
      fetchImpl,
    });

    expect(resolved.source).toBe("fallback");
    expect(resolved.intent.kind).toBe("unknown");
  });
});
