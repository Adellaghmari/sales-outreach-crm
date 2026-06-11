interface LeadContext {
  status: string;
  score: number;
  has_outreach: boolean;
  has_reply: boolean;
  outreach_count: number;
  overdue_follow_up: boolean;
  has_deal: boolean;
  deal_stage?: string | null;
  days_since_contact?: number;
}

interface DealContext {
  stage: string;
  status: string;
  probability: number;
  days_to_close?: number | null;
  has_follow_up: boolean;
}

export function getLeadNextAction(ctx: LeadContext): string {
  if (ctx.status === 'not_interested') return 'Archive lead and note reason';
  if (ctx.status === 'converted') return 'Hand off to account management';
  if (ctx.overdue_follow_up) return 'Follow up after no response';
  if (!ctx.has_outreach) return 'Send first outreach email';
  if (ctx.has_reply && ctx.status === 'responded') return 'Schedule discovery call';
  if (ctx.has_reply && !ctx.has_deal) return 'Move lead to qualified';
  if (ctx.outreach_count >= 2 && !ctx.has_reply) return 'Send second follow up';
  if (ctx.status === 'qualified' && !ctx.has_deal) return 'Create deal and proposal follow up';
  if (ctx.status === 'contacted' && (ctx.days_since_contact ?? 0) > 5) return 'Follow up after no response';
  if (ctx.score >= 75) return 'Schedule discovery call';
  return 'Send first outreach email';
}

export function getDealNextAction(ctx: DealContext): string {
  if (ctx.status === 'won') return 'Begin onboarding handoff';
  if (ctx.status === 'lost') return 'Document loss reason';
  if (ctx.stage === 'new_lead') return 'Send first outreach email';
  if (ctx.stage === 'contacted') return 'Follow up after no response';
  if (ctx.stage === 'qualified') return 'Schedule discovery call';
  if (ctx.stage === 'proposal') return 'Create proposal follow up';
  if (ctx.stage === 'negotiation') {
    if (ctx.days_to_close !== null && ctx.days_to_close !== undefined && ctx.days_to_close <= 7) {
      return 'Call before expected close date';
    }
    return 'Ask about pricing and timeline';
  }
  if (!ctx.has_follow_up) return 'Schedule next follow up';
  return 'Move deal to next stage';
}

interface PriorityItem {
  type: 'follow_up' | 'deal' | 'lead';
  action: string;
  label: string;
  priority: number;
}

export function buildDashboardPriorities(items: PriorityItem[]): string[] {
  return items
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6)
    .map((item) => item.label);
}
