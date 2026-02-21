# [MVP Progress] Rise LVL UP - Реализовано и осталось

## Реализовано

- Базовый проект и тестовая инфраструктура (Vite/TS/Vitest/Playwright).
- Доменные константы и типы.
- ProgressRules с мягкими штрафами и ограничением level-down (не чаще 1 раза в 24ч).
- Планирование день/неделя (ограничение 3 приоритета на день).
- Локальный репозиторий данных задач через Dexie.
- Zustand store с основными действиями:
  - задачи
  - планы
  - цели
  - привычки
  - таймер
  - шум
  - RPG обновления
- Одностраничный UI на русском:
  - Фокус-таймер
  - Список задач/идей
  - Планы
  - Цели
  - Привычки
  - RPG-прогресс
  - Шум
- Unit тесты: проходят.
- E2E сценарии: написаны.

## Осталось

- Включить стабильный e2e запуск в текущем окружении (сейчас блокер по системной библиотеке `libnspr4.so` для Chromium headless).
- Финализировать визуальную полировку минималистичного дизайна.

## Блокеры

- Playwright Chromium не стартует в окружении без системной библиотеки `libnspr4.so`.

## Предлагаемые следующие шаги для @Jules

1. Подготовить системные зависимости для Playwright в среде CI/локально.
2. Довести e2e тесты до зеленого статуса и добавить в обязательный пайплайн.
3. Усилить P1/P2 UX-слой (streak/weekly summary/визуальная обратная связь).
4. Закрыть финальные UX-детали и accessibility-check.

---

## Обновление (2026-02-21): Critical Audit v2

### Что реализовано в этом апдейте

- Проведен жесткий технический аудит текущего MVP с доказательствами по файлам/линиям.
- Сформирован большой приоритетный чек-лист улучшений до уровня 10/10.
- Записана диагностика и roadmap:
  - `docs/research/2026-02-21-critical-audit-v2.md`
- В master/progress логах зафиксированы новые статусы:
  - `docs/progress/2026-02-21-master-log.md`
  - `docs/progress/2026-02-21-agent-orchestration-log.md`

### Что осталось после аудита

- P0: довести до рабочего ядра:
  - реальный countdown-таймер с фазами
  - реальный white/pink/brown noise через Web Audio
  - voice-ввод "речь -> задача/цель/привычка/план"
  - full persistence всех доменных сущностей
  - запуск `task_missed` и штрафов при невыполнении
- P1: усиление мотивации и UX-сценария "что делать сейчас".
- P2: умные ускорители, аналитика и полировка.

---

## Обновление (2026-02-21): P0 batch #1 - Timer Core

### Реализовано

- Таймер переведен на реальный countdown-контур.
- Добавлены фазы: `idle`, `focus`, `break`.
- Добавлен автопереход: `focus -> break -> idle`.
- Добавлено восстановление активного таймера после перезагрузки (через local storage snapshot).
- Добавлен `tickTimer` и обновление UI таймера по секундам.
- Добавлены тесты TDD на:
  - авто-переход в перерыв
  - завершение перерыва в idle
  - восстановление активной сессии после reload

### Осталось (P0)

- Реальный white/pink/brown noise через Web Audio API.
- Full persistence всех доменных сущностей (не только tasks и timer snapshot).
- Голосовой ввод `speech -> task/goal/habit/plan`.
- Автоматический `task_missed` с применением штрафов.

---

## Обновление (2026-02-21): P0 batch #2 - Real Noise Engine

### Реализовано

- Модуль `noise-engine` переписан с реальным Web Audio API runtime.
- Добавлена генерация `white`, `pink`, `brown` noise буферов.
- Добавлены start/stop/restart сценарии аудио-графа.
- При выборе типа шума в UI теперь запускается реальное воспроизведение (не только флаг состояния).
- Добавлен тест на построение audio graph и запуск воспроизведения.

### Осталось (P0)

