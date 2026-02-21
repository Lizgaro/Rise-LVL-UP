# Rise LVL UP - Expert Critical Audit v3 (2026-02-21)

## Scope

- Repository: `Rise-LVL-UP`
- Branch: `feat/mvp-core`
- Baseline commit under review: `dd90efb`
- Audit mode: ruthless pre-release review (PM + UX + Behavioral + QA + Architecture)

## Verification evidence

- `npm run test:run` -> PASS (67/67)
- `npm run build` -> PASS
- `npm run e2e` -> FAIL in current shell due webServer readiness/proxy mismatch
  - debug: Playwright probes `http://127.0.0.1:4173/` through proxy (`127.0.0.1:10809`) and receives `EPERM`
  - current env has `HTTP_PROXY/HTTPS_PROXY=http://127.0.0.1:10809` and `NO_PROXY=localhost` (missing `127.0.0.1`)

## Findings (ordered by severity)

### P0

1. `e2e` reliability is currently broken in this environment because localhost checks go through proxy.
   - Evidence: Playwright debug output (`connect EPERM 127.0.0.1:10809`) during webServer availability checks.
   - Impact: browser regression gate is not trustworthy for this environment.
   - Relevant file: `playwright.config.ts:10`

2. Day/week logic is UTC-based, which can misclassify "today" for local users around midnight.
   - Root cause: `toISOString().slice(0, 10)` in day/week keys.
   - Impact: wrong day rollover, wrong `missed` penalties, wrong day plan date.
   - Relevant file: `src/store/use-app-store.ts:107`, `src/store/use-app-store.ts:111`

3. Persistence errors are silently swallowed in queue processing.
   - Root cause: `.catch(() => undefined)` in persistence queue.
   - Impact: UI can show successful changes while IndexedDB writes failed; data disappears after reload.
   - Relevant file: `src/store/use-app-store.ts:416`

### P1

4. Potential conflict between PWA auto-update strategy and manual update UX.
   - Root cause: `registerType: "autoUpdate"` while app exposes explicit "update now" flow.
   - Impact: non-deterministic refresh timing and user-context interruption risk.
   - Relevant file: `vite.config.ts:9`, `src/pwa.ts:40`

5. No cross-tab synchronization strategy.
   - Root cause: no `BroadcastChannel` or storage-event based rehydration.
   - Impact: stale state and last-write-wins conflicts across tabs/windows.
   - Relevant file: `src/store/use-app-store.ts:413`

6. Network readiness shown in health card is not reactive after mount.
   - Root cause: health checks are memoized once and do not subscribe to online/offline events.
   - Impact: stale diagnostics in long sessions.
   - Relevant file: `src/ui/HealthBanner.tsx:20`

7. Timer snapshot writes can happen very frequently.
   - Root cause: `saveTimerSnapshot` called inside `tickTimer` updates.
   - Impact: unnecessary synchronous localStorage pressure and potential UI jitter on weak devices.
   - Relevant file: `src/store/use-app-store.ts:858`

### P2

8. Dashboard complexity remains high in "all" workspace.
   - Impact: cognitive overload and action paralysis for daily flow.
   - Relevant file: `src/ui/AppShell.tsx:144`

9. Voice quick-add is good but still single-shot with strict parser boundaries.
   - Impact: false negatives for natural phrases and noisy microphone conditions.
   - Relevant files: `src/ui/VoiceQuickAdd.tsx:119`, `src/voice/intent-parser.ts`

10. E2E scenarios cover core smoke but still miss durability edge-cases.
    - Impact: hidden regressions in timezone rollover and persistence-failure paths.
    - Relevant file: `e2e/mvp-core.spec.ts:3`

## External expert synthesis (subagents)

- PM expert: confirmed priority on data-safety and core loop clarity over feature expansion.
- UX expert: highlighted dashboard anxiety and recommended stronger action-first IA.
- Behavioral expert: validated recovery-first mechanics and warned against punitive spirals.
- QA expert: prioritized timezone correctness and persistence failure visibility.
- Architecture expert: prioritized persistence robustness and update-flow determinism.

## Must-have priorities for next implementation cycle

1. P0: fix e2e proxy/no-proxy reliability for localhost checks.
2. P0: replace UTC date keys with local date keys for day/week logic.
3. P0: stop swallowing persistence errors; surface and log save failures.
4. P1: align PWA update strategy (manual prompt flow end-to-end).
5. P1: add cross-tab sync and reactive network health updates.

## Anti-goals (do not do now)

- No backend/auth/social features in this cycle.
- No broad redesign; only high-impact reliability and core-loop clarity fixes.
- No low-value cosmetic churn.
