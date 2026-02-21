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

## Agent: GitHub @Jules

Status:
- `Researched, ready to use after GitHub auth`

Notes:
- Installed GitHub CLI (`gh` 2.87.2), but authentication is not configured yet.
- Current blocker: `gh auth status` -> not logged into any GitHub host.
- Confirmed from official Jules docs/changelog:
  - Starting from GitHub issue is done by adding label `jules` (case-insensitive).
  - Jules GitHub App must have access to the repository.
  - After labeling, Jules comments on the issue and later posts PR link.
  - Recent updates (Feb 19, 2026): CI auto-fixing loop and configurable commit authorship.
- Next action when user confirms: run `gh auth login`, create issue template text, add label `jules`, track Jules comment/PR cycle.
