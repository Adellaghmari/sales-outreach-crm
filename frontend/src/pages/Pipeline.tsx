import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Deal, PipelineStage } from '../types';
import { formatCurrency, formatDate, formatStageLabel } from '../utils/format';
import './Pipeline.css';

const STAGES = ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

interface PipelineTotals {
  pipeline_value: number;
  expected_revenue: number;
  deal_count: number;
  won_revenue?: number;
  lost_revenue?: number;
  average_deal_size?: number;
  close_risk_count?: number;
}

export function Pipeline() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [totals, setTotals] = useState<PipelineTotals>({ pipeline_value: 0, expected_revenue: 0, deal_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPipeline = () => {
    setLoading(true);
    api.getPipeline()
      .then((data) => {
        setStages(data.stages);
        setTotals(data.totals as PipelineTotals);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPipeline(); }, []);

  const handleStageChange = async (dealId: number, newStage: string) => {
    await api.updateDealStage(dealId, newStage);
    loadPipeline();
  };

  if (loading) return <div className="loading-state">Loading pipeline...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="pipeline-page">
      <div className="page-header">
        <h1>Pipeline Board</h1>
        <p>Track deal progress, forecast revenue and manage close risk</p>
      </div>

      <div className="pipeline-summary">
        <SummaryItem label="Open pipeline" value={formatCurrency(totals.pipeline_value)} />
        <SummaryItem label="Expected revenue" value={formatCurrency(totals.expected_revenue)} accent />
        <SummaryItem label="Won revenue" value={formatCurrency(totals.won_revenue || 0)} success />
        <SummaryItem label="Lost revenue" value={formatCurrency(totals.lost_revenue || 0)} danger />
        <SummaryItem label="Avg deal size" value={formatCurrency(totals.average_deal_size || 0)} />
        <SummaryItem label="Close risk" value={String(totals.close_risk_count || 0)} />
      </div>

      <div className="kanban-board">
        {stages.filter((s) => STAGES.includes(s.slug)).map((stage) => (
          <div key={stage.slug} className="kanban-column">
            <div className="kanban-column-header" style={{ borderTopColor: stage.color }}>
              <div>
                <h3>{formatStageLabel(stage.slug)}</h3>
                <span className="kanban-count">{stage.deal_count} deals</span>
              </div>
              <div className="kanban-header-values">
                <span className="kanban-stage-value tabular">{formatCurrency(stage.total_value)}</span>
                <span className="kanban-expected tabular">Exp. {formatCurrency(stage.expected_revenue)}</span>
              </div>
            </div>
            <div className="kanban-cards">
              {stage.deals.map((deal) => (
                <DealCard key={deal.id} deal={deal as Deal & Record<string, unknown>} onStageChange={handleStageChange} isClosed={stage.slug === 'won' || stage.slug === 'lost'} />
              ))}
              {stage.deals.length === 0 && (
                <div className="kanban-empty">No deals in this stage</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, accent, success, danger }: { label: string; value: string; accent?: boolean; success?: boolean; danger?: boolean }) {
  return (
    <div className="summary-stat">
      <span className="summary-label">{label}</span>
      <span className={`summary-value tabular ${accent ? 'accent' : ''} ${success ? 'success' : ''} ${danger ? 'danger' : ''}`}>{value}</span>
    </div>
  );
}

function DealCard({ deal, onStageChange, isClosed }: { deal: Deal & Record<string, unknown>; onStageChange: (id: number, stage: string) => void; isClosed: boolean }) {
  return (
    <div className={`deal-card priority-${deal.priority || 'low'} ${isClosed ? 'deal-closed' : ''}`}>
      <div className="deal-card-title">{deal.title}</div>
      <div className="deal-card-company">{deal.company_name}</div>
      <div className="deal-card-lead">{deal.first_name} {deal.last_name}</div>
      <div className="deal-card-metrics">
        <span className="deal-value tabular">{formatCurrency(Number(deal.value))}</span>
        <span className="deal-prob tabular">{deal.probability}%</span>
      </div>
      {!isClosed && (
        <div className="deal-expected tabular">Expected {formatCurrency(Number(deal.expected_revenue || 0))}</div>
      )}
      {deal.expected_close_date && !isClosed && (
        <div className="deal-close-date">Close: {formatDate(deal.expected_close_date)}</div>
      )}
      {deal.risk_badge ? <span className="badge badge-risk">{String(deal.risk_badge)}</span> : null}
      {deal.status === 'won' && (
        <div className="deal-outcome won">
          <div>Closed: {deal.closed_date ? formatDate(deal.closed_date as string) : 'Not set'}</div>
          <div>{deal.reason_won as string}</div>
        </div>
      )}
      {deal.status === 'lost' && (
        <div className="deal-outcome lost">
          <div>Lost: {deal.closed_date ? formatDate(deal.closed_date as string) : 'Not set'}</div>
          <div>{deal.reason_lost as string}</div>
          <div className="lesson">{deal.lesson_learned as string}</div>
        </div>
      )}
      <div className="deal-next-action">{deal.next_action}</div>
      {!isClosed && (
        <select className="select deal-stage-select" value={deal.stage} onChange={(e) => onStageChange(deal.id, e.target.value)}>
          {STAGES.map((s) => <option key={s} value={s}>{formatStageLabel(s)}</option>)}
        </select>
      )}
    </div>
  );
}
