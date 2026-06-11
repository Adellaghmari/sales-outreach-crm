interface LeadScoreInput {
  title?: string | null;
  status: string;
  lead_source?: string | null;
  company_size?: string | null;
  has_reply?: boolean;
  deal_value?: number;
  overdue_follow_up?: boolean;
  recent_activity_count?: number;
  outreach_without_reply?: number;
  days_to_close?: number | null;
}

const DECISION_MAKER_TITLES = [
  'ceo', 'cto', 'cfo', 'coo', 'vp', 'vice president', 'head of',
  'director', 'chief', 'founder', 'owner', 'president', 'manager',
];

const HIGH_VALUE_SOURCES = ['referral', 'inbound', 'event', 'partner'];

export function calculateLeadScore(input: LeadScoreInput): number {
  let score = 30;

  const title = (input.title || '').toLowerCase();
  if (DECISION_MAKER_TITLES.some((t) => title.includes(t))) {
    score += 15;
  }

  const size = (input.company_size || '').toLowerCase();
  if (size.includes('500') || size.includes('enterprise') || size.includes('1000')) {
    score += 10;
  } else if (size.includes('200') || size.includes('mid')) {
    score += 6;
  } else if (size.includes('50') || size.includes('small')) {
    score += 3;
  }

  const statusBonus: Record<string, number> = {
    new: 0,
    contacted: 5,
    responded: 15,
    qualified: 20,
    not_interested: -20,
    converted: 25,
  };
  score += statusBonus[input.status] ?? 0;

  const source = (input.lead_source || '').toLowerCase();
  if (HIGH_VALUE_SOURCES.some((s) => source.includes(s))) {
    score += 8;
  } else if (source.includes('linkedin')) {
    score += 5;
  }

  if (input.has_reply) score += 12;

  if (input.deal_value && input.deal_value >= 50000) score += 15;
  else if (input.deal_value && input.deal_value >= 20000) score += 10;
  else if (input.deal_value && input.deal_value >= 5000) score += 5;

  if (input.recent_activity_count && input.recent_activity_count >= 3) score += 8;
  else if (input.recent_activity_count && input.recent_activity_count >= 1) score += 4;

  if (input.overdue_follow_up) score += 10;

  if (input.outreach_without_reply && input.outreach_without_reply >= 3) score -= 15;
  else if (input.outreach_without_reply && input.outreach_without_reply >= 2) score -= 8;

  if (input.days_to_close !== null && input.days_to_close !== undefined) {
    if (input.days_to_close <= 7) score += 12;
    else if (input.days_to_close <= 14) score += 8;
    else if (input.days_to_close <= 30) score += 4;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getScoreLabel(score: number): 'Hot' | 'Warm' | 'Cold' | 'Low priority' {
  if (score >= 75) return 'Hot';
  if (score >= 55) return 'Warm';
  if (score >= 35) return 'Cold';
  return 'Low priority';
}
