import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { DatePicker } from './DatePicker';
import './DatePicker.css';
import './NewLeadModal.css';
import { api } from '../../api/client';
import { Company } from '../../types';
import { OWNERS } from '../../utils/leadHelpers';

interface NewLeadModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NewLeadModal({ open, onClose, onCreated }: NewLeadModalProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', title: '', company_id: '',
    email: '', lead_source: 'Inbound', status: 'new', owner: OWNERS[0], note: '', next_follow_up_date: '',
  });

  useEffect(() => {
    if (open) api.getCompanies().then(setCompanies).catch(() => {});
  }, [open]);

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.company_id) {
      setError('First name, last name and company are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.createLead({
        ...form,
        company_id: Number(form.company_id),
        score: 40,
      });
      onCreated();
      onClose();
      setForm({ first_name: '', last_name: '', title: '', company_id: '', email: '', lead_source: 'Inbound', status: 'new', owner: OWNERS[0], note: '', next_follow_up_date: '' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New lead"
      className="new-lead-modal"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create lead'}
          </button>
        </>
      }
    >
      {error && <p style={{ color: 'var(--danger)', marginBottom: 12, fontSize: '0.85rem' }}>{error}</p>}
      <div className="form-row">
        <div className="form-group">
          <label>First name</label>
          <input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Last name</label>
          <input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </div>
      </div>
      <div className="form-group">
        <label>Title</label>
        <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Company</label>
        <select className="select" value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })}>
          <option value="">Select company</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Source</label>
          <select className="select" value={form.lead_source} onChange={(e) => setForm({ ...form, lead_source: e.target.value })}>
            <option>LinkedIn</option><option>Inbound</option><option>Referral</option>
            <option>Event</option><option>Partner</option><option>Cold outreach</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Status</label>
          <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="new">New</option><option value="contacted">Contacted</option>
          </select>
        </div>
        <div className="form-group">
          <label>Owner</label>
          <select className="select" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>
            {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Next follow up date</label>
        <DatePicker
          value={form.next_follow_up_date}
          onChange={(next_follow_up_date) => setForm({ ...form, next_follow_up_date })}
          placeholder="Select follow up date"
        />
        <p className="field-hint">Optional, used to schedule the first follow up</p>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea className="textarea" rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      </div>
    </Modal>
  );
}
