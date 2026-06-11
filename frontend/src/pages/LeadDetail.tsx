import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ScoreBadge, StageBadge, StatusBadge } from '../components/ui/Badge';
import { OwnerAvatar } from '../components/ui/OwnerAvatar';
import { formatCurrency, formatDate } from '../utils/format';
import { getScoreBreakdown, getBuyingIntent, isDecisionMaker } from '../utils/leadHelpers';
import '../components/ui/OwnerAvatar.css';
import './LeadDetail.css';

export function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getLead(Number(id)).then(setLead).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-state">Loading lead profile...</div>;
  if (!lead) return <div className="empty-state">Lead not found</div>;

  const breakdown = getScoreBreakdown({
    title: lead.title as string,
    status: lead.status as string,
    score: lead.score as number,
    lead_source: lead.lead_source as string,
    company_size: lead.company_size as string,
  });

  return (
    <div className="lead-detail-v2">
      <button className="back-link" onClick={() => navigate('/leads')}>← Back to leads</button>

      <div className="lead-detail-top">
        <div>
          <h1>{lead.first_name as string} {lead.last_name as string}</h1>
          <p>{lead.title as string} at {lead.company_name as string}</p>
        </div>
        <div className="lead-detail-badges">
          <ScoreBadge score={lead.score as number} label={lead.score_label as string} />
          <StatusBadge status={lead.status as string} />
          {isDecisionMaker(lead.title as string) && <span className="badge badge-secondary">Decision maker</span>}
        </div>
      </div>

      <div className="next-action-banner">
        <span className="next-action-label">Recommended next action</span>
        <span className="next-action-text">{lead.next_action as string}</span>
      </div>

      <div className="lead-detail-3col">
        <aside className="lead-profile-panel">
          <div className="card">
            <div className="card-header">Lead profile</div>
            <div className="card-body profile-fields">
              <Field label="Email" value={lead.email as string} />
              <Field label="Phone" value={lead.phone as string} />
              <Field label="Source" value={lead.lead_source as string} />
              <Field label="Buying intent" value={getBuyingIntent(lead.score as number, lead.status as string)} />
              <div className="owner-row" style={{ marginTop: 8 }}>
                <OwnerAvatar name={lead.owner as string} />
                <span>{lead.owner as string}</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">Score breakdown</div>
            <div className="card-body">
              {breakdown.map((b, i) => (
                <div key={i} className="score-row"><span>{b.label}</span><span className="tabular">{b.points}</span></div>
              ))}
              <div className="score-total"><span>Total score</span><span className="tabular">{lead.score as number}</span></div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">Company</div>
            <div className="card-body profile-fields">
              <Field label="Industry" value={lead.industry as string} />
              <Field label="Size" value={lead.company_size as string} />
              <Field label="Country" value={lead.country as string} />
            </div>
          </div>
        </aside>

        <main className="lead-timeline-panel">
          <div className="card">
            <div className="card-header">Communication timeline</div>
            <div className="card-body">
              {((lead.communication_history as Record<string, unknown>[]) || []).map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-marker" />
                  <div>
                    <div className="timeline-title">{String(item.title)}</div>
                    {item.description ? <div className="timeline-desc">{String(item.description)}</div> : null}
                    <div className="timeline-date">{formatDate(String(item.created_at))} · {String(item.type)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">Suggested next message</div>
            <div className="card-body suggested-message">{lead.suggested_message as string}</div>
          </div>
        </main>

        <aside className="lead-actions-panel">
          <div className="card">
            <div className="card-header">Related deal</div>
            <div className="card-body">
              {((lead.deals as unknown[]) || []).length === 0 ? (
                <div className="empty-state-box">No deal yet</div>
              ) : ((lead.deals as Record<string, unknown>[]).map((d) => (
                <div key={d.id as number} className="deal-mini">
                  <div className="deal-mini-title">{d.title as string}</div>
                  <StageBadge stage={d.stage as string} />
                  <div className="tabular">{formatCurrency(Number(d.value))}</div>
                </div>
              )))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">Follow ups</div>
            <div className="card-body">
              {((lead.follow_ups as Record<string, unknown>[]) || []).filter((f) => f.status !== 'completed').map((f) => (
                <div key={f.id as number} className={`follow-mini priority-${f.priority}`}>
                  <div>{f.reason as string}</div>
                  <div className="follow-date">{formatDate(f.due_date as string)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">Notes</div>
            <div className="card-body">
              {((lead.notes as { note: string }[]) || []).map((n, i) => <p key={i} className="note-text">{n.note}</p>)}
            </div>
          </div>
          <div className="card">
            <div className="card-header">Tasks</div>
            <div className="card-body">
              {((lead.tasks as { title: string; due_date?: string }[]) || []).map((t, i) => (
                <div key={i} className="task-item">{t.title} · {t.due_date ? formatDate(t.due_date) : 'No date'}</div>
              ))}
            </div>
          </div>
          <Link to="/outreach" className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}>Create outreach</Link>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="field-item">
      <span className="field-label">{label}</span>
      <span>{value || 'Not set'}</span>
    </div>
  );
}