- Full persistence всех доменных сущностей (не только tasks и timer snapshot).
- Голосовой ввод `speech -> task/goal/habit/plan`.
- Автоматический `task_missed` с применением штрафов.

---

## Обновление (2026-02-21): P0 batch #3 - Full Persistence

### Реализовано

- Реализован snapshot-load из IndexedDB для ключевых сущностей:
  - goals, habits, habitLogs, dayPlan, weekPlan, rpg, recoveryQuest, audioSettings, lastFocusSession.
- `loadInitial` теперь гидратирует store не только задачами, но и полным persisted состоянием.
- Добавлена очередь сохранения и `flushPersistence` для детерминированного завершения записи.
- Добавлено сохранение обновлений в persistence при изменении:
  - day/week plans
  - goals и goal progress
  - habits/habit logs
  - rpg updates
  - recovery quest
  - audio settings
  - completed focus sessions
- Добавлен TDD-тест на cross-reload восстановление (goals/habits/plans/rpg/noise).

### Осталось (P0)

- Автоматический `task_missed` с применением штрафов.

---

## Обновление (2026-02-21): P0 batch #5 - Missed Tasks + Penalty

### Реализовано

- Добавлено действие `applyMissedTasks` в store.
- При `loadInitial` теперь автоматически проверяются просроченные day/week приоритеты.
- Просроченные задачи автоматически переводятся в `missed`.
- За каждую `missed` задачу применяется RPG-событие `task_missed` (мягкий штраф).
- Добавлен TDD-тест на сценарий "следующий день -> missed + снижение XP".

### Осталось (P0)

- Нет открытых пунктов: P0 закрыт.

---

## Обновление (2026-02-21): P1 batch #1 - Guided UX ("Что делать сейчас")

### Реализовано

- Добавлен hero-блок `Что делать сейчас` в верхнюю часть экрана.
- Блок показывает следующий приоритет дня и текущий прогресс по дневным приоритетам.
- Добавлены быстрые действия:
  - `Старт фокуса`
  - `Задача выполнена`
- Обновлена иерархия экрана: сначала текущий фокус пользователя, затем остальная функциональность.
- Добавлен тест на наличие hero-секции в основном UI.

### Осталось (P1/P2)

- Усилить визуальную полировку и мотивационную обратную связь (анимации, richer progress feedback).
- Доработать recovery-квесты (автозавершение/истечение).
- Стабилизировать e2e в окружении с системными зависимостями Chromium.

---

## Обновление (2026-02-21): P0 batch #4 - Voice Quick Add

### Реализовано

- Добавлен голосовой quick-add в блок задач (`VoiceQuickAdd`).
- Добавлена маршрутизация распознанной речи в:
  - `task` (в т.ч. со scope `day/week` по ключевым словам)
  - `goal`
  - `habit` (`build/quit`)
- Добавлен fallback-текст в UI, если браузер не поддерживает SpeechRecognition.
- Добавлены unit-тесты парсинга voice intents:
  - `src/voice/intent-parser.test.ts`

### Осталось (P0)

- Автоматический `task_missed` с применением штрафов.

---

## Обновление (2026-02-21): P1 batch #2 - Daily Progress + XP Feed

### Реализовано

- В `RPG-прогрессе` добавлен блок `Сегодняшний прогресс`:
  - выполнено/всего дневных приоритетов
  - пропущенные приоритеты
  - отдельный progress bar по дню
- Добавлена лента `Последние XP-события` с дельтами `+/- XP`.
- В store добавена запись XP-событий для ключевых действий:
  - выполнение задач/приоритетов
  - шаги по целям
  - события привычек
  - фокус-сессии
  - пропуски задач (`task_missed`)
- Добавлены тесты на наличие новых секций UI и запись XP-событий.

### Осталось (P1/P2)

- Усилить визуальную полировку и мотивационную обратную связь.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.

---

## Обновление (2026-02-21): P1/P2 batch #4 - Recovery Quest Lifecycle

