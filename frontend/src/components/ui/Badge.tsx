import { formatStageLabel } from '../../utils/format';

interface BadgeProps {
  label: string;
  variant?: string;
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{label}</span>;
}

export function ScoreBadge({ score, label }: { score: number; label?: string }) {
  const scoreLabel = label || (score >= 75 ? 'Hot' : score >= 55 ? 'Warm' : score >= 35 ? 'Cold' : 'Low priority');
  const variant = score >= 75 ? 'hot' : score >= 55 ? 'warm' : score >= 35 ? 'cold' : 'low';
  return <span className={`badge badge-${variant}`}>{scoreLabel} · {score}</span>;
}

export function StageBadge({ stage }: { stage: string }) {
  return <span className={`badge stage-${stage}`}>{formatStageLabel(stage)}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    responded: 'Responded',
    qualified: 'Qualified',
    converted: 'Converted',
    not_interested: 'Not interested',
    prospect: 'Prospect',
    active_opportunity: 'Active opportunity',
    customer: 'Customer',
    open: 'Open',
    won: 'Won',
    lost: 'Lost',
    pending: 'Pending',
    completed: 'Completed',
    overdue: 'Overdue',
    draft: 'Draft',
    sent: 'Sent',
    replied: 'Replied',
    scheduled: 'Scheduled',
  };
  const variant = status === 'overdue' ? 'danger' : status === 'won' || status === 'converted' || status === 'replied' ? 'success' : status;
  return <span className={`badge status-${status} outreach-${status} channel-${status} ${typeof variant === 'string' && ['danger','success'].includes(variant) ? `badge-${variant}` : ''}`}>{labels[status] || status}</span>;
}
