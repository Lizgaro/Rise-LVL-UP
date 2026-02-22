# Jules UI Integration Hotfix (2026-02-22)

## Done

- Integrated Jules dashboard shell into app runtime:
  - `src/ui/DashboardLayout.tsx`
  - `src/ui/Sidebar.tsx`
  - `src/ui/TopBar.tsx`
  - `src/ui/VoiceFooter.tsx`
  - `src/ui/layout.css`
- Refactored `AppShell` to use sidebar tabs and keep existing product logic:
  - day focus, weekly/monthly priority boards, goals/habits, review, settings.
- Moved voice-first interaction into floating footer (Jules-style) while preserving Gemini + local intent fallback:
  - `src/ui/VoiceQuickAdd.tsx` (`dock` variant).
- Updated app entry assets for Jules typography/icons:
  - `index.html` font links.
  - `src/main.tsx` layout css import.
- Updated UI tests to match new shell.
- Synced and merged remote Jules branch state from `origin/feat/mvp-core`.
- Added light/ronin theme switch in settings (`Jules Light` / `Jules Ronin`).
- Disabled Gemini integration in voice routing (forced local parser fallback).

## Verification

- `npm run test:run` -> PASS (85/85)
- `npm run build` -> PASS

## Remaining

- Optional: integrate full standalone Ronin layout variant (separate composition, not only color theme).
