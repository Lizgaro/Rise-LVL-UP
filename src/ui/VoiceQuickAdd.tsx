import { useEffect, useRef, useState } from "react";
import { parseVoiceInput } from "../voice/intent-parser";
import { useAppStore } from "../store/use-app-store";

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
  const addTask = useAppStore((state) => state.addTask);
  const setTaskScope = useAppStore((state) => state.setTaskScope);
  const addGoal = useAppStore((state) => state.addGoal);
  const addHabit = useAppStore((state) => state.addHabit);

  const recognitionRef = useRef<RecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");

  const isSupported = Boolean(getRecognitionCtor());

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
    };
  }, []);

  const applyVoiceIntent = async (speechText: string) => {
    const parsed = parseVoiceInput(speechText);

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
      setLastTranscript(transcript);
      if (!transcript) {
        setVoiceMessage("Пустой ввод, попробуй еще раз");
        return;
      }
      void applyVoiceIntent(transcript);
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
    setIsListening(true);
    recognition.start();
  };

  return (
    <div className="row">
      <button
        data-testid="voice-add-btn"
        type="button"
        onClick={startListening}
        disabled={!isSupported || isListening}
      >
        {isListening ? "Слушаю..." : "Голосовой ввод"}
      </button>
      {!isSupported ? <span className="muted">В этом браузере голосовой ввод недоступен</span> : null}
      {lastTranscript ? <span className="muted">Речь: {lastTranscript}</span> : null}
      {voiceMessage ? <span className="muted">{voiceMessage}</span> : null}
    </div>
  );
}
