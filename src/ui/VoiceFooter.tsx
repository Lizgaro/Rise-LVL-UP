import { useEffect, useRef, useState } from "react";
import { parseVoiceInput, type VoiceIntent } from "../voice/intent-parser";
import { useAppStore } from "../store/use-app-store";
import { buildVoiceIntentPreview } from "../voice/intent-preview";

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

export function VoiceFooter() {
  const addTask = useAppStore((state) => state.addTask);
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

    setVoiceMessage("Не удалось распознать команду");
  };

  const confirmPendingIntent = async () => {
    if (!pendingIntent) return;
    await applyVoiceIntent(pendingIntent);
    setPendingIntent(null);
    setLastTranscript("");
  };

  const cancelPendingIntent = () => {
    setPendingIntent(null);
    setLastTranscript("");
    setVoiceMessage("Команда отменена");
  };

  const startListening = () => {
    const Recognition = getRecognitionCtor();
    if (!Recognition) {
      setVoiceMessage("Голосовой ввод не поддерживается");
      return;
    }

    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      setLastTranscript(transcript);
      if (!transcript) {
        setPendingIntent(null);
        setVoiceMessage("Пустой ввод, попробуй еще раз");
        return;
      }

      const parsed = parseVoiceInput(transcript);
      if (parsed.kind === "unknown") {
        setPendingIntent(null);
        setVoiceMessage("Не удалось распознать команду");
        return;
      }

      setPendingIntent(parsed);
      setVoiceMessage("Проверь распознавание и подтверди");
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

  if (!isSupported) return null;

  return (
    <footer className="voice-footer-container">
      <div className="voice-footer-panel">
        {/* Recording indicator */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={startListening}>
          <div className="relative size-12 flex items-center justify-center">
            {isListening && <div className="absolute inset-0 bg-primary-20 rounded-full animate-ping"></div>}
            <div className={`relative size-10 rounded-full flex items-center justify-center text-white ${isListening ? 'bg-primary' : 'bg-ink'}`}>
              <span className="material-symbols-outlined">{isListening ? 'mic' : 'mic_none'}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {isListening ? "Слушаю..." : "Голос"}
            </span>
            {isListening && (
                <div className="flex gap-0.5 items-center h-4">
                  <div className="h-1.5 w-1 bg-primary rounded-full animate-pulse"></div>
                  <div className="h-3 w-1 bg-primary rounded-full animate-pulse delay-75"></div>
                  <div className="h-2 w-1 bg-primary rounded-full animate-pulse delay-100"></div>
                  <div className="h-4 w-1 bg-primary rounded-full animate-pulse delay-150"></div>
                  <div className="h-2 w-1 bg-primary rounded-full animate-pulse delay-75"></div>
                </div>
            )}
          </div>
        </div>

        {/* Real-time transcript */}
        <div className="flex-1 border-l border-primary-10 pl-6 h-10 flex items-center overflow-hidden">
          <p className="text-sm font-medium text-ink-70 italic line-clamp-1 truncate">
             {lastTranscript ? `"${lastTranscript}"` : (voiceMessage || "Нажми микрофон для команды...")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
            {pendingIntent ? (
                <>
                   <button
                        onClick={() => void confirmPendingIntent()}
                        className="px-3 py-1.5 rounded-lg bg-primary-5 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary-10 transition-colors"
                        type="button"
                    >
                        Подтвердить
                    </button>
                    <button
                        onClick={cancelPendingIntent}
                        className="px-3 py-1.5 rounded-lg bg-ink text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-colors"
                        type="button"
                    >
                        Отмена
                    </button>
                </>
            ) : (
                <button
                    className="size-9 flex items-center justify-center rounded-lg bg-ink text-white hover:scale-105 transition-transform"
                    onClick={() => {
                        // Just a visual trigger for now or maybe trigger magic later
                        startListening();
                    }}
                    type="button"
                >
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                </button>
            )}
        </div>
      </div>
    </footer>
  );
}
