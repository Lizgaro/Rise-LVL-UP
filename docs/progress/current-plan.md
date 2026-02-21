# Rise LVL UP - Current Plan (Reset Baseline)

Date baseline: 2026-02-21  
Repo: `/mnt/c/Users/lizga/Desktop/LVL_UP/.worktrees/mvp-core`  
Branch: `feat/mvp-core`  
HEAD: `2d6442e`

## Сделано

- Завершен полный MVP-цикл (batch #1-#18) с проверками:
  - `npm run e2e` -> PASS (6/6)
  - `npm run test:run` -> PASS (67/67)
  - `npm run build` -> PASS
- Реализованы ключевые блоки продукта:
  - задачи, планы день/неделя, цели, привычки, режим отказа от плохих привычек
  - RPG-прогресс (XP/уровни/мягкие штрафы/recovery-буст)
  - фокус-таймер (countdown, пауза/продолжить, хоткеи, автофазы)
  - voice quick-add с подтверждением
  - white/pink/brown noise через Web Audio
  - ревью дня, бэкап/восстановление JSON
  - PWA install/update flow + mobile-first адаптация
- Документация и аудиты собраны:
  - `docs/progress/2026-02-21-master-log.md`
  - `docs/research/2026-02-22-browser-must-have-audit.md`
  - `docs/progress/2026-02-21-agent-orchestration-log.md`
- Выполнен reliability-hardening batch после Expert Audit v3:
  - e2e localhost/proxy hardening в `playwright.config.ts` (NO_PROXY merge + localhost URL)
  - local date keys вместо UTC в day/week + RPG daily date key
  - persistence queue error visibility (без silent fail)
  - PWA update strategy alignment (`registerType: prompt`)
  - cross-tab sync (`BroadcastChannel`) + reactive network health
- Проверки после batch:
  - `npm run test:run` -> PASS (71/71)
  - `npm run build` -> PASS
  - `npm run e2e` -> PASS (Windows shell, 6/6)
  - Примечание: в текущем sandbox-shell loopback checks могут падать с `EPERM`; браузерный gate подтвержден в Windows shell.

## Осталось (vNext, не блокирует MVP)

1. P2 UX/risk hardening:
   - offline stress edge cases (idle/restore).
   - storage-protection edge cases.
2. Гипотеза Telegram-бота (без реализации):
   - только внешний канал ввода/напоминаний, web остается source-of-truth.

## Следующий рабочий цикл (старт заново)

1. Жесткий аудит в браузере по must-have сценариям (без косметических изменений).
   - Статус: выполнено.
   - Отчет: `docs/research/2026-02-21-expert-critical-audit-v3.md`
2. Приоритизация только high-impact задач (P0/P1) на основе аудита.
   - Статус: выполнено.
3. Реализация по одной задаче с полным regression после каждой:
   - `npm run test:run`
   - `npm run e2e`
   - `npm run build`
   - Статус: batch #19 закрыт (unit/build/e2e подтверждены).
4. После каждого батча обновлять:
   - `docs/progress/current-plan.md`
   - `docs/progress/2026-02-21-master-log.md`
   - `docs/issues/2026-02-21-mvp-progress-issue.md`

## Правило контекст-сброса

Перед новым стартом всегда читать:
1. `docs/progress/current-plan.md`
2. `docs/progress/2026-02-21-master-log.md` (последние update-блоки)
3. `docs/issues/2026-02-21-mvp-progress-issue.md` (реализовано/осталось)