### Реализовано

- Recovery-квест теперь имеет lifecycle-поля прогресса:
  - required/completed для задач и фокус-сессий.
- Реализовано автозавершение recovery-квеста при выполнении требований:
  - `1 задача + 1 фокус-сессия` (по текущей конфигурации MVP).
- Реализовано автоистечение recovery-квеста при загрузке, если TTL прошел.
- В `RPG-прогрессе` добавено отображение:
  - прогресс активного recovery-квеста
  - состояния `done/expired`.
- Исправлено persistence-поведение recovery-квеста:
  - хранится единый актуальный snapshot (без накопления устаревших записей).
- Добавлены unit-тесты на завершение и истечение recovery-квеста.

### Осталось (P1/P2)

- Усилить визуальную полировку и мотивационную обратную связь.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.

---

## Обновление (2026-02-21): P1 batch #3 - Streaks + Weekly Summary

### Реализовано

- Добавлен модуль аналитики:
  - расчет `стриков привычек` (build/quit режимы)
  - расчет `итогов недели` (приоритеты/цели/привычки)
- В `RPG-прогрессе` добавлены секции:
  - `Стрики привычек`
  - `Итоги недели`
- Расширена test coverage:
  - `src/core/analytics.test.ts`
  - `src/ui/AppShell.test.tsx` проверяет новые заголовки.

### Осталось (P1/P2)

- Доработать recovery-квесты (автозавершение/истечение).
- Усилить визуальную полировку и мотивационную обратную связь (анимации/состояния).
- Стабилизировать e2e в окружении с системными зависимостями Chromium.

---

## Обновление (2026-02-21): P1/P2 batch #5 - Day Pulse + Visual Polish

### Реализовано

- Добавлена новая карточка `Пульс дня` в верхней части экрана:
  - приоритеты дня (`done/total/missed`)
  - текущий статус фокус-таймера
  - быстрый RPG-срез (`уровень`, `XP сегодня`, `стрик`)
  - статус recovery-квеста
- Обновлена иерархия в `AppShell`: сначала мгновенный срез состояния дня, затем сценарные блоки действий.
- Усилен визуальный слой:
  - CSS-переменные и более четкая типографика
  - мягкая анимация появления карточек
  - обновленные поверхности/контролы и адаптивное поведение на мобильных ширинах
- Расширена UI-проверка: `AppShell.test.tsx` теперь проверяет наличие секции `Пульс дня`.
- Верификация:
  - `npm run test:run -- src/ui/AppShell.test.tsx` PASS
  - `npm run test:run` PASS
  - `npm run build` PASS

### Осталось (P1/P2)

- Добавить UX-контур для voice-подтверждения перед записью (preview + confirm/cancel).
- Добавить health-индикаторы окружения (микрофон/аудио/IndexedDB) для быстрой диагностики.
- Продолжить UX-полировку по критическому чек-листу (guided flow и прозрачные состояния).
- Стабилизировать e2e в окружении с системными зависимостями Chromium.

---

## Обновление (2026-02-21): P1/P2 batch #6 - Voice Confirm + Health Banner

### Реализовано

- Добавлен блок `Готовность окружения`:
  - статус микрофона (voice capability)
  - статус Web Audio
  - статус IndexedDB
- В голосовом quick-add добавлен безопасный confirmation-flow:
  - после распознавания показывается preview команды
  - пользователь явно подтверждает (`Подтвердить`) или отменяет (`Отменить`)
  - до подтверждения команда не сохраняется
- Добавлены новые модули:
  - `src/core/health-checks.ts`
  - `src/voice/intent-preview.ts`
- Добавлены тесты:
  - `src/core/health-checks.test.ts`
  - `src/voice/intent-preview.test.ts`
  - `src/ui/AppShell.test.tsx` расширен проверкой заголовка `Готовность окружения`
- Верификация:
  - `npm run test:run` PASS
  - `npm run build` PASS

