# Rise LVL UP

Личный (single-user) локальный MVP для продуктивности в формате RPG.

## Что уже реализовано

- Одностраничный интерфейс на русском.
- Чек-лист задач и идей.
- Планирование `Сегодня` и `Неделя` (с лимитом 3 приоритета на день).
- Модуль целей.
- Модуль привычек (`done/skipped/relapse`) с recovery-квестом при срыве.
- Фокус-таймер с countdown, авто-переходом `фокус -> перерыв` и восстановлением активной сессии после перезагрузки.
- RPG-движок (XP, уровни, мягкие штрафы).
- Модуль шумов с реальным воспроизведением через Web Audio API (off/white/pink/brown + громкость, по умолчанию выключен).
- Локальное хранилище задач через Dexie/IndexedDB.
- Unit-тесты (Vitest) и e2e-сценарии (Playwright).

## Технологии

- React + TypeScript + Vite
- Zustand
- Dexie (IndexedDB)
- Vitest
- Playwright

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть: `http://127.0.0.1:5173`

## Проверки

```bash
# Unit tests
npm run test:run

# Production build
npm run build

# E2E tests
npx playwright test e2e/mvp-core.spec.ts
```

## Важные заметки по e2e

Для Playwright нужен Chromium:

```bash
npx playwright install chromium
```

Если в Linux-среде не хватает системных библиотек (например `libnspr4.so`), браузерные e2e не стартуют до установки этих зависимостей в ОС.

## Текущий прогресс

- Master log: `docs/progress/2026-02-21-master-log.md`
- Agent orchestration log: `docs/progress/2026-02-21-agent-orchestration-log.md`
- Critical audit + 10/10 checklist: `docs/research/2026-02-21-critical-audit-v2.md`
- Design: `docs/plans/2026-02-21-rise-lvl-up-design.md`
- Implementation plan: `docs/plans/2026-02-21-rise-lvl-up-implementation.md`
