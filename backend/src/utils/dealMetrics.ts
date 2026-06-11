import { daysFromToday } from './dateHelpers';

export interface DealLike {
  status: string;
  stage: string;
  value: number;
  probability: number;
  expected_close_date?: string | null;
  days_to_close?: number | null;
  risk_badge?: string | null;
}

export interface LeadLike {
  id: number;
  first_name: string;
  last_name: string;
  score: number;
  status: string;
  company_name?: string;
}

export interface OutreachLike {
  lead_id: number;
  status: string;
}

function dealDaysToClose(deal: DealLike): number | null {
  if (deal.days_to_close !== undefined && deal.days_to_close !== null) return deal.days_to_close;
  if (!deal.expected_close_date) return null;
  return daysFromToday(String(deal.expected_close_date).split('T')[0]);
}

export function isPipelineAtRisk(deal: DealLike): boolean {
  if (deal.status !== 'open') return false;
  const days = dealDaysToClose(deal);
  if (days === null) return false;
  const lateStage = ['proposal', 'negotiation'].includes(deal.stage);
  if (deal.risk_badge) return true;
  if (days <= 7 && days >= 0) return true;
  if (days < 0 && lateStage) return true;
  if (lateStage && deal.probability >= 55 && days <= 14) return true;
  return false;
}

export function countPipelineAtRisk(deals: DealLike[]): number {
  return deals.filter(isPipelineAtRisk).length;
}

export function countDealsCloseThisWeek(deals: DealLike[]): number {
  return deals.filter((d) => {
    if (d.status !== 'open') return false;
    const days = dealDaysToClose(d);
    return days !== null && days >= 0 && days <= 7;
  }).length;
}

export function countCloseRisk(deals: DealLike[]): number {
  return deals.filter((d) => {
    if (d.status !== 'open') return false;
    const days = dealDaysToClose(d);
    return days !== null && days <= 7;
  }).length;
}

export function countWarmRepliesWaiting(
  outreach: OutreachLike[],
  leads: LeadLike[],
): number {
  const repliedLeadIds = new Set(
    outreach.filter((o) => o.status === 'replied').map((o) => o.lead_id),
  );

  return leads.filter(
    (l) => repliedLeadIds.has(l.id) && ['responded', 'qualified'].includes(l.status),
  ).length;
}

export function getHighestIntentLead(leads: LeadLike[]): LeadLike | null {
  const eligible = leads
    .filter((l) => !['not_interested', 'converted'].includes(l.status))
    .sort((a, b) => b.score - a.score);
  return eligible[0] || null;
}

export function computePipelineTotals(deals: DealLike[]) {
  const open = deals.filter((d) => d.status === 'open');
  const won = deals.filter((d) => d.status === 'won');
  const lost = deals.filter((d) => d.status === 'lost');

  return {
    pipeline_value: open.reduce((s, d) => s + Number(d.value), 0),
    expected_revenue: open.reduce((s, d) => s + Number(d.value) * Number(d.probability) / 100, 0),
    deal_count: open.length,
    won_revenue: won.reduce((s, d) => s + Number(d.value), 0),
    lost_revenue: lost.reduce((s, d) => s + Number(d.value), 0),
    average_deal_size: open.length
      ? open.reduce((s, d) => s + Number(d.value), 0) / open.length
      : 0,
    close_risk_count: countCloseRisk(open),
  };
}
