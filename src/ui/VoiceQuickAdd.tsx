import { useEffect, useRef, useState } from "react";
import { parseVoiceInput, type VoiceIntent } from "../voice/intent-parser";
import { useAppStore } from "../store/use-app-store";
import { buildVoiceIntentPreview } from "../voice/intent-preview";
import { resolveVoiceIntentWithGemini } from "../voice/gemini-intent";

type RecognitionResultItem = {
  transcript: string;
};

type RecognitionEventLike = {
  results: ArrayLike<ArrayLike<RecognitionResultItem>>;
};

type RecognitionErrorEventLike = {
  error: string;
};

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort?: () => void;
};

type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const scope = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition;
}

export function VoiceQuickAdd() {
  const tasks = useAppStore((state) => state.tasks);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const addTask = useAppStore((state) => state.addTask);
  const toggleTaskDone = useAppStore((state) => state.toggleTaskDone);
  const setTaskScope = useAppStore((state) => state.setTaskScope);
  const addGoal = useAppStore((state) => state.addGoal);
  const addHabit = useAppStore((state) => state.addHabit);

  const recognitionRef = useRef<RecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [pendingIntent, setPendingIntent] = useState<VoiceIntent | null>(null);

  const isSupported = Boolean(getRecognitionCtor());
  const pendingPreview = pendingIntent ? buildVoiceIntentPreview(pendingIntent) : null;
  const isAiEnabled = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  const findTaskByQuery = (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    return tasks.find((task) => {
      if (task.status === "done") return false;
      const normalizedTitle = task.title.toLowerCase().trim();
      return normalizedTitle.includes(normalizedQuery) || normalizedQuery.includes(normalizedTitle);
    });
  };

  const findCurrentDayTask = () =>
    dayPlan.priorityTaskIds
      .map((id) => tasks.find((task) => task.id === id))
      .find((task): task is NonNullable<typeof task> => Boolean(task) && task.status === "todo");

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
    };
  }, []);

  const applyVoiceIntent = async (parsed: VoiceIntent) => {
    if (parsed.kind === "goal") {
      addGoal(parsed.title, parsed.targetCount);
      setVoiceMessage(`Добавлена цель: ${parsed.title}`);
      return;
    }

    if (parsed.kind === "habit") {
      addHabit(parsed.title, parsed.mode);
      setVoiceMessage(`Добавлена привычка: ${parsed.title}`);
      return;
    }

    if (parsed.kind === "task") {
      const taskId = await addTask(parsed.title, "task");
      if (parsed.scope !== "inbox") {
        await setTaskScope(taskId, parsed.scope);
      }
      setVoiceMessage(`Добавлена задача: ${parsed.title}`);
      return;
    }

    if (parsed.kind === "complete_task") {
      const genericCompletionRefs = new Set(["эту", "текущую", "текущая", "сейчас"]);
      let matched = findTaskByQuery(parsed.query);
      if (!matched && genericCompletionRefs.has(parsed.query.trim().toLowerCase())) {
        matched = findCurrentDayTask();
      }
      if (!matched) {
        setVoiceMessage(`Не нашел задачу для завершения: ${parsed.query}`);
        return;
      }
      await toggleTaskDone(matched.id);
      setVoiceMessage(`Отметил как выполненную: ${matched.title}`);
      return;
    }

    setVoiceMessage("Не удалось распознать команду");
  };

  const confirmPendingIntent = async () => {
    if (!pendingIntent) return;
    await applyVoiceIntent(pendingIntent);
    setPendingIntent(null);
  };

  const cancelPendingIntent = () => {
    setPendingIntent(null);
    setVoiceMessage("Команда отменена");
  };

  const startListening = () => {
    const Recognition = getRecognitionCtor();
    if (!Recognition) {
      setVoiceMessage("Голосовой ввод не поддерживается в этом браузере");
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) {
        setPendingIntent(null);
        setVoiceMessage("Пустой ввод, попробуй еще раз");
        return;
      }

      void resolveVoiceIntentWithGemini(transcript, parseVoiceInput).then((resolved) => {
        setLastTranscript(resolved.rewrittenText);
        if (resolved.intent.kind === "unknown") {
          setPendingIntent(null);
          setVoiceMessage("Не удалось распознать команду");
          return;
        }
        setPendingIntent(resolved.intent);
        setVoiceMessage(
          resolved.source === "gemini"
            ? "AI обработал команду. Проверь и подтверди."
            : "Проверь распознавание и подтверди",
        );
      });
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setVoiceMessage("Нет доступа к микрофону");
      } else {
        setVoiceMessage("Ошибка распознавания речи");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setVoiceMessage("");
    setPendingIntent(null);
    setIsListening(true);
    recognition.start();
  };

  return (
    <div className="row">
      <button
        data-testid="voice-add-btn"
        type="button"
        onClick={startListening}
        disabled={!isSupported || isListening || Boolean(pendingIntent)}
      >
        {isListening ? "Слушаю..." : "Голосовой ввод"}
      </button>
      {!isSupported ? <span className="muted">В этом браузере голосовой ввод недоступен</span> : null}
      {pendingPreview ? (
        <div className="voice-preview" data-testid="voice-preview">
          <strong>{pendingPreview.title}</strong>
          <p className="muted">{pendingPreview.subtitle}</p>
          <div className="row compact">
            {pendingPreview.chips.map((chip) => (
              <span key={chip} className="chip">
                {chip}
              </span>
            ))}
          </div>
          <div className="row compact">
            <button
              data-testid="voice-confirm-btn"
              type="button"
              onClick={() => void confirmPendingIntent()}
              disabled={!pendingPreview.canConfirm}
            >
              Подтвердить
            </button>
            <button data-testid="voice-cancel-btn" type="button" onClick={cancelPendingIntent}>
              Отменить
            </button>
          </div>
        </div>
      ) : null}
      {lastTranscript ? <span className="muted">Речь: {lastTranscript}</span> : null}
      {voiceMessage ? <span className="muted">{voiceMessage}</span> : null}
      <span className="muted">AI: {isAiEnabled ? "Gemini включен" : "fallback (без API ключа)"}</span>
    </div>
  );
}
