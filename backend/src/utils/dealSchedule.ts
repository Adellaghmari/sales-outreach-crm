import { addDays } from './dateHelpers';

export const DEAL_CLOSE_OFFSETS: Record<number, number> = {
  1: 5,
  2: 12,
  3: 18,
  4: 4,
  5: 28,
  6: 21,
  7: 10,
  8: -8,
  9: -14,
  10: -5,
  11: -12,
  12: -20,
  13: 16,
  14: 35,
  15: 22,
  16: 14,
  17: 40,
  18: 7,
};

export function resolveDealCloseDate(
  id: number,
  stored: string,
  status: string,
): string {
  const offset = DEAL_CLOSE_OFFSETS[id];
  if (offset === undefined) return stored.split('T')[0];
  return addDays(offset);
}

export function resolveDealClosedDate(
  id: number,
  stored: string | null | undefined,
  status: string,
): string | undefined {
  if (status !== 'won' && status !== 'lost') return stored?.split('T')[0];
  const offset = DEAL_CLOSE_OFFSETS[id];
  if (offset === undefined) return stored?.split('T')[0];
  return addDays(offset);
}
