/**
 * Week date helpers for consistent weekly operations
 * Standardizes on Monday 00:00:00 UTC for all weekly tracking
 */

export function startOfIsoWeek(date: Date): Date {
  // Normalize to Monday 00:00:00 UTC
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7; // Sun=0 -> 7
  if (day !== 1) d.setUTCDate(d.getUTCDate() - (day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function asIsoDate(d: Date): string {
  const z = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return z.toISOString().slice(0, 10);
}

export function getCurrentWeekStart(): Date {
  return startOfIsoWeek(new Date());
}

export function getCurrentWeekStartIso(): string {
  return asIsoDate(getCurrentWeekStart());
}

export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + (weeks * 7));
  return result;
}

export function getWeekStartForDate(date: Date): string {
  return asIsoDate(startOfIsoWeek(date));
}
