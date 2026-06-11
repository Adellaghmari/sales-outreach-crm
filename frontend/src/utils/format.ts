export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeDate(date: string | null | undefined): string {
  if (!date) return 'No follow up scheduled';
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff === -1) return '1 day overdue';
  if (diff < -1 && diff >= -14) return `${Math.abs(diff)} days overdue`;
  if (diff < -14) return formatDate(date);
  if (diff <= 7) return `Due in ${diff} days`;
  return formatDate(date);
}

export function formatFollowUpDueDate(date: string, status?: string): string {
  if (status === 'completed') {
    const d = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Completed today';
    if (diff < 0 && diff >= -14) return `Completed ${Math.abs(diff)} days ago`;
    return formatDate(date);
  }
  return formatRelativeDate(date);
}

export function daysSince(date: string | null | undefined): number | null {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDaysSinceContact(date: string | null | undefined): string {
  const days = daysSince(date);
  if (days === null) return 'No contact yet';
  if (days === 0) return 'Contacted today';
  if (days === 1) return '1 day since contact';
  return `${days} days since contact`;
}

export function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const STAGE_LABELS: Record<string, string> = {
  new_lead: 'New Lead',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export function formatStageLabel(stage: string): string {
  if (!stage) return '';
  const normalized = stage.toLowerCase().trim();
  if (STAGE_LABELS[normalized]) return STAGE_LABELS[normalized];
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
