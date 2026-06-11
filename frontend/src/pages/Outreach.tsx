import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { EmailTemplate, Lead, OutreachMessage } from '../types';
import { StatusBadge } from '../components/ui/Badge';
import './Outreach.css';

export function Outreach() {
  const [messages, setMessages] = useState<OutreachMessage[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [selected, setSelected] = useState<OutreachMessage | null>(null);
  const [previousSelectedId, setPreviousSelectedId] = useState<number | null>(null);
  const [composer, setComposer] = useState({ lead_id: '', subject: '', body: '', channel: 'email', template_id: '' });
  const [showComposer, setShowComposer] = useState(false);

  const load = () => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (channelFilter) params.channel = channelFilter;
    Promise.all([api.getOutreach(params), api.getTemplates(), api.getLeads({ sortBy: 'score' })])
      .then(([msgs, tmpl, lds]) => {
        setMessages(msgs);
        setTemplates(tmpl);
        setLeads(lds);
        if (!selected && msgs.length > 0) setSelected(msgs[0]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, channelFilter]);

  const applyTemplate = (templateId: string) => {
    const t = templates.find((x) => x.id === Number(templateId));
    const lead = leads.find((l) => l.id === Number(composer.lead_id));
    if (!t) return;
    let subject = t.subject || '';
    let body = t.body || '';
    if (lead) {
      subject = subject.replace(/\{\{first_name\}\}/g, lead.first_name).replace(/\{\{company\}\}/g, lead.company_name || '');
      body = body.replace(/\{\{first_name\}\}/g, lead.first_name).replace(/\{\{company\}\}/g, lead.company_name || '');
    }
    setComposer({ ...composer, template_id: templateId, subject, body });
  };

  const saveDraft = async () => {
    if (!composer.lead_id) return;
    await api.createOutreach({ ...composer, lead_id: Number(composer.lead_id), status: 'draft' });
    setShowComposer(false);
    load();
  };

  const markSent = async (id?: number) => {
    if (id) await api.updateOutreach(id, { status: 'sent' });
    else if (composer.lead_id) {
      await api.createOutreach({ ...composer, lead_id: Number(composer.lead_id), status: 'sent' });
      setShowComposer(false);
    }
    load();
  };

  const markReplied = async (id: number) => {
    await api.updateOutreach(id, { status: 'replied' });
    load();
  };

  const openComposer = () => {
    setPreviousSelectedId(selected?.id ?? null);
    setShowComposer(true);
    setSelected(null);
  };

  const cancelCompose = () => {
    setShowComposer(false);
    const restoreId = previousSelectedId ?? messages[0]?.id ?? null;
    setSelected(restoreId ? messages.find((m) => m.id === restoreId) || messages[0] || null : messages[0] || null);
  };

  if (loading) return <div className="loading-state">Loading outreach...</div>;

  return (
    <div className="outreach-page">
      <div className="page-header outreach-header">
        <div>
          <h1>Outreach Center</h1>
          <p>Draft, send and track simulated outreach across channels</p>
        </div>
        <button className="btn btn-primary" onClick={openComposer}>+ New message</button>
      </div>

      <div className="filter-bar">
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option><option value="sent">Sent</option><option value="replied">Replied</option>
        </select>
        <select className="select" value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
          <option value="">All channels</option>
          <option value="email">Email</option><option value="linkedin">LinkedIn</option>
        </select>
      </div>

      <div className="outreach-layout">
        <div className="outreach-list">
          {messages.map((msg) => (
            <div key={msg.id} className={`outreach-item card ${selected?.id === msg.id && !showComposer ? 'selected' : ''}`} onClick={() => { setSelected(msg); setShowComposer(false); }}>
              <div className="outreach-item-header">
                <span className="outreach-subject">{msg.subject}</span>
                <StatusBadge status={msg.status} />
              </div>
              <div className="outreach-recipient">{msg.first_name} {msg.last_name} · {msg.company_name}</div>
            </div>
          ))}
        </div>

        <div className="outreach-panel">
          {showComposer ? (
            <ComposerPanel composer={composer} setComposer={setComposer} leads={leads} templates={templates} applyTemplate={applyTemplate} onSaveDraft={saveDraft} onMarkSent={() => markSent()} onCancel={cancelCompose} />
          ) : selected ? (
            <div className="card composer-card">
              <div className="card-header">Message detail</div>
              <div className="card-body">
                <div className="detail-recipient"><strong>To:</strong> {selected.first_name} {selected.last_name} ({selected.lead_email})</div>
                <div className="detail-recipient"><strong>Company:</strong> {selected.company_name}</div>
                <div className="detail-subject">{selected.subject}</div>
                <pre className="detail-body">{selected.body}</pre>
                <div className="detail-meta">
                  <StatusBadge status={selected.status} />
                  <span className={`badge channel-${selected.channel}`}>{selected.channel}</span>
                </div>
                <div className="composer-actions">
                  {selected.status === 'draft' && <button className="btn btn-accent" onClick={() => markSent(selected.id)}>Mark as sent</button>}
                  {selected.status === 'sent' && <button className="btn btn-primary" onClick={() => markReplied(selected.id)}>Mark as replied</button>}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ComposerPanel({ composer, setComposer, leads, templates, applyTemplate, onSaveDraft, onMarkSent, onCancel }: {
  composer: { lead_id: string; subject: string; body: string; channel: string; template_id: string };
  setComposer: (c: typeof composer) => void;
  leads: Lead[]; templates: EmailTemplate[];
  applyTemplate: (id: string) => void;
  onSaveDraft: () => void; onMarkSent: () => void; onCancel: () => void;
}) {
  const lead = leads.find((l) => l.id === Number(composer.lead_id));
  return (
    <div className="card composer-card composer-mode">
      <div className="card-header composer-header">
        <span>Message composer</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Back to selected message</button>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label>Recipient</label>
          <select className="select" value={composer.lead_id} onChange={(e) => setComposer({ ...composer, lead_id: e.target.value })}>
            <option value="">Select lead</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name} · {l.company_name}</option>)}
          </select>
        </div>
        {lead && <div className="composer-company">Company: {lead.company_name}</div>}
        <div className="form-group">
          <label>Template</label>
          <select className="select" value={composer.template_id} onChange={(e) => applyTemplate(e.target.value)}>
            <option value="">Select template</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Channel</label>
          <select className="select" value={composer.channel} onChange={(e) => setComposer({ ...composer, channel: e.target.value })}>
            <option value="email">Email</option><option value="linkedin">LinkedIn</option><option value="phone">Phone</option>
          </select>
        </div>
        <div className="form-group"><label>Subject</label><input className="input" value={composer.subject} onChange={(e) => setComposer({ ...composer, subject: e.target.value })} /></div>
        <div className="form-group"><label>Body</label><textarea className="textarea" rows={8} value={composer.body} onChange={(e) => setComposer({ ...composer, body: e.target.value })} /></div>
        <div className="composer-preview">
          <div className="preview-label">Preview</div>
          <strong>{composer.subject || 'No subject'}</strong>
          <pre>{composer.body || 'No content'}</pre>
        </div>
        <div className="composer-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel compose</button>
          <button type="button" className="btn btn-secondary" onClick={onSaveDraft}>Save draft</button>
          <button type="button" className="btn btn-accent" onClick={onMarkSent}>Mark as sent</button>
        </div>
      </div>
    </div>
  );
}
