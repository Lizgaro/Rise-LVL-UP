import type { VoiceIntent } from "./intent-parser";

export interface VoiceIntentPreview {
  title: string;
  subtitle: string;
  chips: string[];
  canConfirm: boolean;
}

function scopeChip(scope: "inbox" | "day" | "week"): string {
  if (scope === "day") return "Сегодня";
  if (scope === "week") return "Неделя";
  return "Inbox";
}

export function buildVoiceIntentPreview(intent: VoiceIntent): VoiceIntentPreview {
  if (intent.kind === "task") {
    return {
      title: `Задача: ${intent.title}`,
      subtitle: `План: ${scopeChip(intent.scope)}`,
      chips: ["Задача", scopeChip(intent.scope)],
      canConfirm: true,
    };
  }

  if (intent.kind === "goal") {
    return {
      title: `Цель: ${intent.title}`,
      subtitle: `Целевых шагов: ${intent.targetCount}`,
      chips: ["Цель", `${intent.targetCount} шагов`],
      canConfirm: true,
    };
  }

  if (intent.kind === "habit") {
    const modeLabel = intent.mode === "quit" ? "Избавиться" : "Развить";
    return {
      title: `Привычка: ${intent.title}`,
      subtitle: `Режим: ${modeLabel}`,
      chips: ["Привычка", modeLabel],
      canConfirm: true,
    };
  }

  return {
    title: "Не удалось распознать команду",
    subtitle: "Скажи короче: задача, цель или привычка.",
    chips: ["Ошибка"],
    canConfirm: false,
  };
}
