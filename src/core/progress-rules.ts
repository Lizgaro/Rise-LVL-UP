import { LEVEL_RULES, RECOVERY_RULES, XP_RULES } from "../domain/constants";
import type { DomainEvent, RPGProfile } from "../domain/types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function getNow(event: DomainEvent): number {
  return event.now ?? Date.now();
}

function xpNeedForLevel(level: number): number {
  return LEVEL_RULES.base + LEVEL_RULES.perLevel * (level - 1);
}

function getEventXp(event: DomainEvent): number {
  switch (event.type) {
    case "task_done":
      return XP_RULES.taskDone;
    case "day_priority_done":
      return XP_RULES.dayPriorityDone;
    case "goal_step_done":
      return XP_RULES.goalStepDone;
    case "focus_completed":
      return event.minutes >= XP_RULES.focusMinMinutes
        ? XP_RULES.focusPerMinute * event.minutes
        : 0;
    case "habit_done":
      return XP_RULES.habitDone;
    case "habit_skipped":
      return XP_RULES.habitSkipped;
    case "habit_relapse":
      return XP_RULES.habitRelapse;
    case "task_missed":
      return XP_RULES.taskMissed;
    default:
      return 0;
  }
}

function normalizeProfile(profile: RPGProfile): RPGProfile {
  return {
    ...profile,
    level: Math.max(1, profile.level),
    xpTotal: Math.max(0, profile.xpTotal),
    xpInLevel: Math.max(0, profile.xpInLevel),
    dailyXpEarned: profile.dailyXpEarned ?? 0,
    recoveryBoostActionsRemaining: profile.recoveryBoostActionsRemaining ?? 0,
  };
}

function applyPositiveXp(
  profile: RPGProfile,
  xp: number,
  now: number,
): RPGProfile {
  const dateKey = toDateKey(now);
  const isSameDay = profile.dailyXpDate === dateKey;
  const earnedToday = isSameDay ? profile.dailyXpEarned ?? 0 : 0;
  const cappedXp = Math.max(0, Math.min(xp, XP_RULES.maxDailyXp - earnedToday));

  let level = profile.level;
  let xpInLevel = profile.xpInLevel + cappedXp;

  while (xpInLevel >= xpNeedForLevel(level)) {
    xpInLevel -= xpNeedForLevel(level);
    level += 1;
  }

  return {
    ...profile,
    level,
    xpTotal: profile.xpTotal + cappedXp,
    xpInLevel,
    dailyXpDate: dateKey,
    dailyXpEarned: earnedToday + cappedXp,
  };
}

function canLevelDown(profile: RPGProfile, now: number): boolean {
  if (profile.level <= 1) return false;
  if (!profile.lastLevelDownAt) return true;
  return now - profile.lastLevelDownAt >= ONE_DAY_MS;
}

function applyNegativeXp(
  profile: RPGProfile,
  xp: number,
  event: DomainEvent,
  now: number,
): RPGProfile {
  const next = { ...profile };
  next.xpTotal = Math.max(0, next.xpTotal + xp);
  next.xpInLevel += xp;

  if (next.xpInLevel < 0 && canLevelDown(next, now)) {
    next.level -= 1;
    next.lastLevelDownAt = now;
    next.xpInLevel = Math.max(0, xpNeedForLevel(next.level) + next.xpInLevel);

    if (event.type === "habit_relapse") {
      next.recoveryBoostActionsRemaining = RECOVERY_RULES.bonusActions;
    }
  } else if (next.xpInLevel < 0) {
    next.xpInLevel = 0;
  }

  return next;
}

export function applyEvent(profile: RPGProfile, event: DomainEvent): RPGProfile {
  const safeProfile = normalizeProfile(profile);
  const now = getNow(event);
  const delta = getEventXp(event);

  if (delta > 0) return applyPositiveXp(safeProfile, delta, now);
  if (delta < 0) return applyNegativeXp(safeProfile, delta, event, now);
  return safeProfile;
}