### Осталось (P1/P2)

- Продолжить UX-полировку guided flow и мотивационной обратной связи.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.
- Проверить и интегрировать follow-up от @Jules по issue #1.

---

## Обновление (2026-02-21): P1/P2 batch #7 - Guided Planning + Task Filters

### Реализовано

- В `Планы` добавлена action-кнопка `Подобрать 3 из недели`:
  - сохраняет текущие `todo` приоритеты дня
  - добирает оставшиеся слоты из недельных приоритетов (до лимита 3)
- В `Список задач и идей` добавлен фильтр списка:
  - `Только активные` / `Все` / `Приоритет дня` / `Приоритет недели` / `Выполненные` / `Пропущенные`
  - отображается количество задач в текущем фильтре
- Добавлены core-модули и тесты:
  - `src/core/planning-suggestions.ts` + `src/core/planning-suggestions.test.ts`
  - `src/core/task-filters.ts` + `src/core/task-filters.test.ts`
- UI-тест расширен проверками новых текстов:
  - `Подобрать 3 из недели`
  - `Фильтр списка`
- Верификация:
  - `npm run test:run` PASS
  - `npm run build` PASS

### Осталось (P1/P2)

- Продолжить UX-полировку guided flow и мотивационной обратной связи.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.
- Проверить и интегрировать follow-up от @Jules по issue #1.

---

## Обновление (2026-02-21): P1/P2 batch #8 - End-of-Day Review Loop

### Реализовано

- Добавлена карточка `Ревью дня и недели`:
  - чеклист конца дня
  - кнопка `Перенести остаток в неделю`
  - блок коротких weekly-insights
- В store добавлено безопасное действие `closeDayPlan`:
  - переводит только `todo` приоритеты дня в `missed`
  - применяет RPG-штраф и пишет XP-события
  - очищает day plan, не затрагивая week plan
- Добавлены модули и тесты:
  - `src/core/review-insights.ts` + `src/core/review-insights.test.ts`
  - `src/store/use-app-store.test.ts` расширен кейсом `closeDayPlan`
- UI-покрытие:
  - `src/ui/AppShell.test.tsx` проверяет заголовок `Ревью дня и недели`
- Верификация:
  - `npm run test:run` PASS
  - `npm run build` PASS

### Осталось (P1/P2)

- Продолжить UX-полировку guided flow и мотивационной обратной связи.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.
- Проверить и интегрировать follow-up от @Jules по issue #1.

---

## Обновление (2026-02-21): P1/P2 batch #9 - Focus Mode (Zen Layout)

### Реализовано

- Добавлен блок `Режим фокуса` с переключателем в верхней части интерфейса.
- При активном таймере и включенном режиме интерфейс переходит в минимальный layout:
  - `Пульс дня`
  - `Что делать сейчас`
  - `Фокус-таймер`
  - `Концентрация (шум)`
- Добавлен модуль логики режима:
  - `src/core/focus-mode.ts`
  - `src/core/focus-mode.test.ts`
- Обновлены UI-тесты и стили для нового режима.
- Верификация:
  - `npm run test:run` PASS
  - `npm run build` PASS

### Осталось (P1/P2)

- Продолжить UX-полировку guided flow и мотивационной обратной связи.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.
- Проверить и интегрировать follow-up от @Jules по issue #1.

---

## Обновление (2026-02-21): P1/P2 batch #10 - Timer Pause/Resume

### Реализовано

- Для таймера добавлена пауза/продолжение:
  - новая store-команда `toggleTimerPause`
  - сохранение и восстановление оставшегося времени без потерь
- В UI таймера добавлена кнопка:
  - `Пауза` (во время сессии)
  - `Продолжить` (в состоянии паузы)
- Добавлено отображение состояния `Сессия на паузе`.
- Расширено покрытие тестами:
  - `src/store/use-app-store.test.ts` (сценарий pause/resume с проверкой `remainingMs`)
  - `src/ui/AppShell.test.tsx` (наличие label `Пауза`)
