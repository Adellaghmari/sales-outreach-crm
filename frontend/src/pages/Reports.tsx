import { useEffect, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { api } from '../api/client';
import { ReportsData } from '../types';
import { ScoreBadge } from '../components/ui/Badge';
import { formatCurrency, formatStageLabel } from '../utils/format';
import './Reports.css';

const COLORS = ['#5c2d4a', '#c45c3e', '#d4a056', '#9b6b8a', '#3d8b6e', '#c45c6a'];

interface ExtendedReports extends ReportsData {
  insights?: Record<string, string>;
  insightTexts?: string[];
}

export function Reports() {
  const [data, setData] = useState<ExtendedReports | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports().then((d) => setData(d as ExtendedReports)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading reports...</div>;
  if (!data) return null;

  const stageData = data.pipelineByStage.map((s) => ({ name: formatStageLabel(s.stage), value: s.total_value }));
  const sourceData = data.leadSourcePerformance.map((s) => ({ name: s.lead_source, value: s.count }));

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Sales Reports</h1>
        <p>Executive analytics with actionable pipeline insights</p>
      </div>

      <div className="insight-cards">
        <InsightCard label="Best performing source" value={data.insights?.bestPerformingSource || 'LinkedIn'} />
        <InsightCard label="Highest risk stage" value={formatStageLabel(data.insights?.highestRiskStage || 'negotiation')} />
        <InsightCard label="Strongest segment" value={data.insights?.strongestLeadSegment || 'Hot leads'} />
        <InsightCard label="Forecast confidence" value={data.insights?.forecastConfidence || 'Medium'} />
        <InsightCard label="Follow up trend" value={data.insights?.followUpTrend || 'Below target'} />
        <InsightCard label="Pipeline gap" value={data.insights?.pipelineGap?.includes('stage') ? data.insights.pipelineGap : formatStageLabel(data.insights?.pipelineGap || 'contacted') + ' stage'} />
      </div>

      <div className="stat-grid reports-stats">
        <div className="stat-card"><div className="label">Pipeline value</div><div className="value tabular">{formatCurrency(data.totals.pipelineValue)}</div></div>
        <div className="stat-card"><div className="label">Expected revenue</div><div className="value tabular">{formatCurrency(data.totals.expectedRevenue)}</div></div>
        <div className="stat-card"><div className="label">Reply rate</div><div className="value tabular">{data.replyRate}%</div></div>
        <div className="stat-card"><div className="label">Follow up completion</div><div className="value tabular">{data.followUpCompletionRate}%</div></div>
      </div>

      {(data.insightTexts || []).length > 0 && (
        <div className="insight-text-block card">
          <div className="card-header">Key insights</div>
          <div className="card-body">
            <ul className="insight-list">
              {(data.insightTexts || []).map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="reports-grid">
        <ChartCard title="Pipeline value by stage">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd2" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#5c2d4a" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Lead source performance">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Forecasted revenue">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.forecastedRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd2" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="forecast" stroke="#c45c3e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="card">
          <div className="card-header">Top priority leads</div>
          <div className="card-body">
            {data.topPriorityLeads.map((lead) => (
              <div key={lead.id} className="list-item">
                <Link to={`/leads/${lead.id}`} className="item-link">{lead.first_name} {lead.last_name}</Link>
                <ScoreBadge score={lead.score} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="insight-card">
      <span className="insight-label">{label}</span>
      <span className="insight-value">{value}</span>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return <div className="card chart-card"><div className="card-header">{title}</div><div className="card-body">{children}</div></div>;
}
