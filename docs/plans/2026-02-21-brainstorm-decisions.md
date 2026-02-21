# Brainstorm Decisions - 2026-02-21

## Decision 1: MVP Scope

- User choice: `1` (`Core-first`)

Included in MVP v1:
- checklist for tasks/ideas
- configurable focus timer
- RPG XP/level progression
- good-habit mode
- bad-habit recovery mode with fair penalties
- focus sounds (white/pink/brown/silence)

Deferred after MVP:
- advanced AI automation and voice-first flows

## Decision 2: Data and Auth Model

- User choice: `1` (`Web-only + local first`)

Hard constraints:
- no user accounts
- no login/password flows
- single-user local usage only

## Decision 3: Penalty Strictness

- User choice: `1` (`Soft and fair`)

MVP rules:
- small XP loss for missed tasks
- serious lapse can trigger level down, but at most 1 level per 24h
- recovery quest available after lapse for faster comeback

## Decision 4: Main Screen Architecture

- User choice: `1` (`Single main screen`)

MVP UI structure:
- top: focus timer
- center: checklist (tasks + ideas)
- bottom: RPG + habit + focus sound sections

## Decision 5: Focus Noise Defaults

- User choice: `1` (`Default off, user-controlled`)

MVP audio rules:
- default state: sound off
- user manually toggles white/pink/brown noise
- user controls volume and on/off per session

## Decision 6: Focus Timer Defaults

- User choice: `1` (`30/5 default + custom durations`)

MVP timer rules:
- default cycle: 30 min focus + 5 min break
- user can set any custom focus and break durations

## Decision 7: Habit Logging Granularity

- User choice: `1` (`Quick format`)

MVP habit log rules:
- daily status per habit: `done / skipped / relapse`
- optional short note for reason/context

## Decision 8: Language and UX Localization

- User choice: `Russian-only interface`

MVP localization rules:
- all UI labels and texts in Russian
- onboarding, settings, hints, errors and notifications in Russian

## Decision 9: Remaining Choice Policy

- User choice: `Use option 1 (Recommended) for all remaining product choices`

Working policy:
- unless user overrides, unresolved architecture/UX forks default to recommended option 1

## Decision 10: Planning Horizons and Goals

- User request: daily plans, weekly plans, and goals must be included
- Applied choice policy: recommended minimal implementation

MVP planning rules:
- one inbox for all ideas/tasks
- two lightweight planning horizons: `День` and `Неделя`
- simple goals module linked to tasks/plans
- keep UI minimal and very clear (no heavy dashboards in MVP)
