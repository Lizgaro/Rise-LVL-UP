# External Agent Orchestration Log (2026-02-21)

## Purpose
Track all instructions given to external assistants (Gemini/Jules/etc) and the returned outcomes.

## Agent: Gemini CLI

### Task A - RPG Economy and Penalties

Instruction sent:
`You are agent A (game economy designer). Context: Build a minimalist productivity app with checklist, configurable focus timer, RPG progression, habit mode, bad-habit recovery mode. Constraints: avoid punishment spirals, include fair level-down on misses, include comeback mechanics. Return markdown with: 1) XP events table (event->xp), 2) Level curve formula, 3) Penalty rules (missed task, broken commitment, relapse), 4) Anti-exploit rules, 5) Example 7-day progression. Keep under 500 words.`

Key outputs:
- Suggested XP event table with differentiated rewards for tasks, focus minutes, habits, and abstinence days.
- Proposed soft-fall penalty model with max one level loss per day.
- Added comeback boost ("Rally") after lapse/level-down.
- Added anti-exploit rules: minimum focus duration, task completion velocity limit, daily XP cap.

Adoption status:
- `Partially accepted` (good structure, but numbers will be recalibrated using our evidence constraints).

### Task B - Habit UX + Bad-Habit UX

Instruction sent:
`You are agent B (behavior design + UX). Context: same product. Create a minimal UX flow for two modes: 1) Build good habits, 2) Reduce bad habits (e.g., smoking). Requirements: one-screen core loop, optional details, relapse-safe flow, daily check-in in under 60 seconds. Return markdown with: user journey, states, key components, notification logic, and 10 acceptance criteria.`

Key outputs:
- One-screen quick loop for both positive-habit and reduction modes.
- Relapse-safe flow (log slip without total progress wipe).
- Notification logic with anti-guilt tone.
- Accessibility-oriented acceptance criteria (few taps, one-thumb zone).

Adoption status:
- `Mostly accepted` (aligned with user request for minimal UI and resilient progress model).

### Task C - AI Prompt + Safety Architecture

Instruction sent:
`You are agent C (LLM product architect). Context: same app with AI coach. Design prompt architecture and safety plan inspired by OpenAI best practices: system prompts, tool schemas, memory boundaries, evals, moderation, refusal policy for medical-risk advice. Return markdown with: prompt stack, tool-calling contract, eval matrix (at least 12 test cases), and rollout strategy.`

Key outputs:
- Tiered prompt stack idea (core identity + mode context + user memory).
- Tool-calling contract concept.
- 12-case eval matrix including prompt injection and medical-risk refusal tests.
- Rollout phases: shadow mode -> red-team -> beta -> full launch.

Adoption status:
- `Partially accepted` (structure is strong, but tool schemas and refusal policy will be normalized to our real app contracts).

### Task D - Minimal Russian UI Sections and Stable E2E Selectors

Instruction sent:
`Ты UI-архитектор. Нужен минималистичный одностраничный интерфейс для productivity MVP на русском. Дай кратко: 1) список секций, 2) обязательные русские label'ы, 3) data-testid для e2e (по 1-2 на секцию), 4) 8 ключевых пользовательских сценариев. Формат: markdown, максимум 220 слов.`

Key outputs:
- Suggested compact one-screen sections.
- Suggested Russian labels for progress/tasks/noise blocks.
- Suggested `data-testid` naming for deterministic e2e tests.
- Suggested core user scenarios for MVP.

Adoption status:
- `Partially accepted` (test-id naming and scenario set used as input for Task 8 UI and e2e coverage).

### Task E - Ruthless Product Critique for Current MVP

Instruction sent:
`Ты выступаешь как безжалостный product-аудитор. Контекст: локальный single-user productivity MVP (React + Zustand + Dexie) с карточками: таймер, задачи, планы, цели, привычки, RPG, шум. Факты: нет voice input, таймер без countdown/автоперехода фаз, шум state-only без реального аудио, persistence фактически только tasks, интерфейс слишком плоский и не мотивирует. Выдай: 1) Топ-15 критических провалов, 2) Приоритеты P0/P1/P2, 3) анти-паттерны, 4) критерии 10/10. Коротко и жестко, русский язык.`

Key outputs:
- Подтверждено, что текущая версия выглядит как "фасад без функционального ядра" по критичным блокам (таймер/шум/persistence).
- Даны жесткие P0/P1/P2 приоритеты и anti-patterns для устранения.
- Сформулированы критерии качества уровня 10/10.

Adoption status:
- `Partially accepted` (тон смягчен, технические пункты и приоритеты приняты и перенесены в критический чек-лист).

### Task F - Voice Input Architecture (Speech -> Task/Goal/Habit)

Instruction sent:
`Ты системный архитектор голосовых интерфейсов. Нужен модуль: пользователь говорит фразу, система распознает и автоматически кладет в правильную сущность (задача/цель/привычка/дневной план/недельный план). Ограничения: локальный MVP, без логина, русский UI, безопасность браузера, graceful fallback. Выдай: 1) архитектуру модулей, 2) NLU-правила intent/entity, 3) UX-флоу с ошибками распознавания, 4) план внедрения по этапам с рисками. Формат: markdown, русский, максимально практично.`

