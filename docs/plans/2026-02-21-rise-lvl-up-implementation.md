# Rise LVL UP MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-screen Russian-language local-first productivity app with checklist, day/week planning, goals, focus timer, habits (including bad-habit recovery), RPG progression, and optional white/pink/brown noise.

**Architecture:** React + TypeScript app with domain-driven event processing (`UI -> Domain Event -> ProgressRules -> Store -> UI`), Zustand state layer, Dexie-backed IndexedDB persistence, and strict TDD for core behavior rules.

**Tech Stack:** Vite, React, TypeScript, Zustand, Dexie, Vitest, Testing Library, Playwright.

---

### Task 1: Bootstrap Project and Test Harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`
- Create: `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`
- Create: `src/App.smoke.test.tsx`, `e2e/smoke.spec.ts`, `playwright.config.ts`

**Step 1: Write failing smoke test**

```tsx
// src/App.smoke.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App smoke", () => {
  it("renders app title in Russian", () => {
    render(<App />);
    expect(screen.getByText("Rise LVL UP")).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.smoke.test.tsx --run`  
Expected: FAIL (`Cannot find module './App'` or missing setup)

**Step 3: Write minimal implementation**

```tsx
// src/App.tsx
export default function App() {
  return <h1>Rise LVL UP</h1>;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.smoke.test.tsx --run`  
Expected: PASS

**Step 5: Commit**

```bash
git add .
git commit -m "chore: bootstrap vite react ts project with test harness"
```

---

### Task 2: Domain Types and Constants (Russian-first MVP)

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/constants.ts`
- Create: `src/domain/constants.test.ts`

**Step 1: Write failing test**

```ts
// src/domain/constants.test.ts
import { describe, it, expect } from "vitest";
import { XP_RULES, TIMER_DEFAULTS } from "./constants";

describe("MVP constants", () => {
  it("has expected timer defaults", () => {
    expect(TIMER_DEFAULTS.focusMinutes).toBe(30);
    expect(TIMER_DEFAULTS.breakMinutes).toBe(5);
  });

  it("has soft penalty profile", () => {
    expect(XP_RULES.taskDone).toBe(25);
    expect(XP_RULES.habitRelapse).toBe(-20);
  });
});
```

**Step 2: Run test and verify fail**

Run: `npm run test -- src/domain/constants.test.ts --run`  
Expected: FAIL (module not found)

**Step 3: Implement minimal constants/types**

```ts
// src/domain/constants.ts
export const TIMER_DEFAULTS = { focusMinutes: 30, breakMinutes: 5 };
export const XP_RULES = {
  taskDone: 25,
  dayPriorityDone: 10,
  goalStepDone: 15,
  focusPerMinute: 1,
  focusMinMinutes: 10,
  habitDone: 35,
  habitSkipped: -8,
  habitRelapse: -20,
  taskMissed: -10,
  maxDailyXp: 1000,
  maxFastCompletionsPerMinute: 5,
  maxLevelDownPer24h: 1,
};
```

**Step 4: Run tests to pass**

Run: `npm run test -- src/domain/constants.test.ts --run`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/domain
git commit -m "feat: add domain constants and core types for mvp"
```

---

### Task 3: Progress Rules Engine (XP, level, penalties, recovery)

**Files:**
- Create: `src/core/progress-rules.ts`
- Create: `src/core/progress-rules.test.ts`
- Modify: `src/domain/types.ts`

**Step 1: Write failing tests for core events**

```ts
// src/core/progress-rules.test.ts
import { describe, it, expect } from "vitest";
import { applyEvent } from "./progress-rules";

describe("ProgressRules", () => {
  it("awards xp for task completion", () => {
    const state = applyEvent({ level: 1, xpInLevel: 0, xpTotal: 0 }, { type: "task_done" });
    expect(state.xpTotal).toBe(25);
  });

  it("limits level-down to once per 24h", () => {
    const base = { level: 2, xpInLevel: 5, xpTotal: 200, lastLevelDownAt: Date.now() };
    const next = applyEvent(base, { type: "habit_relapse", now: Date.now() + 60_000 });
    expect(next.level).toBe(2);
  });
});
```

**Step 2: Run test and verify fail**

Run: `npm run test -- src/core/progress-rules.test.ts --run`  
Expected: FAIL

**Step 3: Implement rules engine**

