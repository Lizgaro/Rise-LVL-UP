# Audit of Previous Project (`RISE-lvl-AP-MVP`) - 2026-02-21

## Goal
Extract what should be reused and what should be avoided in the new `Rise-LVL-UP` implementation.

## What Is Worth Reusing

1. State segmentation by domain with persisted Zustand stores.
   - `lib/store/tasks.ts:24`
   - `lib/store/rpg.ts:17`
   - `lib/store/theme.ts:12`

2. Typed inbound event parsing for live AI responses.
   - `lib/live/protocol.ts:21`

3. Basic automated testing scaffolding (Vitest + Playwright) already exists and can be ported as approach.
   - `package.json`
   - `e2e/rise.spec.ts:1`
   - `hooks/use-gemini-live.test.ts:2`

## Critical Gaps (Do Not Copy As-Is)

1. Timer is static placeholder, not an actual focus engine.
   - `app/components/zen/ZenDashboard.tsx:37` (`04:00` hardcoded)

2. Tasks and RPG progression are weakly integrated.
   - Task toggle only flips completion state:
     - `app/components/zen/TaskList.tsx` (toggle path)
     - `lib/store/tasks.ts:44`
   - XP is only increased via manual `addXP` calls, mostly voice/tool path:
     - `lib/store/rpg.ts:31`
     - `hooks/use-gemini-live.ts:122`

3. Potential test/spec mismatch in voice hook:
   - Test expects duplicate tool-call dedup:
     - `hooks/use-gemini-live.test.ts:179`
   - Runtime code has no processed-call-id guard:
     - `hooks/use-gemini-live.ts:97`

4. Security boundary issue for client API key use.
   - Public env key in browser-side hook:
     - `hooks/use-gemini-live.ts:27`

5. ID generation is collision-prone at scale.
   - `Math.random().toString(36).substr(2, 5)`:
     - `lib/store/tasks.ts:33`

6. RPG math comments/intent and actual formula are inconsistent.
   - Constants suggest one curve:
     - `lib/rpg/math.ts:16`
   - Actual level formula is different:
     - `lib/rpg/math.ts:38`

7. README overstates/obscures implementation status for core loops.
   - Claimed timer/RPG integration vs actual placeholder path:
     - `README.md:6`
     - `README.md:9`

## Migration Decisions

### Carry Forward
- Store modularization pattern.
- Typed event parsing style.
- Testing culture (unit + e2e).

### Redesign From Scratch
- Focus timer engine.
- Habit mode + bad-habit recovery mode.
- XP/level economy and penalty/recovery model.
- AI integration boundaries and prompt architecture.
- Minimal UI information architecture.

## Architectural Conclusion
The previous project is a strong prototype shell (visual identity + basic state), but not a robust behavior engine.  
For the new repository, we should keep the modular structure discipline and rebuild the core behavior loops with explicit product rules, evidence-backed mechanics, and stricter testing around state transitions.
