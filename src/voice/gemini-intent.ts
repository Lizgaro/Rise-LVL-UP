import { parseVoiceInput, type VoiceIntent } from "./intent-parser";

type GeminiIntentPayload = {
  kind?: string;
  title?: string;
  scope?: string;
  targetCount?: number;
  mode?: string;
  query?: string;
  rewrittenText?: string;
};

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export type GeminiResolvedIntent = {
  intent: VoiceIntent;
  source: "gemini" | "fallback";
  rewrittenText: string;
};

export type ResolveGeminiOptions = {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
};

function extractJson(text: string): GeminiIntentPayload | null {
  const trimmed = text.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = codeBlockMatch?.[1] ?? trimmed;

  try {
    return JSON.parse(raw) as GeminiIntentPayload;
  } catch {
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    if (!objectMatch) return null;
    try {
      return JSON.parse(objectMatch[0]) as GeminiIntentPayload;
    } catch {
      return null;
    }
  }
}

function toIntent(payload: GeminiIntentPayload): VoiceIntent | null {
  if (payload.kind === "task") {
    const scope = payload.scope === "day" || payload.scope === "week" || payload.scope === "month" ? payload.scope : "inbox";
    const title = payload.title?.trim();
    if (!title) return null;
    return {
      kind: "task",
      title,
      scope,
    };
  }

  if (payload.kind === "goal") {
    const title = payload.title?.trim();
    if (!title) return null;
    const targetCount = Number(payload.targetCount ?? 5);
    return {
      kind: "goal",
      title,
      targetCount: Number.isFinite(targetCount) ? Math.max(1, Math.min(365, Math.floor(targetCount))) : 5,
    };
  }

  if (payload.kind === "habit") {
    const title = payload.title?.trim();
    if (!title) return null;
    return {
      kind: "habit",
      title,
      mode: payload.mode === "quit" ? "quit" : "build",
    };
  }

  if (payload.kind === "complete_task") {
    const query = payload.query?.trim();
    if (!query) return null;
    return {
      kind: "complete_task",
      query,
    };
  }

  return null;
}

function fallback(rawText: string, parser: (text: string) => VoiceIntent): GeminiResolvedIntent {
  return {
    intent: parser(rawText),
    source: "fallback",
    rewrittenText: rawText,
  };
}

export async function resolveVoiceIntentWithGemini(
  rawText: string,
  fallbackParser: (text: string) => VoiceIntent = parseVoiceInput,
  options: ResolveGeminiOptions = {},
): Promise<GeminiResolvedIntent> {
  const apiKey = options.apiKey ?? import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return fallback(rawText, fallbackParser);
  }

  const model = options.model ?? "gemini-3-flash-preview";
  const fetchImpl = options.fetchImpl ?? fetch;

  const prompt = [
    "Ты классификатор голосовых команд для локального productivity app.",
    "Верни ТОЛЬКО JSON без пояснений.",
    'Формат: {"kind":"task|goal|habit|complete_task","title?":"...","scope?":"inbox|day|week|month","targetCount?":number,"mode?":"build|quit","query?":"...","rewrittenText":"..."}',
    "Если пользователь говорит про завершение задачи - используй kind=complete_task и заполни query.",
    `Вход: ${rawText}`,
  ].join("\n");

  try {
    const response = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
          },
        }),
      },
    );

    if (!response.ok) {
      return fallback(rawText, fallbackParser);
    }

    const payload = (await response.json()) as GeminiApiResponse;
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return fallback(rawText, fallbackParser);
    }

    const structured = extractJson(text);
    if (!structured) {
      return fallback(rawText, fallbackParser);
    }

    const intent = toIntent(structured);
    if (!intent) {
      return fallback(rawText, fallbackParser);
    }

    return {
      intent,
      source: "gemini",
      rewrittenText: structured.rewrittenText?.trim() || rawText,
    };
  } catch {
    return fallback(rawText, fallbackParser);
  }
}