```ts
// src/core/progress-rules.ts (shape)
export function applyEvent(profile: RPGProfile, event: DomainEvent): RPGProfile {
  // map event -> xp delta, clamp daily xp, enforce one level-down per 24h,
  // create recovery markers when relapse causes level decrease
}
```

**Step 4: Run tests and pass**

Run: `npm run test -- src/core/progress-rules.test.ts --run`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/core src/domain/types.ts
git commit -m "feat: implement progress rules with soft penalties and recovery logic"
```

---

### Task 4: Planning + Goals Domain (Day/Week + goals)

**Files:**
- Create: `src/core/planning.ts`
- Create: `src/core/planning.test.ts`
- Modify: `src/domain/types.ts`

**Step 1: Write failing tests**

```ts
import { describe, it, expect } from "vitest";
import { setDayPriorities } from "./planning";

describe("Planning", () => {
  it("enforces max 3 day priorities", () => {
    expect(() => setDayPriorities(["1", "2", "3", "4"])).toThrow();
  });
});
```

**Step 2: Run test and verify fail**

Run: `npm run test -- src/core/planning.test.ts --run`  
Expected: FAIL

**Step 3: Implement minimal planner functions**

```ts
export function setDayPriorities(taskIds: string[]) {
  if (taskIds.length > 3) throw new Error("Можно выбрать максимум 3 приоритета на день");
  return taskIds;
}
```

**Step 4: Run tests and pass**

Run: `npm run test -- src/core/planning.test.ts --run`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/planning* src/domain/types.ts
git commit -m "feat: add day/week planning and goal domain rules"
```

---

### Task 5: IndexedDB Persistence (Dexie Repository)

**Files:**
- Create: `src/storage/db.ts`
- Create: `src/storage/repository.ts`
- Create: `src/storage/repository.test.ts`

**Step 1: Write failing repository test**

```ts
import { describe, it, expect } from "vitest";
import { saveTask, getTasks } from "./repository";

describe("Repository", () => {
  it("persists and reads tasks", async () => {
    await saveTask({ id: "t1", title: "Тест", status: "todo", type: "task", planScope: "inbox", createdAt: 1 });
    const tasks = await getTasks();
    expect(tasks).toHaveLength(1);
  });
});
```

**Step 2: Run test and verify fail**

Run: `npm run test -- src/storage/repository.test.ts --run`  
Expected: FAIL

**Step 3: Implement Dexie schema and repository**

```ts
// src/storage/db.ts
import Dexie from "dexie";
export class RiseDb extends Dexie { /* tables: tasks, habits, logs, profile, sessions, plans, goals */ }
```

**Step 4: Run tests and pass**

Run: `npm run test -- src/storage/repository.test.ts --run`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/storage
git commit -m "feat: add dexie persistence layer for local-first data"
```

---

### Task 6: Zustand App Store Integration

**Files:**
- Create: `src/store/use-app-store.ts`
- Create: `src/store/use-app-store.test.ts`
- Modify: `src/core/progress-rules.ts`, `src/storage/repository.ts`

**Step 1: Write failing store test**

```ts
import { describe, it, expect } from "vitest";
import { useAppStore } from "./use-app-store";

