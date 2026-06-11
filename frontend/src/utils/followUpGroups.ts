import { FollowUp } from '../types';

function todayISO(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

function addDaysISO(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function resolveFollowUpStatus(dueDate: string, status: string): string {
  if (status === 'completed') return 'completed';
  const target = new Date(dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'overdue';
  return 'pending';
}

export function regroupFollowUps(all: FollowUp[]) {
  const today = todayISO();
  const weekEnd = addDaysISO(7);
  const normalized = all.map((f) => {
    const due_date = f.due_date.split('T')[0];
    const status = f.status === 'completed' ? 'completed' : resolveFollowUpStatus(due_date, f.status);
    return { ...f, due_date, status };
  });

  return {
    all: normalized,
    dueToday: normalized.filter((f) => f.due_date === today && f.status !== 'completed'),
    overdue: normalized.filter((f) => f.status === 'overdue'),
    thisWeek: normalized.filter((f) => f.due_date > today && f.due_date <= weekEnd && f.status === 'pending'),
    completed: normalized.filter((f) => f.status === 'completed'),
  };
}
