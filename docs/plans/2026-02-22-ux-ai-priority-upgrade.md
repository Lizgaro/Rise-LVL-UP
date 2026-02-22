# UX + Voice AI Priority Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade UX and voice workflow so daily goals become day focus, week/month priorities have separate widgets, notes/goals are editable, and voice input can be AI-routed (Gemini with fallback).

**Architecture:** Extend domain/store with `month` planning and editable notes metadata, split planning UI into separate week/month cards, and add an AI interpretation layer in voice pipeline that outputs normalized structured intents. Keep local parser as hard fallback when AI key/network is unavailable.

**Tech Stack:** React, TypeScript, Zustand, Dexie, Vitest, Playwright, optional Google Gemini HTTP API.

---

### Task 1: Domain + Core Planning Contracts

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/core/planning.ts`
- Modify: `src/core/planning.test.ts`
- Modify: `src/core/task-filters.ts`
- Modify: `src/core/task-filters.test.ts`

**Steps:**
1. Add failing tests for month priorities and `month` task filter.
2. Add `month` to `PlanScope` and create `MonthPlan` type.
3. Add `setMonthPriorities` with sane cap.
4. Update task filter types for `month` view.
5. Re-run targeted tests.

### Task 2: Repository + Store State Extensions

**Files:**
- Modify: `src/storage/db.ts`
- Modify: `src/storage/repository.ts`
- Modify: `src/storage/repository.test.ts`
- Modify: `src/store/use-app-store.ts`
- Modify: `src/store/use-app-store.test.ts`

**Steps:**
1. Add failing tests for persistence of month plan and note/title edits.
2. Add Dexie table for month plans and snapshot loading.
3. Extend store state/actions: `monthPlan`, `setMonthPlan`, `updateTask`, `updateGoal`, optional notes fields.
4. Ensure async persistence queue covers new entities.
5. Re-run repository/store tests.

### Task 3: Daily Goal as Focus + Separate Week/Month Widgets

**Files:**
- Modify: `src/ui/TodayFocusCard.tsx`
- Modify: `src/ui/GoalsCard.tsx`
- Modify: `src/ui/PlansCard.tsx`
- Modify: `src/ui/TaskInboxCard.tsx`
- Modify: `src/ui/AppShell.tsx`
- Modify: `src/styles.css`
- Modify: `src/ui/AppShell.test.tsx`

**Steps:**
1. Add UI tests (or SSR assertions) for week/month separate blocks and editable goal/task controls.
2. Update focus card to show day-goal focus path when relevant.
3. Split planning widget into clearer sections/cards for week and month priorities.
4. Add inline edit UX for goals/tasks/notes.
5. Re-run UI tests.

### Task 4: Voice Intent Model Expansion

**Files:**
- Modify: `src/voice/intent-parser.ts`
- Modify: `src/voice/intent-parser.test.ts`
- Modify: `src/voice/intent-preview.ts`
- Modify: `src/voice/intent-preview.test.ts`

**Steps:**
1. Add failing tests for month routing and completion commands.
2. Expand intent union with `month` scope and complete/update actions.
3. Update local parser and preview rendering.
4. Re-run voice parsing tests.

### Task 5: Google Gemini Voice Routing Layer (Optional Key)

**Files:**
- Create: `src/voice/gemini-intent.ts`
- Create: `src/voice/gemini-intent.test.ts`
- Modify: `src/ui/VoiceQuickAdd.tsx`
- Modify: `README.md`

**Steps:**
1. Add failing tests for AI response parsing + fallback behavior.
2. Implement Gemini client using `VITE_GEMINI_API_KEY` and strict JSON response parsing.
3. Wire VoiceQuickAdd to use AI first, fallback to local parser on failure/unavailable key.
4. Add UX hint about AI mode enabled/disabled.
5. Document env setup in README.

### Task 6: Theme System (Samurai + Alternative Light/Dark)

**Files:**
- Modify: `src/styles.css`
- Modify: `src/ui/AppShell.tsx`
- Add/Modify tests where needed

**Steps:**
1. Add failing tests for theme selector rendering.
2. Introduce theme tokens and 2+ themes (`samurai-light`, alternative light/dark pair).
3. Add theme switcher and persistence in local storage.
4. Verify mobile/desktop readability and contrast.

### Task 7: End-to-End Verification + Critical Fixes

**Files:**
- Modify: `e2e/mvp-core.spec.ts` (if selectors/text changed)
- Modify: `docs/issues/2026-02-22-ux-ai-priority-upgrade.md`
- Modify: `docs/progress/2026-02-21-master-log.md`

**Steps:**
1. Run full unit suite.
2. Run build.
3. Run e2e smoke/core where environment allows.
4. Fix critical/high issues surfaced by tests.
5. Record done/remaining in issue-style log.