describe("AppStore", () => {
  it("adds task and applies xp on completion", async () => {
    const id = useAppStore.getState().addTask("Прочитать 10 страниц", "task");
    await useAppStore.getState().toggleTaskDone(id);
    expect(useAppStore.getState().rpg.xpTotal).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test and verify fail**

Run: `npm run test -- src/store/use-app-store.test.ts --run`  
Expected: FAIL

**Step 3: Implement store actions with repository sync**

```ts
// actions: addTask, toggleTaskDone, setDayPlan, setWeekPlan, addGoal, markHabitStatus, startTimer, finishTimer, setNoise
```

**Step 4: Run tests and pass**

Run: `npm run test -- src/store/use-app-store.test.ts --run`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/store src/core/progress-rules.ts src/storage/repository.ts
git commit -m "feat: integrate app store with domain events and persistence"
```

---

### Task 7: Focus Noise Engine (white/pink/brown, default off)

**Files:**
- Create: `src/audio/noise-engine.ts`
- Create: `src/audio/noise-engine.test.ts`

**Step 1: Write failing tests**

```ts
import { describe, it, expect } from "vitest";
import { createNoiseController } from "./noise-engine";

describe("NoiseEngine", () => {
  it("defaults to off", () => {
    const engine = createNoiseController();
    expect(engine.getState().type).toBe("off");
  });
});
```

**Step 2: Run test and verify fail**

Run: `npm run test -- src/audio/noise-engine.test.ts --run`  
Expected: FAIL

**Step 3: Implement engine**

```ts
// WebAudio-based generator with methods: setType, setVolume, start, stop; safe fallback to off on errors
```

**Step 4: Run tests and pass**

Run: `npm run test -- src/audio/noise-engine.test.ts --run`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/audio
git commit -m "feat: add optional focus noise engine with safe fallback"
```

---

### Task 8: One-Screen Russian UI (Minimal)

**Files:**
- Create: `src/ui/AppShell.tsx`
- Create: `src/ui/FocusTimerCard.tsx`
- Create: `src/ui/TaskInboxCard.tsx`
- Create: `src/ui/PlansCard.tsx`
- Create: `src/ui/GoalsCard.tsx`
- Create: `src/ui/HabitsCard.tsx`
- Create: `src/ui/ProgressCard.tsx`
- Create: `src/ui/NoiseCard.tsx`
- Modify: `src/App.tsx`, `src/styles.css`
- Create: `src/ui/AppShell.test.tsx`

**Step 1: Write failing UI test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("Russian UI", () => {
  it("renders core sections in Russian", () => {
    render(<App />);
    expect(screen.getByText("Фокус-таймер")).toBeInTheDocument();
    expect(screen.getByText("Сегодня")).toBeInTheDocument();
    expect(screen.getByText("Неделя")).toBeInTheDocument();
    expect(screen.getByText("Привычки")).toBeInTheDocument();
  });
});
```

**Step 2: Run test and verify fail**

Run: `npm run test -- src/ui/AppShell.test.tsx --run`  
Expected: FAIL

**Step 3: Implement UI components and wire store actions**

```tsx
// src/App.tsx -> <AppShell />
// all visible labels/messages are Russian-only
```

**Step 4: Run tests and pass**

Run: `npm run test -- src/ui/AppShell.test.tsx --run`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/ui src/App.tsx src/styles.css
git commit -m "feat: implement single-screen russian mvp interface"
```

---

### Task 9: End-to-End Scenarios (Browser Verification)

**Files:**
- Create: `e2e/mvp-core.spec.ts`
- Modify: `playwright.config.ts`

**Step 1: Write failing e2e cases**

```ts
// scenarios:
// 1) add task and mark done
// 2) assign day priorities (max 3)
// 3) start and complete focus session
// 4) mark habit relapse and verify recovery quest appears
// 5) toggle noise on/off
```

**Step 2: Run e2e and verify fail**

Run: `npx playwright test e2e/mvp-core.spec.ts`  
Expected: FAIL

**Step 3: Fix integration gaps**

Adjust selectors, state wiring, and fallback handling to satisfy scenarios.

**Step 4: Run full test suite**

Run: `npm run test -- --run && npx playwright test`  
Expected: PASS (unit + e2e)

**Step 5: Commit**

```bash
git add e2e playwright.config.ts
git commit -m "test: add e2e coverage for core productivity flows"
```

---

### Task 10: Documentation, Progress Tracking, and Release Prep

**Files:**
- Modify: `README.md`
- Modify: `docs/progress/2026-02-21-master-log.md`
- Create: `docs/issues/2026-02-21-mvp-progress-issue.md`

**Step 1: Write failing documentation checklist test (manual gate)**

Checklist:
- README contains install/run/test instructions
- README describes day/week/goals/habits/timer/noise/rpg features
- progress log has `Done` and `Remaining`

**Step 2: Run manual gate**

Run: `rg -n "Done|Remaining|npm run dev|Фокус-таймер|Привычки" README.md docs/progress/2026-02-21-master-log.md`  
Expected: all required markers found

**Step 3: Add issue-ready content for GitHub/Jules workflow**

`docs/issues/2026-02-21-mvp-progress-issue.md` must include:
- what is implemented
- what remains
- exact next tasks for Jules if delegated

**Step 4: Final verification**

Run: `npm run test -- --run && npx playwright test && npm run build`  
Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/
git commit -m "docs: finalize readme progress logs and issue handoff notes"
```

---

## Execution Notes

- Work on a dedicated branch/worktree before Task 1 implementation.
- Follow strict TDD: no production code before failing tests.
- Keep UI Russian-only.
- Keep MVP minimal: no auth, no cloud, no voice AI.
