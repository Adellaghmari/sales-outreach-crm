import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Lead } from '../types';
import { ScoreBadge, StatusBadge } from '../components/ui/Badge';
import { OwnerAvatar } from '../components/ui/OwnerAvatar';
import { formatRelativeDate, formatDaysSinceContact } from '../utils/format';
import { getBuyingIntent, isDecisionMaker } from '../utils/leadHelpers';
import '../components/ui/OwnerAvatar.css';
import './Leads.css';

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [minScore, setMinScore] = useState('');
  const [source, setSource] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const loadLeads = () => {
    setLoading(true);
    const params: Record<string, string> = { sortBy, sortOrder: 'desc' };
    if (search) params.search = search;
    if (status) params.status = status;
    if (minScore) params.minScore = minScore;
    if (source) params.source = source;
    api.getLeads(params).then(setLeads).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { loadLeads(); }, [status, minScore, source, sortBy]);

  return (
    <div className="leads-page">
      <div className="page-header">
        <h1>Lead Workspace</h1>
        <p>Prioritize prospects by score, intent and follow up timing</p>
      </div>

      <div className="filter-bar">
        <form onSubmit={(e) => { e.preventDefault(); loadLeads(); }} className="search-form">
          <input className="input" placeholder="Search leads, companies, titles..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option><option value="contacted">Contacted</option>
          <option value="responded">Responded</option><option value="qualified">Qualified</option>
        </select>
        <select className="select" value={minScore} onChange={(e) => setMinScore(e.target.value)}>
          <option value="">All scores</option>
          <option value="75">Hot (75+)</option><option value="55">Warm (55+)</option>
        </select>
        <select className="select" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          <option value="LinkedIn">LinkedIn</option><option value="Inbound">Inbound</option>
          <option value="Referral">Referral</option><option value="Event">Event</option>
        </select>
        <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="score">Sort by score</option>
          <option value="last_activity">Sort by last activity</option>
          <option value="created_at">Sort by created</option>
        </select>
        <div className="view-toggle">
          <button className={`btn btn-sm ${view === 'cards' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('cards')}>Cards</button>
          <button className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>Table</button>
        </div>
      </div>

      {loading && <div className="loading-state">Loading leads...</div>}
      {error && <div className="error-state">{error}</div>}

      {!loading && leads.length === 0 && <div className="empty-state-box">No leads match your filters</div>}

      {!loading && view === 'cards' && (
        <div className="lead-cards">
          {leads.map((lead) => (
            <Link to={`/leads/${lead.id}`} key={lead.id} className="lead-card card">
              <div className="lead-card-header">
                <div>
                  <h3>{lead.first_name} {lead.last_name}</h3>
                  <p className="lead-title">{lead.title}</p>
                  <div className="lead-card-badges">
                    {isDecisionMaker(lead.title) && <span className="badge badge-secondary">Decision maker</span>}
                  </div>
                </div>
                <div className="lead-card-score">
                  <ScoreBadge score={lead.score} label={lead.score_label} />
                </div>
              </div>
              <div className="lead-card-body">
                <div className="lead-card-row">
                  <span className="label">Company</span>
                  <span className="value">{lead.company_name}</span>
                </div>
                <div className="lead-card-row">
                  <span className="label">Intent</span>
                  <span className="value intent-badge">{getBuyingIntent(lead.score, lead.status)}</span>
                </div>
                <div className="lead-card-row">
                  <span className="label">Last contact</span>
                  <span className="value">{formatDaysSinceContact(lead.last_activity)}</span>
                </div>
                <div className="lead-card-row">
                  <span className="label">Next follow up</span>
                  <span className="value">{formatRelativeDate(lead.next_follow_up)}</span>
                </div>
                <div className="lead-card-row">
                  <span className="label">Source</span>
                  <span className="value">{lead.lead_source || 'Not set'}</span>
                </div>
                <div className="lead-card-row">
                  <span className="label">Status</span>
                  <span className="value"><StatusBadge status={lead.status} /></span>
                </div>
              </div>
              <div className="lead-card-footer">
                <span className="owner-row"><OwnerAvatar name={lead.owner} size={24} />{lead.owner}</span>
                <span className="view-detail">Open profile →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && view === 'table' && (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Company</th><th>Score</th><th>Status</th><th>Owner</th><th></th></tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="name-cell">{lead.first_name} {lead.last_name}</td>
                  <td>{lead.company_name}</td>
                  <td><ScoreBadge score={lead.score} /></td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><span className="owner-row"><OwnerAvatar name={lead.owner} size={22} />{lead.owner}</span></td>
                  <td><Link to={`/leads/${lead.id}`} className="btn btn-sm btn-secondary">Open profile</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
