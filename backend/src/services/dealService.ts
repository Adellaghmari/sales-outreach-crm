import { query } from '../db';
import { computePipelineTotals } from '../utils/dealMetrics';
import { resolveDealCloseDate, resolveDealClosedDate } from '../utils/dealSchedule';
import { getDealNextAction } from '../utils/recommendations';

interface DealFilters {
  search?: string;
  stage?: string;
  status?: string;
  minValue?: number;
  owner?: string;
  sortBy?: string;
  sortOrder?: string;
}

const STAGE_PROBABILITY: Record<string, number> = {
  new_lead: 10,
  contacted: 25,
  qualified: 45,
  proposal: 60,
  negotiation: 75,
  won: 100,
  lost: 0,
};

export async function getDeals(filters: DealFilters = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.search) {
    conditions.push(`(d.title ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex} OR l.first_name ILIKE $${paramIndex} OR l.last_name ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }
  if (filters.stage) {
    conditions.push(`d.stage = $${paramIndex}`);
    params.push(filters.stage);
    paramIndex++;
  }
  if (filters.status) {
    conditions.push(`d.status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }
  if (filters.minValue !== undefined) {
    conditions.push(`d.value >= $${paramIndex}`);
    params.push(filters.minValue);
    paramIndex++;
  }
  if (filters.owner) {
    conditions.push(`l.owner ILIKE $${paramIndex}`);
    params.push(`%${filters.owner}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortMap: Record<string, string> = {
    value: 'd.value',
    expected_close_date: 'd.expected_close_date',
    created_at: 'd.created_at',
    probability: 'd.probability',
  };
  const sortField = sortMap[filters.sortBy || 'expected_close_date'] || 'd.expected_close_date';
  const sortOrder = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';

  const result = await query(
    `SELECT d.*, c.name AS company_name, l.first_name, l.last_name, l.owner,
      (d.value * d.probability / 100.0) AS expected_revenue
     FROM deals d
     LEFT JOIN companies c ON c.id = d.company_id
     LEFT JOIN leads l ON l.id = d.lead_id
     ${whereClause}
     ORDER BY ${sortField} ${sortOrder} NULLS LAST`,
    params
  );

  return result.rows.map(enrichDeal);
}

export interface EnrichedDeal {
  id: number;
  company_id?: number;
  lead_id?: number;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date?: string;
  status: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  owner?: string;
  expected_revenue: number;
  days_to_close: number | null;
  next_action: string;
  priority: string;
  risk_badge?: string | null;
  closed_date?: string;
  [key: string]: unknown;
}

export function enrichDeal(deal: Record<string, unknown>): EnrichedDeal {
  const id = Number(deal.id);
  const status = String(deal.status);
  const expected_close_date = resolveDealCloseDate(
    id,
    String(deal.expected_close_date || ''),
    status,
  );
  const closed_date = resolveDealClosedDate(id, deal.closed_date as string | undefined, status);
  const daysToClose = expected_close_date
    ? Math.ceil((new Date(expected_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  let risk_badge: string | null = null;
  if (status === 'open' && daysToClose !== null && daysToClose <= 7 && daysToClose >= 0) {
    risk_badge = 'Close soon';
  }
  if (status === 'open' && daysToClose !== null && daysToClose < 0) {
    risk_badge = 'Past close date';
  }

  const enriched = {
    ...deal,
    expected_close_date,
    closed_date,
    expected_revenue: Number(deal.value) * Number(deal.probability) / 100,
    days_to_close: daysToClose,
    risk_badge,
    next_action: getDealNextAction({
      stage: deal.stage as string,
      status,
      probability: Number(deal.probability),
      days_to_close: daysToClose,
      has_follow_up: true,
    }),
    priority: daysToClose !== null && daysToClose <= 7 ? 'high' : daysToClose !== null && daysToClose <= 14 ? 'medium' : 'low',
  };
  return enriched as unknown as EnrichedDeal;
}

export async function getDealById(id: number) {
  const result = await query(
    `SELECT d.*, c.name AS company_name, l.first_name, l.last_name, l.owner, l.email AS lead_email
     FROM deals d
     LEFT JOIN companies c ON c.id = d.company_id
     LEFT JOIN leads l ON l.id = d.lead_id
     WHERE d.id = $1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return enrichDeal(result.rows[0]);
}

export async function getPipeline() {
  const stages = await query(`SELECT * FROM pipeline_stages ORDER BY sort_order`);
  const allDeals = await getDeals();
  const openDeals = allDeals.filter((d) => d.status === 'open');

  const pipeline = stages.rows.map((stage) => {
    const stageDeals = allDeals.filter((d) => d.stage === stage.slug);
    const totalValue = stageDeals.reduce((sum, d) => sum + Number(d.value), 0);
    const expectedRevenue = stageDeals.reduce((sum, d) => sum + Number(d.expected_revenue), 0);
    return {
      ...stage,
      deals: stageDeals,
      deal_count: stageDeals.length,
      total_value: totalValue,
      expected_revenue: expectedRevenue,
    };
  });

  return { stages: pipeline, totals: computePipelineTotals(allDeals) };
}

export async function createDeal(data: Record<string, unknown>) {
  const result = await query(
    `INSERT INTO deals (company_id, lead_id, title, value, stage, probability, expected_close_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      data.company_id, data.lead_id, data.title, data.value || 0,
      data.stage || 'new_lead', data.probability || 10,
      data.expected_close_date, data.status || 'open',
    ]
  );
  return enrichDeal(result.rows[0]);
}

export async function updateDeal(id: number, data: Record<string, unknown>) {
  const result = await query(
    `UPDATE deals SET
      company_id = COALESCE($1, company_id),
      lead_id = COALESCE($2, lead_id),
      title = COALESCE($3, title),
      value = COALESCE($4, value),
      stage = COALESCE($5, stage),
      probability = COALESCE($6, probability),
      expected_close_date = COALESCE($7, expected_close_date),
      status = COALESCE($8, status),
      updated_at = NOW()
     WHERE id = $9 RETURNING *`,
    [
      data.company_id, data.lead_id, data.title, data.value, data.stage,
      data.probability, data.expected_close_date, data.status, id,
    ]
  );
  return result.rows[0] ? enrichDeal(result.rows[0]) : null;
}

export async function updateDealStage(id: number, stage: string) {
  const probability = STAGE_PROBABILITY[stage] ?? 10;
  let status = 'open';
  if (stage === 'won') status = 'won';
  if (stage === 'lost') status = 'lost';

  const result = await query(
    `UPDATE deals SET stage = $1, probability = $2, status = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
    [stage, probability, status, id]
  );
  return result.rows[0] ? enrichDeal(result.rows[0]) : null;
}

export async function deleteDeal(id: number) {
  const result = await query(`DELETE FROM deals WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
}
