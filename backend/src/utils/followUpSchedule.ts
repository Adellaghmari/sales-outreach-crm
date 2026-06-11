import { addDays, daysFromToday, followUpStatus } from './dateHelpers';

export interface FollowUpSeed {
  id: number;
  lead_id: number;
  deal_id: number | null;
  due_day_offset: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed?: boolean;
  reason: string;
  recommended_action: string;
}

export const followUpSeeds: FollowUpSeed[] = [
  { id: 1, lead_id: 1, deal_id: 1, due_day_offset: 0, priority: 'urgent', reason: 'Confirm negotiation timeline before close', recommended_action: 'Call before expected close date' },
  { id: 2, lead_id: 2, deal_id: 2, due_day_offset: 0, priority: 'high', reason: 'Proposal review follow up', recommended_action: 'Create proposal follow up' },
  { id: 3, lead_id: 7, deal_id: 6, due_day_offset: -1, priority: 'high', reason: 'No response after first follow up', recommended_action: 'Send second follow up' },
  { id: 4, lead_id: 4, deal_id: 4, due_day_offset: 0, priority: 'urgent', reason: 'Final commercial terms before close', recommended_action: 'Ask about pricing and timeline' },
  { id: 5, lead_id: 8, deal_id: 7, due_day_offset: 2, priority: 'medium', reason: 'Schedule technical review call', recommended_action: 'Schedule discovery call' },
  { id: 6, lead_id: 19, deal_id: 6, due_day_offset: -3, priority: 'urgent', reason: 'Regional stakeholder has not replied', recommended_action: 'Follow up after no response' },
  { id: 7, lead_id: 11, deal_id: 13, due_day_offset: 0, priority: 'high', reason: 'Warm reply waiting for meeting slot', recommended_action: 'Schedule discovery call' },
  { id: 8, lead_id: 13, deal_id: null, due_day_offset: 5, priority: 'low', reason: 'Send first outreach email', recommended_action: 'Send first outreach email' },
  { id: 9, lead_id: 5, deal_id: 10, due_day_offset: -8, priority: 'low', completed: true, reason: 'Onboarding handoff completed', recommended_action: 'Hand off to account management' },
  { id: 10, lead_id: 16, deal_id: 18, due_day_offset: 4, priority: 'medium', reason: 'Product expansion proposal check in', recommended_action: 'Create proposal follow up' },
  { id: 11, lead_id: 3, deal_id: 3, due_day_offset: -2, priority: 'high', reason: 'Overdue follow up on active deal', recommended_action: 'Follow up after no response' },
  { id: 12, lead_id: 6, deal_id: 5, due_day_offset: -1, priority: 'medium', reason: 'Overdue follow up on active deal', recommended_action: 'Follow up after no response' },
  { id: 13, lead_id: 9, deal_id: 8, due_day_offset: 0, priority: 'medium', reason: 'Scheduled pipeline check in', recommended_action: 'Follow up after no response' },
  { id: 14, lead_id: 10, deal_id: 9, due_day_offset: 3, priority: 'high', reason: 'Scheduled pipeline check in', recommended_action: 'Follow up after no response' },
  { id: 15, lead_id: 12, deal_id: 14, due_day_offset: 4, priority: 'medium', reason: 'Scheduled pipeline check in', recommended_action: 'Follow up after no response' },
  { id: 16, lead_id: 14, deal_id: null, due_day_offset: 6, priority: 'low', reason: 'Scheduled pipeline check in', recommended_action: 'Follow up after no response' },
  { id: 17, lead_id: 15, deal_id: null, due_day_offset: 2, priority: 'urgent', reason: 'Scheduled pipeline check in', recommended_action: 'Follow up after no response' },
  { id: 18, lead_id: 17, deal_id: 4, due_day_offset: -5, priority: 'medium', completed: true, reason: 'Follow up completed after reply', recommended_action: 'Follow up after no response' },
  { id: 19, lead_id: 18, deal_id: null, due_day_offset: -10, priority: 'low', completed: true, reason: 'Initial outreach follow up done', recommended_action: 'Send first outreach email' },
  { id: 20, lead_id: 20, deal_id: null, due_day_offset: -7, priority: 'high', completed: true, reason: 'Proposal follow up completed', recommended_action: 'Create proposal follow up' },
  { id: 21, lead_id: 21, deal_id: 8, due_day_offset: -3, priority: 'high', reason: 'Overdue follow up on active deal', recommended_action: 'Follow up after no response' },
  { id: 22, lead_id: 22, deal_id: 13, due_day_offset: 0, priority: 'medium', reason: 'Scheduled pipeline check in', recommended_action: 'Follow up after no response' },
  { id: 23, lead_id: 23, deal_id: null, due_day_offset: 5, priority: 'medium', reason: 'Scheduled pipeline check in', recommended_action: 'Follow up after no response' },
  { id: 24, lead_id: 24, deal_id: 14, due_day_offset: 3, priority: 'low', reason: 'Scheduled pipeline check in', recommended_action: 'Follow up after no response' },
  { id: 25, lead_id: 25, deal_id: 15, due_day_offset: -2, priority: 'urgent', reason: 'Overdue follow up on active deal', recommended_action: 'Follow up after no response' },
];