- Верификация:
  - `npm run test:run` PASS
  - `npm run build` PASS

### Осталось (P1/P2)

- Продолжить UX-полировку guided flow и мотивационной обратной связи.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.
- Проверить и интегрировать follow-up от @Jules по issue #1.

---

## Обновление (2026-02-21): P1/P2 batch #11 - Timer Hotkeys

### Реализовано

- Добавлено управление таймером с клавиатуры:
  - `Space` -> старт/пауза
  - `S` -> старт
  - `R` -> сброс/отмена
- Добавлен core-модуль резолва хоткеев:
  - `src/core/timer-shortcuts.ts`
  - `src/core/timer-shortcuts.test.ts`
- В `FocusTimerCard` добавлена подсказка по хоткеям.
- Безопасность ввода:
  - хоткеи не перехватываются при фокусе в `input/select/textarea`.
- Верификация:
  - `npm run test:run` PASS
  - `npm run build` PASS

### Осталось (P1/P2)

- Продолжить UX-полировку guided flow и мотивационной обратной связи.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.
- Проверить и интегрировать follow-up от @Jules по issue #1.

---

## Обновление (2026-02-21): P1/P2 batch #12 - Local Backup Export/Import

### Реализовано

- Добавлен локальный JSON-бэкап:
  - `exportBackup` (полный snapshot)
  - `importBackup` (валидация формата + восстановление)
- В `Ревью дня и недели` добавлен блок `Резервная копия`:
  - кнопка `Скачать бэкап`
  - загрузка JSON-файла для восстановления
- Добавлены тесты:
  - `src/storage/repository.test.ts` (roundtrip export/import)
  - `src/ui/AppShell.test.tsx` (наличие блока `Резервная копия`)
- Верификация:
  - `npm run test:run` PASS
  - `npm run build` PASS

### Осталось (P1/P2)

- Продолжить UX-полировку guided flow и мотивационной обратной связи.
- Стабилизировать e2e в окружении с системными зависимостями Chromium.
- Проверить и интегрировать follow-up от @Jules по issue #1.

---

## Обновление (2026-02-21): P1/P2 batch #13 - E2E Stabilization + Final MVP Closure

### Реализовано

- Стабилизирован полный e2e-контур:
  - добавлен `webServer` в `playwright.config.ts` (авто-старт сервера на `127.0.0.1:4173`)
  - добавлены стабильные `data-testid` в `PlansCard` и `HabitsCard`
  - обновлены flaky-assertions в `e2e/mvp-core.spec.ts`
- Полная верификация:
  - `npm run e2e` PASS (6/6)
  - `npm run test:run` PASS (45/45)
  - `npm run build` PASS
- Проверен follow-up от @Jules:
  - проанализирован issue `#1` и PR `#2`
  - PR признан устаревшим относительно актуальной ветки `feat/mvp-core`
  - интеграция изменений из PR не требуется
- Обновлен README:
  - e2e запуск через `npm run e2e`
  - зафиксировано поведение автоподнятия web-server для Playwright.

### Осталось

- Blocking-задач по MVP-ядру нет (scope закрыт).
- Отдельный vNext-бэклог (по желанию):
  - PWA/mobile-first упаковка
  - облачный sync для бэкапа без полноценного auth
  - мини-онбординг первого запуска.

---

## Обновление (2026-02-22): P1/P2 batch #14 - Must-Have Browser Audit + High-Impact Fixes

### Реализовано

- Проведен повторный browser-first аудит с прогоном критичных сценариев:
  - `npm run e2e` PASS (6/6)
  - `npm run test:run` PASS (47/47)
  - `npm run build` PASS
