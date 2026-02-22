import type { HabitMode, PlanScope } from "../domain/types";

export type VoiceIntent =
  | {
      kind: "task";
      title: string;
      scope: Extract<PlanScope, "inbox" | "day" | "week" | "month">;
    }
  | {
      kind: "goal";
      title: string;
      targetCount: number;
    }
  | {
      kind: "habit";
      title: string;
      mode: HabitMode;
    }
  | {
      kind: "complete_task";
      query: string;
    }
  | {
      kind: "unknown";
      text: string;
    };

function normalize(text: string): string {
  return text.toLowerCase().replace(/[.,!?;:]+/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeTitle(text: string): string {
  const removals = [
    "цель",
    "привычка",
    "сегодня",
    "на сегодня",
    "неделя",
    "на неделю",
    "на этой неделе",
    "месяц",
    "на месяц",
    "в этом месяце",
    "каждый день",
    "ежедневно",
    "сделать",
    "добавь",
    "добавить",
  ];

  const cleaned = removals
    .reduce((acc, token) => acc.replaceAll(token, " "), text.toLowerCase())
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || text.trim().toLowerCase();
}

function detectTaskScope(normalized: string): Extract<PlanScope, "inbox" | "day" | "week" | "month"> {
  if (normalized.includes("сегодня") || normalized.includes("на сегодня")) return "day";
  if (
    normalized.includes("на месяц") ||
    normalized.includes("в этом месяце") ||
    normalized.includes("месяц")
  ) {
    return "month";
  }
  if (normalized.includes("неделя") || normalized.includes("на неделю") || normalized.includes("на этой неделе"))
    return "week";
  return "inbox";
}

function parseGoalTargetCount(normalized: string): number {
  const numberMatch = normalized.match(/\b(\d{1,4})\b/);
  if (!numberMatch) return 5;
  const value = Number(numberMatch[1]);
  if (!Number.isFinite(value)) return 5;
  return Math.max(1, Math.min(365, Math.floor(value)));
}

function isGoalIntent(normalized: string): boolean {
  return normalized.includes("цель") || normalized.includes("хочу") || normalized.includes("достичь");
}

function isHabitIntent(normalized: string): boolean {
  return (
    normalized.includes("привычка") ||
    normalized.includes("каждый день") ||
    normalized.includes("ежедневно") ||
    normalized.includes("бросить") ||
    normalized.includes("без")
  );
}

function detectHabitMode(normalized: string): HabitMode {
  if (normalized.includes("бросить") || normalized.includes("без ") || normalized.includes(" не ")) return "quit";
  return "build";
}

function isTaskCompletionIntent(normalized: string): boolean {
  return (
    normalized.includes("выполнил") ||
    normalized.includes("выполнена") ||
    normalized.includes("сделал") ||
    normalized.includes("закрыл задачу") ||
    normalized.includes("готово")
  );
}

function extractCompletionQuery(original: string): string {
  const cleaned = original
    .toLowerCase()
    .replace(/задач[ауы]?/g, " ")
    .replace(/выполнил[ао]?/g, " ")
    .replace(/сделал[ао]?/g, " ")
    .replace(/закрыл[ао]?/g, " ")
    .replace(/готово/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || original.trim().toLowerCase();
}

export function parseVoiceInput(rawText: string): VoiceIntent {
  const original = rawText.trim();
  if (!original) return { kind: "unknown", text: "" };

  const normalized = normalize(original);

  if (isTaskCompletionIntent(normalized)) {
    return {
      kind: "complete_task",
      query: extractCompletionQuery(original),
    };
  }

  if (isGoalIntent(normalized)) {
    return {
      kind: "goal",
      title: sanitizeTitle(original),
      targetCount: parseGoalTargetCount(normalized),
    };
  }

  if (isHabitIntent(normalized)) {
    return {
      kind: "habit",
      title: sanitizeTitle(original),
      mode: detectHabitMode(normalized),
    };
  }

  return {
    kind: "task",
    title: sanitizeTitle(original),
    scope: detectTaskScope(normalized),
  };
}
