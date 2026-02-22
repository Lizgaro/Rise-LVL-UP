# UX + Voice AI Priority Upgrade (Progress Issue)

Date: 2026-02-22
Status: In Progress (logic/features done, final integration polish pending)

## Done
- Added month planning model and persistence:
  - `PlanScope` now includes `month`.
  - Added `MonthPlan` with Dexie/repository persistence.
  - Added `setMonthPriorities` constraints and tests.
- Added editable notes/titles in state layer:
  - `Task.note`, `Goal.note`.
  - `updateTask` and `updateGoal` actions in store.
- Upgraded voice intent model:
  - month scope routing in local parser.
  - completion command intent (`complete_task`).
  - preview support for new intents.
- Added optional Google Gemini voice resolver with strict fallback:
  - `resolveVoiceIntentWithGemini`.
  - Uses `VITE_GEMINI_API_KEY` when present.
  - Falls back to local parser on missing key/error/malformed payload.
- Updated UI behavior (non-design logic):
  - Daily focus now prioritizes active day goal (`scope=day`) over day task list.
  - Added separate week/month priorities widget (`PriorityBoardsCard`).
  - Day priorities kept as focused widget (`PlansCard`).
  - Added task month scope controls and inline edit for task title/note.
  - Added goal scope selection (day/week/month/custom) and inline edit.
  - Voice complete-task command marks matching task done.
- Integrated Jules design branches in safe mode (no logic rollback):
  - source branches:
    - `origin/feat-ui-redesign-7440546874585167038`
    - `origin/design-reference-ronin-desktop-11777830252074829453`
  - integrated parts:
    - white/ronin visual tokens mapped into theme system
    - in-app theme switch (`Core Light`, `Jules White`, `Jules Ronin Dark`)
    - compatible accessibility/test-id improvements
  - skipped parts:
    - full shell/layout replacement from design branches (would break current behavior contracts)
- Added/updated tests for all above:
  - planning/task-filters/date-keys/focus-target
  - repository/store
  - voice parser/preview/gemini-intent

## Verification Evidence
- `npm run test:run` -> PASS (85/85)
- `npm run build` -> PASS (vite build complete)
- `npm run e2e` -> FAIL in current sandbox due environment loopback restriction:
  - `connect EPERM 127.0.0.1:4173`
  - Playwright cannot probe webServer URL in this restricted shell.

## Remaining
- Re-run e2e in unrestricted shell (Windows host or environment with loopback access).
- Final merge pass with Jules visual updates (white/black) after delivery.
- Optional: improve semantic task matching for voice complete command (fuzzy matching).
