import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { DashboardData, Deal, Lead } from '../types';
import { ScoreBadge } from '../components/ui/Badge';
import { formatCurrency, formatDate } from '../utils/format';
import './Dashboard.css';

interface ExtendedDashboard extends DashboardData {
  summaryCopy?: string;
  commandMetrics?: Record<string, unknown>;
  recentReplies?: unknown[];
  topDealsRequiringAction?: Deal[];
  topLeadsToContact?: Lead[];
}

export function Dashboard() {
  const [data, setData] = useState<ExtendedDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard()
      .then((d) => setData(d as ExtendedDashboard))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="hero-skeleton skeleton" style={{ height: 160, marginBottom: 24 }} />
        <div className="stat-grid">{[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton" style={{ height: 90 }} />)}</div>
      </div>
    );
  }
  if (error) return <div className="error-state">Could not load dashboard. {error}</div>;
  if (!data) return null;

  const { stats } = data;
  const cm = data.commandMetrics || {};

  return (
    <div className="dashboard">
      <section className="command-hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Today's Sales Command Center</span>
          <h1>Revenue Command Center</h1>
          <p className="hero-summary">{data.summaryCopy || "Today's pipeline overview and priority actions."}</p>
        </div>
        <div className="hero-metrics">
          <div className="hero-metric">
            <span className="hero-metric-label">Open pipeline</span>
            <span className="hero-metric-value tabular">{formatCurrency(stats.pipelineValue)}</span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-label">Expected revenue</span>
            <span className="hero-metric-value tabular accent">{formatCurrency(stats.expectedRevenue)}</span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-label">Follow up pressure</span>
            <span className="hero-metric-value tabular">{String(cm.followUpPressure || stats.overdueFollowUps)}</span>
          </div>
        </div>
      </section>

      <div className="command-cards">
        <div className="command-card risk">
          <span className="command-card-label">Pipeline at risk</span>
          <span className="command-card-value tabular">{String(cm.pipelineAtRisk || 0)}</span>
          <span className="command-card-hint">Deals close within 7 days</span>
        </div>
        <div className="command-card warm">
          <span className="command-card-label">Warm replies waiting</span>
          <span className="command-card-value tabular">{String(cm.warmRepliesWaiting || 0)}</span>
          <span className="command-card-hint">Needs timely response</span>
        </div>
        <div className="command-card close">
          <span className="command-card-label">Deals close this week</span>
          <span className="command-card-value tabular">{String(cm.dealsCloseThisWeek || 0)}</span>
        </div>
        <div className="command-card revenue">
          <span className="command-card-label">Expected revenue</span>
          <span className="command-card-value tabular">{formatCurrency(Number(cm.expectedRevenueThisMonth || stats.expectedRevenue))}</span>
        </div>
        <div className="command-card intent">
          <span className="command-card-label">Highest intent lead</span>
          <span className="command-card-lead">
            {(cm.highestIntentLead as Lead)?.first_name
              ? `${(cm.highestIntentLead as Lead).first_name} ${(cm.highestIntentLead as Lead).last_name}`
              : 'No active lead'}
          </span>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="label">Total leads</div><div className="value tabular">{stats.totalLeads}</div></div>
        <div className="stat-card"><div className="label">Qualified</div><div className="value tabular">{stats.qualifiedLeads}</div></div>
        <div className="stat-card"><div className="label">Open deals</div><div className="value tabular">{stats.openDeals}</div></div>
        <div className="stat-card"><div className="label">Won deals</div><div className="value tabular" style={{ color: 'var(--success)' }}>{stats.wonDeals}</div></div>
        <div className="stat-card"><div className="label">Overdue follow ups</div><div className="value tabular" style={{ color: 'var(--danger)' }}>{stats.overdueFollowUps}</div></div>
        <div className="stat-card"><div className="label">Reply rate</div><div className="value tabular">{stats.replyRate}%</div></div>
      </div>

      <div className="dashboard-grid">
        <div className="card priorities-card">
          <div className="card-header">Today's sales priorities</div>
          <div className="card-body">
            <ul className="action-list">
              {data.recommendedActions.map((action, i) => <li key={i}>{action}</li>)}
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Top deals requiring action</div>
          <div className="card-body">
            {(data.topDealsRequiringAction || data.closingDeals).map((deal) => (
              <div key={deal.id} className="list-item">
                <div>
                  <div className="item-link">{deal.title}</div>
                  <div className="item-meta">{deal.company_name} · {deal.next_action}</div>
                </div>
                <span className="tabular">{formatCurrency(Number(deal.value))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Top leads to contact</div>
          <div className="card-body">
            {(data.topLeadsToContact || data.hotLeads).map((lead) => (
              <div key={lead.id} className="list-item">
                <div>
                  <Link to={`/leads/${lead.id}`} className="item-link">{lead.first_name} {lead.last_name}</Link>
                  <div className="item-meta">{lead.company_name}</div>
                </div>
                <ScoreBadge score={lead.score} label={lead.score_label} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Recent replies</div>
          <div className="card-body">
            {(data.recentReplies as { id: number; subject?: string; company_name?: string; first_name?: string; last_name?: string }[] || []).length === 0 ? (
              <div className="empty-state-box">No recent replies yet</div>
            ) : (
              (data.recentReplies as { id: number; subject?: string; company_name?: string; first_name?: string; last_name?: string }[]).map((r) => (
                <div key={r.id} className="list-item">
                  <div>
                    <div className="item-link">{r.subject}</div>
                    <div className="item-meta">{r.first_name} {r.last_name} · {r.company_name}</div>
                  </div>
                  <span className="badge badge-success">Replied</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card full-width">
          <div className="card-header">Recent activity</div>
          <div className="card-body activity-feed">
            {data.recentActivity.map((a) => (
              <div key={a.id} className="activity-item">
                <div className="activity-dot" data-type={a.type} />
                <div>
                  <div className="activity-title">{a.title}</div>
                  <div className="item-meta">{a.first_name} {a.last_name} at {a.company_name}</div>
                </div>
                <span className="activity-time">{formatDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
