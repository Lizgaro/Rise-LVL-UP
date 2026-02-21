const MS_IN_MINUTE = 60_000;

function clampOffsetMinutes(offsetMinutes: number): number {
  if (!Number.isFinite(offsetMinutes)) return 0;
  return Math.trunc(offsetMinutes);
}

function shiftToOffset(now: number, offsetMinutes: number): Date {
  return new Date(now - clampOffsetMinutes(offsetMinutes) * MS_IN_MINUTE);
}

export function getDateKeyAtOffset(now: number, offsetMinutes: number): string {
  return shiftToOffset(now, offsetMinutes).toISOString().slice(0, 10);
}

export function getWeekStartKeyAtOffset(now: number, offsetMinutes: number): string {
  const shifted = shiftToOffset(now, offsetMinutes);
  const day = shifted.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  shifted.setUTCDate(shifted.getUTCDate() + diffToMonday);
  return shifted.toISOString().slice(0, 10);
}

export function getLocalDateKey(now: number = Date.now()): string {
  const offsetMinutes = new Date(now).getTimezoneOffset();
  return getDateKeyAtOffset(now, offsetMinutes);
}

export function getLocalWeekStartKey(now: number = Date.now()): string {
  const offsetMinutes = new Date(now).getTimezoneOffset();
  return getWeekStartKeyAtOffset(now, offsetMinutes);
}