const seedById = new Map(followUpSeeds.map((s) => [s.id, s]));

const pinnedFollowUpIds = new Set<number>();

export function pinFollowUpDate(id: number) {
  pinnedFollowUpIds.add(id);
}

export function getFollowUpSeed(id: number): FollowUpSeed | undefined {
  return seedById.get(id);
}

export function resolveFollowUpDates(
  id: number,
  stored: { due_date: string; status: string },
  options?: { due_day_offset?: number; completed?: boolean; useStored?: boolean },
): { due_date: string; status: string } {
  if (options?.useStored || pinnedFollowUpIds.has(id)) {
    const status = stored.status === 'completed'
      ? 'completed'
      : followUpStatus(stored.due_date, stored.status);
    return { due_date: stored.due_date, status };
  }

  const seed = seedById.get(id);
  const offset = options?.due_day_offset ?? seed?.due_day_offset;
  const completed = options?.completed ?? seed?.completed;

  if (offset === undefined) {
    const status = stored.status === 'completed'
      ? 'completed'
      : followUpStatus(stored.due_date, stored.status);
    return { due_date: stored.due_date, status };
  }

  const due_date = addDays(offset);
  const status = completed ? 'completed' : followUpStatus(due_date, 'pending');
  return { due_date, status };
}

export function refreshDemoFollowUpDates(followUps: Record<string, unknown>[]) {
  followUps.forEach((f) => {
    const useStored = Boolean(f.user_modified);

    if (!useStored && typeof f.due_day_offset === 'number') {
      f.due_date = addDays(f.due_day_offset);
    }

    if (f.is_completed || f.status === 'completed') {
      f.status = 'completed';
      return;
    }

    f.status = followUpStatus(String(f.due_date), 'pending');
  });
}

interface LeadLike {
  id: number;
  first_name: string;
  last_name: string;
  owner: string;
  company_name: string;
}

interface DealLike {
  id: number;
  lead_id: number;
  title: string;
}

export function buildDemoFollowUp(
  seed: FollowUpSeed,
  leads: LeadLike[],
  deals: DealLike[],
): Record<string, unknown> {
  const lead = leads.find((l) => l.id === seed.lead_id)!;
  const deal = seed.deal_id ? deals.find((d) => d.id === seed.deal_id) : null;
  const due_date = addDays(seed.due_day_offset);
  const status = seed.completed ? 'completed' : followUpStatus(due_date, 'pending');

  return {
    id: seed.id,
    lead_id: seed.lead_id,
    deal_id: seed.deal_id,
    due_day_offset: seed.due_day_offset,
    due_date,
    priority: seed.priority,
    status,
    is_completed: seed.completed ?? false,
    reason: seed.reason,
    first_name: lead.first_name,
    last_name: lead.last_name,
    owner: lead.owner,
    company_name: lead.company_name,
    deal_title: deal?.title ?? null,
    recommended_action: seed.recommended_action,
  };
}

export function groupFollowUps<T extends { due_date: string; status: string }>(items: T[]) {
  const today = addDays(0);
  const weekEnd = addDays(7);

  return {
    all: items,
    dueToday: items.filter((f) => String(f.due_date) === today && f.status !== 'completed'),
    overdue: items.filter((f) => f.status === 'overdue'),
    thisWeek: items.filter((f) => String(f.due_date) > today && String(f.due_date) <= weekEnd && f.status === 'pending'),
    completed: items.filter((f) => f.status === 'completed'),
  };
}

export function countFollowUpStats<T extends { due_date: string; status: string }>(items: T[]) {
  const today = addDays(0);
  const overdue = items.filter((f) => f.status === 'overdue').length;
  const dueToday = items.filter((f) => String(f.due_date) === today && f.status !== 'completed').length;
  return { overdue, dueToday, followUpPressure: overdue + dueToday };
}

export function offsetFromDueDate(dueDate: string): number {
  return daysFromToday(dueDate);
}
