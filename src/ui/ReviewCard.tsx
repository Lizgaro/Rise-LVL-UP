import { useMemo, useState, type ChangeEvent } from "react";
import { buildWeeklySummary } from "../core/analytics";
import { buildReviewInsights } from "../core/review-insights";
import { useAppStore } from "../store/use-app-store";
import { exportBackup, importBackup } from "../storage/repository";

const MAX_WEEK_PRIORITIES = 10;

export function ReviewCard() {
  const tasks = useAppStore((state) => state.tasks);
  const goals = useAppStore((state) => state.goals);
  const habits = useAppStore((state) => state.habits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const dayPlan = useAppStore((state) => state.dayPlan);
  const weekPlan = useAppStore((state) => state.weekPlan);
  const setDayPlan = useAppStore((state) => state.setDayPlan);
  const setWeekPlan = useAppStore((state) => state.setWeekPlan);
  const setTaskScope = useAppStore((state) => state.setTaskScope);
  const closeDayPlan = useAppStore((state) => state.closeDayPlan);
  const flushPersistence = useAppStore((state) => state.flushPersistence);
  const loadInitial = useAppStore((state) => state.loadInitial);

  const [notes, setNotes] = useState({
    reviewedDay: false,
    plannedTomorrow: false,
    minimizedDistractions: false,
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [backupBusy, setBackupBusy] = useState(false);

  const dayPriorityTasks = useMemo(
    () =>
      dayPlan.priorityTaskIds
        .map((id) => tasks.find((task) => task.id === id))
        .filter((task): task is NonNullable<typeof task> => Boolean(task)),
    [dayPlan.priorityTaskIds, tasks],
  );
  const dayTodoIds = dayPriorityTasks.filter((task) => task.status === "todo").map((task) => task.id);
  const dayDone = dayPriorityTasks.filter((task) => task.status === "done").length;
  const dayMissed = dayPriorityTasks.filter((task) => task.status === "missed").length;
  const weeklySummary = useMemo(
    () => buildWeeklySummary(tasks, goals, habits, habitLogs, weekPlan),
    [tasks, goals, habits, habitLogs, weekPlan],
  );
  const weeklyInsights = useMemo(() => buildReviewInsights(weeklySummary), [weeklySummary]);
  const checklistDone = Object.values(notes).filter(Boolean).length;

  const moveTodoToWeek = async () => {
    if (dayTodoIds.length === 0) {
      setStatusMessage("Нечего переносить: активных дневных приоритетов нет.");
      return;
    }

    const nextWeek = [...weekPlan.priorityTaskIds];
    dayTodoIds.forEach((taskId) => {
      if (nextWeek.length >= MAX_WEEK_PRIORITIES) return;
      if (!nextWeek.includes(taskId)) nextWeek.push(taskId);
    });

    await Promise.all(dayTodoIds.map((taskId) => setTaskScope(taskId, "week")));
    setWeekPlan(nextWeek);
    setDayPlan(dayPlan.priorityTaskIds.filter((taskId) => !dayTodoIds.includes(taskId)));
    setStatusMessage("Незавершенные задачи перенесены в недельный план.");
  };

  const downloadBackup = async () => {
    if (backupBusy) return;
    try {
      setBackupBusy(true);
      await flushPersistence();
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date(backup.exportedAt).toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `rise-lvl-up-backup-${stamp}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatusMessage("Бэкап сохранен в JSON.");
    } catch {
      setStatusMessage("Не удалось сохранить бэкап.");
    } finally {
      setBackupBusy(false);
    }
  };

  const restoreBackupFromFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || backupBusy) return;
    try {
      setBackupBusy(true);
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;
      await importBackup(payload);
      await loadInitial();
      setStatusMessage("Бэкап успешно восстановлен.");
    } catch {
      setStatusMessage("Ошибка восстановления бэкапа.");
    } finally {
      event.target.value = "";
      setBackupBusy(false);
    }
  };

  return (
    <section className="card review-card">
      <h2>Ревью дня и недели</h2>
      <h3>Чеклист конца дня</h3>
      <p className="muted">
        Приоритеты дня: {dayDone}/{dayPriorityTasks.length}
        {dayMissed > 0 ? ` | Пропущено: ${dayMissed}` : ""}
      </p>
      <label className="check">
        <input
          type="checkbox"
          checked={notes.reviewedDay}
          onChange={(e) => setNotes((current) => ({ ...current, reviewedDay: e.target.checked }))}
        />
        Разобрал прогресс дня
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={notes.plannedTomorrow}
          onChange={(e) => setNotes((current) => ({ ...current, plannedTomorrow: e.target.checked }))}
        />
        Подготовил 3 приоритета на завтра
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={notes.minimizedDistractions}
          onChange={(e) => setNotes((current) => ({ ...current, minimizedDistractions: e.target.checked }))}
        />
        Убрал отвлекающие факторы
      </label>
      <p className="muted">Чеклист: {checklistDone}/3</p>

      <div className="row">
        <button
          data-testid="review-move-day-to-week-btn"
          type="button"
          onClick={() => void moveTodoToWeek()}
          disabled={dayTodoIds.length === 0}
        >
          Перенести остаток в неделю
        </button>
        <button
          data-testid="review-close-day-btn"
          type="button"
          onClick={() => void closeDayPlan()}
          disabled={dayPriorityTasks.length === 0}
        >
          Закрыть день
        </button>
      </div>

      {statusMessage ? <p className="muted">{statusMessage}</p> : null}

      <h3>Резервная копия</h3>
      <p className="muted">Сохрани состояние в JSON и восстанови в любой момент.</p>
      <div className="row">
        <button
          data-testid="backup-export-btn"
          type="button"
          onClick={() => void downloadBackup()}
          disabled={backupBusy}
        >
          Скачать бэкап
        </button>
        <label>
          Восстановить из файла
          <input
            data-testid="backup-import-input"
            type="file"
            accept="application/json"
            onChange={(event) => void restoreBackupFromFile(event)}
            disabled={backupBusy}
          />
        </label>
      </div>

      <h3>Итоги недели</h3>
      <p className="muted">
        Приоритеты: {weeklySummary.prioritiesDone}/{weeklySummary.prioritiesTotal}
        {weeklySummary.prioritiesMissed > 0 ? ` | Пропущено: ${weeklySummary.prioritiesMissed}` : ""}
      </p>
      <p className="muted">
        Цели: {weeklySummary.goalsDone}/{weeklySummary.goalsTotal} | Привычки done: {weeklySummary.habitDoneLogs}
        {` | Срывы: ${weeklySummary.relapses}`}
      </p>
      <ul className="list compact">
        {weeklyInsights.map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>
    </section>
  );
}