Key outputs:
- Предложена рабочая модульная схема: VoiceCapture -> NLU -> Dispatcher -> Feedback.
- Даны стартовые intent/entity правила для русского языка.
- Добавлен UX-флоу подтверждения при низкой confidence и fallback на текстовый ввод.
- Дано пошаговое внедрение с рисками.

Adoption status:
- `Accepted as baseline` (подходит как каркас для P0 voice-roadmap).

### Task G - Focused UX Micro-Audit After Pulse/Polish Iteration

Instruction sent:
`Ты продуктовый критик. Контекст: личный локальный трекер продуктивности (русский UI): задачи/цели/привычки/pomodoro/RPG/voice/noise. Уже есть: hero-блок, pulse-card, weekly summary, recovery quest. Дай 8 конкретных улучшений UX для минималистичного интерфейса, каждое в формате: [Проблема] [Решение] [Как измерить эффект]. Без воды.`

Key outputs:
- Предложен `Zen mode` для режима активного фокуса с минимизацией отвлекающих блоков.
- Предложено подтверждение голосового ввода через preview-чипы перед сохранением.
- Рекомендован command-palette поток для быстрых действий опытного пользователя.
- Даны метрики оценки эффекта (time-to-action, manual corrections rate, session length).

Adoption status:
- `Partially accepted` (используется как вход в следующий P1/P2 backlog; элементы, выходящие за MVP, отложены).

### Task H - Russian Microcopy for Voice Confirm + Health Warnings

Instruction sent:
`Ты UX-редактор для русского productivity MVP. Нужны короткие тексты (до 7 слов) для: 1) заголовок voice-preview, 2) confirm button, 3) cancel button, 4) warning для микрофона, 5) warning для IndexedDB. Дай по 3 варианта и отметь лучший.`

Key outputs:
- Даны короткие варианты microcopy для voice-preview и кнопок confirm/cancel.
- Даны предупреждения для микрофона и IndexedDB с нейтральным тоном.
- Рекомендован лучший вариант для каждого пункта.

Adoption status:
- `Partially accepted` (использованы как ориентир формулировок для текущего P1/P2 шага).

### Task I - Next Features/Tools + Telegram Bot Hypothesis Review

Instruction sent:
`Контекст: личный productivity MVP (локальный web app, русский UI, задачи/планы/цели/привычки/pomodoro/RPG/voice/noise). Дай: 1) топ-15 полезных фич на следующий этап, 2) топ-10 инструментов/интеграций, 3) честную оценку гипотезы Telegram-бота как интерфейса (плюсы/минусы/риски/миграционная стратегия без реализации сейчас). Формат: короткие буллеты, практично.`

Key outputs:
- Сформирован список next-step фич (guided planning, command palette, quest lines, habit heatmap и т.д.).
- Даны практичные инструменты/интеграции (Dexie, Framer Motion, date libs, PWA plugin, accessibility stack).
- Для Telegram предложен hybrid-подход:
  - бот как канал ввода/уведомлений
  - web-приложение как основной интерфейс и source of truth
  - риски privacy/UX-fragmentation явно отмечены.

Adoption status:
- `Accepted as planning input` (используется для следующего брейншторм-блока и roadmap-приоритизации).

### Task J - Refined Feature/Tool/Telegram Hypothesis Pass

Instruction sent:
`Контекст: личный productivity MVP (локальный web app, русский UI, задачи/планы/цели/привычки/pomodoro/RPG/voice/noise). Дай: 1) топ-15 полезных фич на следующий этап, 2) топ-10 инструментов/интеграций, 3) честную оценку гипотезы Telegram-бота как интерфейса (плюсы/минусы/риски/миграционная стратегия без реализации сейчас). Формат: короткие буллеты, практично.`

Key outputs:
- Повторно подтверждена полезность hybrid-модели Telegram (бот как канал ввода/напоминаний, web как основной UX).
- Уточнены practical next-step фичи и инструменты для roadmap (command palette, шаблоны, heatmap, PWA и др.).
- Отмечены ключевые риски: privacy и UX fragmentation при переносе основного сценария в чат.

Adoption status:
- `Accepted as hypothesis input` (используется в следующем брейншторме и приоритизации бэклога).

### Task K - Final Ruthless MVP Quality Pass

Instruction sent:
`Ты внешний продуктовый и UX-аудитор. Контекст: локальный single-user MVP Rise LVL UP (русский UI), реализовано: задачи/планы/цели/привычки/recovery, countdown pomodoro с паузой и хоткеями, шумы white/pink/brown, voice quick-add с confirm, RPG XP+штрафы, end-of-day review, focus mode, backup export/import, unit+e2e тесты. Дай: 1) оценка из 10, 2) топ-7 критичных оставшихся рисков (только реально важные), 3) топ-7 улучшений vNext, 4) что НЕ нужно делать сейчас, чтобы не перегрузить MVP. Формат кратко, по-русски.`

