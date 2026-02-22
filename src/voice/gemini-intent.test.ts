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

  it("uses gemini response for month routing", async () => {
    const fallback = vi.fn((): VoiceIntent => ({
      kind: "task",
      title: "fallback",
      scope: "inbox",
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

    expect(fetchImpl).toHaveBeenCalledOnce();
    const requestUrl = String(fetchImpl.mock.calls[0]?.[0]);
    expect(requestUrl).toContain("/models/gemini-3-flash-preview:generateContent");
    expect(resolved.source).toBe("gemini");
    expect(resolved.intent.kind).toBe("task");
    if (resolved.intent.kind !== "task") return;
    expect(resolved.intent.scope).toBe("month");
    expect(resolved.rewrittenText).toContain("месяц");
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
