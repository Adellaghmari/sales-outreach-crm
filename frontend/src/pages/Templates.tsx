import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { EmailTemplate } from '../types';
import { formatCategory } from '../utils/format';
import './Templates.css';

interface ExtendedTemplate extends EmailTemplate {
  best_used_when?: string;
}

export function Templates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ExtendedTemplate[]>([]);
  const [selected, setSelected] = useState<ExtendedTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [copied, setCopied] = useState(false);

  const load = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    api.getTemplates(params).then((data) => {
      setTemplates(data as ExtendedTemplate[]);
      if (!selected && data.length > 0) setSelected(data[0] as ExtendedTemplate);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category]);

  const copyTemplate = () => {
    if (!selected) return;
    navigator.clipboard.writeText(`Subject: ${selected.subject}\n\n${selected.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="loading-state">Loading templates...</div>;

  return (
    <div className="templates-page">
      <div className="page-header">
        <h1>Email Templates</h1>
        <p>Professional outreach copy for every stage of the sales cycle</p>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-secondary btn-sm" onClick={load}>Search</button>
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="cold_outreach">Cold outreach</option>
          <option value="follow_up">Follow up</option>
          <option value="meeting_request">Meeting request</option>
          <option value="proposal_follow_up">Proposal follow up</option>
          <option value="reengagement">Reengagement</option>
        </select>
      </div>

      <div className="templates-layout">
        <div className="templates-list">
          {templates.map((t) => (
            <div key={t.id} className={`template-item card ${selected?.id === t.id ? 'selected' : ''}`} onClick={() => setSelected(t)}>
              <div className="template-name">{t.name}</div>
              <span className="template-category">{formatCategory(t.category)}</span>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card template-detail-card">
            <div className="card-header template-detail-header">
              <span>{selected.name}</span>
              <div className="template-actions">
                <button className="btn btn-sm btn-secondary" onClick={copyTemplate}>{copied ? 'Copied!' : 'Copy text'}</button>
                <button className="btn btn-sm btn-primary" onClick={() => navigate('/outreach')}>Use in outreach</button>
              </div>
            </div>
            <div className="card-body">
              <div className="template-field"><span className="field-label">Category</span><span>{formatCategory(selected.category)}</span></div>
              {selected.best_used_when && <div className="template-field"><span className="field-label">Best used when</span><span>{selected.best_used_when}</span></div>}
              <div className="template-field"><span className="field-label">Subject</span><span className="template-subject">{selected.subject}</span></div>
              <pre className="template-body">{selected.body}</pre>
              <div className="var-tags">
                <span className="var-tag">{'{{first_name}}'}</span>
                <span className="var-tag">{'{{company}}'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
