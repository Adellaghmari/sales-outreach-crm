import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { FollowUp } from '../types';
import { formatFollowUpDueDate } from '../utils/format';
import { regroupFollowUps } from '../utils/followUpGroups';
import { RescheduleModal } from '../components/ui/RescheduleModal';
import './FollowUps.css';

type FollowUpGroups = {
  all: FollowUp[];
  dueToday: FollowUp[];
  overdue: FollowUp[];
  thisWeek: FollowUp[];
  completed: FollowUp[];
};

export function FollowUps() {
  const [groups, setGroups] = useState<FollowUpGroups | null>(null);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');

  const load = (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    const params: Record<string, string> = {};
    if (priorityFilter) params.priority = priorityFilter;
    return api.getFollowUps(params)
      .then(setGroups)
      .catch((e) => setError(e.message))
      .finally(() => { if (!options?.silent) setLoading(false); });
  };

  useEffect(() => { load(); }, [priorityFilter]);

  const complete = async (id: number) => {
    if (!groups) return;
    const snapshot = groups;
    setCompletingIds((prev) => new Set(prev).add(id));
    setError('');

    const updated = groups.all.map((f) =>
      f.id === id ? { ...f, status: 'completed' } : f,
    );
    setGroups(regroupFollowUps(updated));

    try {
      await api.updateFollowUp(id, { status: 'completed' });
      load({ silent: true });
    } catch (e) {
      setGroups(snapshot);
      setError(e instanceof Error ? e.message : 'Could not complete follow up');
    } finally {
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const reschedule = async (id: number, date: string) => {
    if (!groups) return;
    const snapshot = groups;
    setError('');

    const updated = groups.all.map((f) =>
      f.id === id ? { ...f, due_date: date, status: 'pending' } : f,
    );
    setGroups(regroupFollowUps(updated));

    try {
      await api.updateFollowUp(id, { due_date: date, status: 'pending' });
      setRescheduleId(null);
      load({ silent: true });
    } catch (e) {
      setGroups(snapshot);
      throw e;
    }
  };

  if (loading) return <div className="loading-state">Loading follow ups...</div>;
  if (!groups) return null;

  const rescheduleItem = rescheduleId ? groups.all.find((f) => f.id === rescheduleId) : undefined;

  return (
    <div className="followups-page">
      <div className="page-header">
        <h1>Follow Up Planner</h1>
        <p>Stay ahead of overdue tasks and today's priority actions</p>
      </div>

      {error && <div className="error-state" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="filter-bar">
        <select className="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option><option value="high">High</option>
          <option value="medium">Medium</option><option value="low">Low</option>
        </select>
      </div>

      <div className="followup-sections">
        <Section title="Overdue" count={groups.overdue.length} items={groups.overdue} variant="overdue" completingIds={completingIds} onComplete={complete} onReschedule={setRescheduleId} emptyText="No overdue follow ups. Your team is on track." />
        <Section title="Due today" count={groups.dueToday.length} items={groups.dueToday} variant="today" completingIds={completingIds} onComplete={complete} onReschedule={setRescheduleId} emptyText="No follow ups due today." />
        <Section title="This week" count={groups.thisWeek.length} items={groups.thisWeek} variant="week" completingIds={completingIds} onComplete={complete} onReschedule={setRescheduleId} emptyText="No follow ups scheduled this week. Your team is clear for this period." />
        <Section title="Completed" count={groups.completed.length} items={groups.completed} variant="completed" completingIds={completingIds} onComplete={complete} onReschedule={setRescheduleId} emptyText="No completed follow ups yet." />
      </div>

      <RescheduleModal
        open={rescheduleId !== null}
        onClose={() => setRescheduleId(null)}
        initialDate={rescheduleItem?.due_date}
        onConfirm={(date) => reschedule(rescheduleId!, date)}
      />
    </div>
  );
}

function Section({ title, count, items, variant, completingIds, onComplete, onReschedule, emptyText }: {
  title: string; count: number; items: FollowUp[]; variant: string; completingIds: Set<number>;
  onComplete: (id: number) => void; onReschedule: (id: number) => void; emptyText: string;
}) {
  return (
    <div className={`card followup-section followup-${variant}`}>
      <div className="card-header">{title}<span className="section-count">{count}</span></div>
      <div className="card-body">
        {items.length === 0 ? <div className="empty-state-box">{emptyText}</div> : items.map((f) => (
          <div key={f.id} className={`followup-card priority-${f.priority}${completingIds.has(f.id) ? ' is-saving' : ''}`}>
            <div className="followup-card-main">
              <Link to={`/leads/${f.lead_id}`} className="followup-lead">{f.first_name} {f.last_name}</Link>
              <div className="followup-company">{f.company_name}</div>
              <div className="followup-reason">{f.reason}</div>
              <div className="followup-action">{f.recommended_action}</div>
            </div>
            <div className="followup-card-side">
              <span className={`badge badge-${f.priority === 'urgent' ? 'danger' : f.priority === 'high' ? 'warm' : 'primary'}`}>{f.priority}</span>
              <span className="followup-date">{formatFollowUpDueDate(f.due_date, f.status)}</span>
              {f.status !== 'completed' && (
                <div className="followup-buttons">
                  <button
                    className="btn btn-sm btn-accent"
                    onClick={() => onComplete(f.id)}
                    disabled={completingIds.has(f.id)}
                  >
                    {completingIds.has(f.id) ? 'Saving...' : 'Complete'}
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => onReschedule(f.id)} disabled={completingIds.has(f.id)}>Reschedule</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
