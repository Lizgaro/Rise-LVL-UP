import { parseVoiceInput, type VoiceIntent } from "./intent-parser";

export type GeminiResolvedIntent = {
  intent: VoiceIntent; 
  source: "fallback";
  rewrittenText: string;
};

export type ResolveGeminiOptions = {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
};

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
  void options;
  return fallback(rawText, fallbackParser);
}
