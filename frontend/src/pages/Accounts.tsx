import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Company } from '../types';
import { StageBadge, StatusBadge } from '../components/ui/Badge';
import { formatCurrency, formatDate } from '../utils/format';
import './Accounts.css';

interface Account extends Company {
  total_deal_value?: number;
  primary_lead?: string;
  primary_lead_id?: number;
  last_activity?: string;
  last_activity_title?: string;
  next_action?: string;
}

interface AccountDetail {
  leads?: { id: number; first_name: string; last_name: string; title: string }[];
  deals?: { id: number; title: string; value: number; stage: string }[];
  activities?: { id: number; title: string; type: string; created_at: string }[];
  next_action?: string;
}

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Account | null>(null);
  const [detail, setDetail] = useState<AccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openAccount = async (account: Account) => {
    setSelected(account);
    setDetailLoading(true);
    try {
      const d = await api.getCompany(account.id);
      setDetail(d as AccountDetail);
    } finally {
      setDetailLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies(search || undefined);
      const list = data as Account[];
      setAccounts(list);
      if (list.length > 0) {
        const current = selected && list.find((a) => a.id === selected.id);
        await openAccount(current || list[0]);
      } else {
        setSelected(null);
        setDetail(null);
      }
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = () => load();

  return (
    <div className="accounts-page">
      <div className="page-header">
        <h1>Accounts</h1>
        <p>Company accounts with pipeline value, primary contacts and recommended actions</p>
      </div>

      <div className="filter-bar">
        <input className="input" placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        <button className="btn btn-secondary btn-sm" onClick={handleSearch}>Search</button>
      </div>

      {loading ? <div className="loading-state">Loading accounts...</div> : (
        <div className="accounts-layout">
          <div className="accounts-grid">
            {accounts.map((a) => (
              <div key={a.id} className={`account-card card ${selected?.id === a.id ? 'selected' : ''}`} onClick={() => openAccount(a)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openAccount(a)}>
                <div className="account-card-header">
                  <h3>{a.name}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <div className="account-meta">{a.industry} · {a.size} · {a.country}</div>
                <div className="account-stats">
                  <div><span className="label">Open deals</span><span className="tabular">{a.open_deals || 0}</span></div>
                  <div><span className="label">Deal value</span><span className="tabular">{formatCurrency(a.total_deal_value || 0)}</span></div>
                  <div><span className="label">Leads</span><span className="tabular">{a.lead_count || 0}</span></div>
                </div>
                {a.primary_lead && <div className="account-primary"><span className="label">Primary contact</span><span>{a.primary_lead}</span></div>}
                {a.last_activity_title && <div className="account-activity"><span className="label">Last activity</span><span>{a.last_activity_title}</span></div>}
                {a.next_action && <div className="account-action">{a.next_action}</div>}
              </div>
            ))}
          </div>

          <div className="account-detail-panel">
            {selected ? (
              <div className="card account-detail-card">
                <div className="card-header account-detail-title">{selected.name}</div>
                <div className="card-body">
                  {detailLoading && <div className="detail-loading">Loading account details...</div>}
                  {!detailLoading && (
                    <>
                      <div className="detail-fields">
                        <div className="detail-row"><span className="label">Industry</span><span>{selected.industry}</span></div>
                        <div className="detail-row"><span className="label">Country</span><span>{selected.country}</span></div>
                        <div className="detail-row"><span className="label">Company size</span><span>{selected.size}</span></div>
                        <div className="detail-row"><span className="label">Status</span><StatusBadge status={selected.status} /></div>
                        <div className="detail-row"><span className="label">Open deals</span><span className="tabular">{selected.open_deals || 0}</span></div>
                        <div className="detail-row"><span className="label">Deal value</span><span className="tabular">{formatCurrency(selected.total_deal_value || 0)}</span></div>
                        {selected.primary_lead && (
                          <div className="detail-row">
                            <span className="label">Primary lead</span>
                            {selected.primary_lead_id ? (
                              <Link to={`/leads/${selected.primary_lead_id}`} className="detail-link-inline">{selected.primary_lead}</Link>
                            ) : (
                              <span>{selected.primary_lead}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {detail?.next_action && <div className="detail-action">{detail.next_action}</div>}
                      <h4 className="detail-section">Related leads</h4>
                      {(detail?.leads || []).length === 0 ? (
                        <p className="detail-empty">No leads linked yet</p>
                      ) : (detail?.leads || []).map((l) => (
                        <Link key={l.id} to={`/leads/${l.id}`} className="detail-link">{l.first_name} {l.last_name} · {l.title}</Link>
                      ))}
                      <h4 className="detail-section">Related deals</h4>
                      {(detail?.deals || []).length === 0 ? (
                        <p className="detail-empty">No open deals</p>
                      ) : (detail?.deals || []).map((d) => (
                        <div key={d.id} className="detail-deal">
                          <span className="detail-deal-title">{d.title}</span>
                          <span className="detail-deal-meta">{formatCurrency(d.value)} · <StageBadge stage={d.stage} /></span>
                        </div>
                      ))}
                      <h4 className="detail-section">Recent activity</h4>
                      {(detail?.activities || []).length === 0 ? (
                        <p className="detail-empty">No recent activity</p>
                      ) : (detail?.activities || []).slice(0, 5).map((act) => (
                        <div key={act.id} className="detail-activity-item">
                          <span className="detail-activity-title">{act.title}</span>
                          <span className="detail-activity-meta">{formatDate(act.created_at)} · {act.type}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="card empty-panel">
                <div className="card-body empty-state-box">No accounts found</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