- По синтезу PM/UX/Behavioral/QA субагентов внедрены только must-have изменения:
  - `AppShell`: рабочие экраны `Фокус` / `Планирование` / `Ревью` / `Все`
  - default экран -> `Фокус` для снижения перегрузки
  - `progress-rules`: recovery-буст после срыва с поэтапным расходом зарядов
  - `App`: безопасный bootstrap, полный UI только после `loadInitial`
- Адаптирован e2e под новую IA:
  - в сценариях добавлено явное переключение рабочего экрана
- Обновлены unit-тесты:
  - `src/core/progress-rules.test.ts`
  - `src/ui/AppShell.test.tsx`
- Добавлен отдельный аудит-документ:
  - `docs/research/2026-02-22-browser-must-have-audit.md`

### Осталось

- Блокирующих задач по MVP-ядру нет.
- vNext (не блокирует текущий релиз):
  - PWA/mobile-first упаковка
  - Persistent Storage API (защита local data)
  - лёгкий onboarding первого запуска.

---

## Обновление (2026-02-22): P1/P2 batch #15 - Storage Protection + First-Run Onboarding

### Реализовано

- Добавлен must-have flow защиты local данных через Persistent Storage API:
  - новый core-модуль `src/core/storage-protection.ts`
  - диагностика и кнопка `Защитить данные` в `HealthBanner`
  - расширены тесты `src/core/storage-protection.test.ts`
- Добавлен onboarding первого запуска (3 шага):
  - новый core-модуль `src/core/onboarding.ts`
  - карточка `Быстрый старт (1 минута)` в `AppShell`
  - локальный флаг завершения onboarding
  - тесты `src/core/onboarding.test.ts`
- Обновлены UI-слой и покрытие:
  - `src/ui/AppShell.tsx`, `src/ui/AppShell.test.tsx`
  - `src/ui/HealthBanner.tsx`
  - `src/styles.css`
- Полная верификация после изменений:
  - `npm run e2e` PASS (6/6)
  - `npm run test:run` PASS (54/54)
  - `npm run build` PASS

### Осталось

- Блокирующих задач по MVP-ядру нет.
- vNext (отдельная итерация):
  - PWA/mobile-first
  - расширение browser coverage для storage-protection edge cases
  - персонализированный onboarding по сценарию пользователя.

---

## Обновление (2026-02-22): P1/P2 batch #16 - PWA + Mobile-First Foundation

### Реализовано

- Добавлен PWA-фундамент прод-уровня:
  - `vite-plugin-pwa` в `vite.config.ts`
  - web manifest + service worker генерация в build
  - иконки приложения `public/icons/icon-192.svg` и `public/icons/icon-512.svg`
  - регистрация SW через `src/pwa.ts` и `src/main.tsx`
- Добавлен install UX:
  - карточка `Установить как приложение` (`src/ui/PwaInstallCard.tsx`)
  - интеграция в `src/ui/AppShell.tsx`
- Добавлен core-модуль и тесты для определения standalone-режима:
  - `src/core/pwa-install.ts`
  - `src/core/pwa-install.test.ts`
- Усилен mobile-first слой:
  - touch-target и responsive-контролы в `src/styles.css`
  - meta-теги для мобильного режима в `index.html`
- Техническая стабилизация окружения:
  - после обновления lockfile выполнен `npm install` в Windows для optional Rollup dependency
- Полная верификация:
  - `npm run e2e` PASS (6/6)
  - `npm run test:run` PASS (57/57)
  - `npm run build` PASS

### Осталось

- Блокирующих задач по MVP-ядру нет.
- vNext:
  - PWA update prompt UX
  - аналитика установки (локально)
  - расширение browser edge-cases coverage.

---

## Обновление (2026-02-22): P1/P2 batch #17 - PWA Update UX + Local Install Analytics

### Реализовано

- Добавлен полноценный UX обновления PWA без авто-рывка интерфейса:
  - `src/core/pwa-status.ts` + `src/core/pwa-status.test.ts`
  - `src/pwa.ts` с подпиской на `need_refresh/offline_ready` и явным `applyPwaUpdate`
  - карточка `src/ui/PwaUpdateCard.tsx` (кнопка `Обновить сейчас`)
  - защита от обновления в офлайне (кнопка disabled + подсказка)
