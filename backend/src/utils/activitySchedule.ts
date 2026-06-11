import { addDaysISO } from './dateHelpers';

export const ACTIVITY_DAY_OFFSETS: Record<number, number> = {
  1: 0,
  2: 0,
  3: -1,
  4: -2,
  5: -2,
  6: -5,
  7: -4,
  8: -3,
  9: -6,
  10: -1,
  11: -4,
  12: -3,
  13: -2,
  14: -5,
  15: -3,
};

export function getActivityDayOffset(id: number): number | undefined {
  if (ACTIVITY_DAY_OFFSETS[id] !== undefined) return ACTIVITY_DAY_OFFSETS[id];
  if (id >= 16 && id <= 60) return -((id - 16) % 7);
  return undefined;
}

export function resolveActivityCreatedAt(id: number, stored: string): string {
  const offset = getActivityDayOffset(id);
  if (offset === undefined) return stored;
  return addDaysISO(offset);
}

export function refreshDemoActivityDates(activities: Record<string, unknown>[]) {
  activities.forEach((a) => {
    const id = Number(a.id);
    const offset = getActivityDayOffset(id);
    if (offset !== undefined) {
      a.created_day_offset = offset;
      a.created_at = addDaysISO(offset);
    }
  });
}

export function sortActivitiesByRecent<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
