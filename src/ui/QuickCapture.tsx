import { useState, type KeyboardEvent } from "react";
import { useAppStore } from "../store/use-app-store";

export function QuickCapture() {
  const addTask = useAppStore((state) => state.addTask);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && title.trim()) {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await addTask(title, "task");
        setTitle("");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <footer className="w-full pb-10 flex justify-center px-8 shrink-0">
      <div className="max-w-2xl w-full relative">
        <div className="bg-surface-dark ronin-border rounded-xl px-6 py-4 flex items-center gap-4 shadow-2xl backdrop-blur-md bg-opacity-80">
          <span className="material-symbols-outlined text-slate-500">bolt</span>
          <input
            className="!bg-transparent !border-none !shadow-none !outline-none focus:ring-0 text-slate-100 w-full placeholder-slate-600 font-medium h-auto p-0 min-h-0"
            placeholder="Быстрый ввод..."
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden md:inline-flex px-2 py-1 bg-white/5 ronin-border text-[10px] text-slate-500 rounded font-bold uppercase">Enter</kbd>
            <button
              className="size-10 rounded-lg bg-crimson flex items-center justify-center text-white shadow-lg hover:brightness-125 transition-all"
              onClick={() => alert("Голосовой ввод пока недоступен в этом дизайне")}
              title="Голосовой ввод"
            >
              <span className="material-symbols-outlined text-xl">mic</span>
            </button>
          </div>
        </div>

        {/* Subtitle/Hint */}
        <p className="text-center text-[10px] text-slate-600 mt-4 font-medium tracking-[0.2em] uppercase">
          Запишите свою следующую битву
        </p>
      </div>
    </footer>
  );
}
