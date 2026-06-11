const DECISION_MAKER = ['ceo', 'cto', 'coo', 'cfo', 'vp', 'head of', 'director', 'founder', 'chief', 'president'];

export function isDecisionMaker(title?: string): boolean {
  const t = (title || '').toLowerCase();
  return DECISION_MAKER.some((k) => t.includes(k));
}

export function getBuyingIntent(score: number, status: string): 'High' | 'Medium' | 'Low' {
  if (score >= 75 || status === 'qualified' || status === 'responded') return 'High';
  if (score >= 50 || status === 'contacted') return 'Medium';
  return 'Low';
}

export function getScoreBreakdown(lead: {
  title?: string;
  status: string;
  score: number;
  lead_source?: string;
  company_size?: string;
}): { label: string; points: string }[] {
  const items: { label: string; points: string }[] = [];
  if (isDecisionMaker(lead.title)) items.push({ label: 'Decision maker title', points: '+15' });
  if (lead.status === 'qualified') items.push({ label: 'Qualified status', points: '+20' });
  else if (lead.status === 'responded') items.push({ label: 'Responded to outreach', points: '+15' });
  if (lead.lead_source?.toLowerCase().includes('referral')) items.push({ label: 'Referral source', points: '+8' });
  if (lead.lead_source?.toLowerCase().includes('inbound')) items.push({ label: 'Inbound interest', points: '+8' });
  if ((lead.company_size || '').includes('500')) items.push({ label: 'Mid market company', points: '+6' });
  items.push({ label: 'Base fit score', points: '30' });
  return items;
}

export const OWNERS = ['Alex Morgan', 'Nadia Rahman', 'Leo Sandberg', 'Miriam Costa'];

export function ownerInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function ownerColor(name: string): string {
  const colors: Record<string, string> = {
    'Alex Morgan': '#5c2d4a',
    'Nadia Rahman': '#c45c3e',
    'Leo Sandberg': '#2d6a5c',
    'Miriam Costa': '#7c5c2d',
  };
  return colors[name] || '#5c2d4a';
}