Key outputs:
- Оценка текущего состояния: `8.5/10`.
- Подсвечены ключевые риски MVP:
  - перегруз карточками на одном экране
  - local-only риск потери данных
  - риск демотивации при слишком жестких штрафах
  - ограничения русского voice parsing
  - слабый onboarding/retention контур
- Предложен вектор vNext:
  - PWA + mobile-first
  - lightweight sync для backup
  - richer progress visualization и уведомления
- Явно рекомендовано НЕ делать сейчас:
  - мультиплеер/социалку
  - полноценный backend/auth
  - монетизацию и сложную экономику.

Adoption status:
- `Accepted as final checkpoint input` (используется как вход в next-iteration planning, не блокирует закрытие MVP-core).

## Agent: GitHub @Jules

Status:
- `Activated`

Notes:
- GitHub CLI authenticated successfully for account `Lizgaro`.
- Created missing repository label: `jules`.
- Created issue with implementation status and remaining tasks:
  - `https://github.com/Lizgaro/Rise-LVL-UP/issues/1`
- Applied `jules` label on issue creation to trigger Jules workflow.
- Reviewed Jules artifacts:
  - inspected issue `#1` comments and linked PR `#2`
  - fetched PR branch for comparison with `feat/mvp-core`
  - PR changes are stale and superseded by current implementation
- Current action: keep issue thread as async feedback channel, no merge from PR #2 required.

### Task L - Principal PM Pre-Release Ruthless Audit

Instruction sent:
`Ты Principal Product Manager. Контекст: локальный single-user productivity app Rise LVL UP (задачи/планы/цели/привычки/recovery/pomodoro/noise/voice/RPG). Текущее состояние: все тесты зелёные, есть минималистичный UI на русском, focus mode, backup export/import. Задача: дать ruthless audit как для pre-release. Формат: 1) топ-10 must-have улучшений (без косметики), 2) MoSCoW приоритизация (MUST/SHOULD/COULD), 3) критерии приёмки для каждого MUST, 4) анти-цели (что не делать). Добавь лучшие практики аналогичных продуктов (Todoist, TickTick, Sunsama, Habitica, Streaks). Кратко и практично.`

Key outputs:
- Подсвечены high-impact приоритеты: core loop, burnout protection, IA-фокус, data safety.
- Даны MoSCoW-акценты с анти-целями против scope creep.
- Подтверждено, что основная ценность — "focus loop", а не расширение в сложную экосистему.

Adoption status:
- `Partially accepted` (взяты только элементы, которые можно внедрить без раздувания MVP).

### Task M - Senior UX Cognitive Load Audit

Instruction sent:
`Ты Senior UX Research + UX Writer. Контекст тот же. Проведи UX-аудит одной страницы с множеством карточек. Выдай: 1) 7 главных UX-рисков для когнитивной нагрузки, 2) 7 точечных решений с максимальным impact (без редизайна ради редизайна), 3) рекомендуемая IA (порядок блоков и progressive disclosure), 4) русские microcopy-паттерны для мотивации без токсичности. Укажи практики аналогов (Sunsama, Todoist, Habitica).`

Key outputs:
- Подтвержден риск `dashboard anxiety` и смешения режимов `plan/do/review`.
- Рекомендован явный mode-switch экрана и progressive disclosure.
- Даны нетоксичные microcopy-паттерны поддержки после провалов.

Adoption status:
- `Accepted` (использовано для реализации рабочих экранов и дефолта на фокус-режим).

### Task N - Behavioral Recovery and Relapse Protocol Audit

Instruction sent:
`Ты Behavioral Scientist (habits, relapse, motivation). Контекст: продуктивность + RPG + штрафы. Дай строгий аудит: 1) какие механики могут демотивировать и почему, 2) must-have guardrails чтобы не сорвать пользователя после провала, 3) лучший протокол 'срыв/пропуск' (24ч/72ч), 4) 5 метрик поведения для оценки retention. Формат — actionable правила для реализации в коде.`

Key outputs:
- Подтвержден риск демотивации при штрафах без recovery-моста.
- Рекомендован `supportive comeback loop` вместо жесткого наказания.
- Предложены guardrails и метрики восстановления после срыва.

Adoption status:
- `Accepted` (реализован recovery XP-буст и consumption logic для первых действий после relapse).

### Task O - Staff QA/Reliability Production Readiness Audit

Instruction sent:
`Ты Staff QA + Reliability Engineer. Контекст: React+Zustand+Dexie+Playwright app. Нужен production-readiness audit. Выдай: 1) 10 главных технических рисков (данные/браузеры/перф/доступность/тестирование), 2) must-have fixes перед активным ежедневным использованием, 3) тест-стратегия regression suite (unit+integration+e2e), 4) какие проверки добавить в CI в первую очередь. Без воды, только high-impact.`

Key outputs:
- Подсвечены риски local-first и гидратации состояния.
- Подтверждена критичность стабильного e2e и явной bootstrap-загрузки.
- Даны рекомендации по очередности CI проверок и regression-гейтам.

Adoption status:
- `Partially accepted` (в этой итерации внедрен bootstrap safety и сохранен full regression gate; CI/persistent-storage вынесены в vNext).