- Добавлена локальная аналитика установки (без внешнего трекинга):
  - `src/core/install-analytics.ts` + `src/core/install-analytics.test.ts`
  - интеграция в `src/ui/PwaInstallCard.tsx`
  - счетчики: `Показов`, `Установок`, `Отложено`
- Полный regression после внедрения:
  - `npm run e2e` PASS (6/6)
  - `npm run test:run` PASS (63/63)
  - `npm run build` PASS

### Осталось

- Блокирующих задач по MVP-ядру нет.
- vNext:
  - copy-tuning update prompt
  - offline stress checks
  - расширение browser edge-case coverage.

---

## Обновление (2026-02-22): P1/P2 batch #18 - Update Prompt Copy Tuning + Offline Stress Checks

### Реализовано

- Добавлен контекстный copy-tuning update prompt:
  - `src/core/pwa-update-copy.ts` + `src/core/pwa-update-copy.test.ts`
  - сценарии: online idle / active timer / offline / updating
- Добавлены offline stress checks в диагностику окружения:
  - `src/core/health-checks.ts` + `src/core/health-checks.test.ts`
  - новый статус `Сеть` в `HealthBanner` с офлайн-предупреждением
- Интеграция в UI:
  - `src/ui/PwaUpdateCard.tsx` использует новую copy-логику
- Полная верификация:
  - `npm run e2e` PASS (6/6)
  - `npm run test:run` PASS (67/67)
  - `npm run build` PASS

### Осталось

- Блокирующих задач по MVP-ядру нет.
- vNext:
  - offline stress checks для длительных idle/restore сценариев
  - storage-protection edge-cases
  - cloud sync backup (без auth-overkill).

---

## Обновление (2026-02-21): Context Reset Baseline

### Реализовано

- По запросу пользователя зафиксирована единая reset-точка старта:
  - `docs/progress/current-plan.md`
- Обновлен мастер-лог и README ссылками на новый источник правды по плану.
- Подтверждено текущее состояние ветки:
  - `feat/mvp-core`
  - `HEAD: 2d6442e`
  - MVP-ядро закрыто, в работе только vNext-улучшения.

### Осталось

- Взять следующий high-impact пункт из `docs/progress/current-plan.md` и реализовывать батчами с полной верификацией после каждого шага.

---

## Обновление (2026-02-21): P0/P1 batch #19 - Reliability Hardening

### Реализовано

- Закрыты top-5 приоритетов из Expert Audit v3:
  - `playwright.config.ts`: localhost/proxy hardening (`NO_PROXY/no_proxy` merge + localhost URL)
  - local date-key логика вместо UTC:
    - `src/core/date-keys.ts`
    - `src/core/date-keys.test.ts`
    - интеграция в `src/store/use-app-store.ts` и `src/core/progress-rules.ts`
  - visibility ошибок persistence:
    - убран silent-fail в очереди сохранения store
    - при сбое записи теперь выставляется `uiError`
    - тест: `src/store/use-app-store.test.ts`
  - выровнен PWA update strategy:
    - `vite.config.ts` (`registerType: prompt`)
  - добавлен cross-tab sync + реактивная сеть:
    - `BroadcastChannel` синхронизация состояния
    - `src/ui/HealthBanner.tsx` реагирует на `online/offline`
- Regression:
  - `npm run test:run` PASS (71/71)
  - `npm run build` PASS

### Осталось

- `npm run e2e` нужно перепроверить вне текущего sandbox-окружения:
  - сейчас webServer check падает на `connect EPERM 127.0.0.1:4173` (loopback ограничение окружения).
- Далее vNext/P2:
  - offline stress idle/restore сценарии
  - storage-protection edge cases
  - гипотеза Telegram-канала (без реализации).
