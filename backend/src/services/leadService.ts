import { query } from '../db';
import { getScoreLabel } from '../utils/leadScoring';
import { getLeadNextAction } from '../utils/recommendations';

interface LeadFilters {
  search?: string;
  status?: string;
  minScore?: number;
  maxScore?: number;
  source?: string;
  sortBy?: string;
  sortOrder?: string;
}

export async function getLeads(filters: LeadFilters = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.search) {
    conditions.push(`(
      l.first_name ILIKE $${paramIndex} OR l.last_name ILIKE $${paramIndex} OR
      l.email ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex} OR l.title ILIKE $${paramIndex}
    )`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }
  if (filters.status) {
    conditions.push(`l.status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }
  if (filters.minScore !== undefined) {
    conditions.push(`l.score >= $${paramIndex}`);
    params.push(filters.minScore);
    paramIndex++;
  }
  if (filters.maxScore !== undefined) {
    conditions.push(`l.score <= $${paramIndex}`);
    params.push(filters.maxScore);
    paramIndex++;
  }
  if (filters.source) {
    conditions.push(`l.lead_source ILIKE $${paramIndex}`);
    params.push(`%${filters.source}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortMap: Record<string, string> = {
    score: 'l.score',
    created_at: 'l.created_at',
    last_activity: 'last_activity',
    name: 'l.last_name',
  };
  const sortField = sortMap[filters.sortBy || 'score'] || 'l.score';
  const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

  const result = await query(
    `SELECT l.*, c.name AS company_name, c.industry, c.size AS company_size,
      (SELECT MAX(a.created_at) FROM activities a WHERE a.lead_id = l.id) AS last_activity,
      (SELECT MIN(f.due_date) FROM follow_ups f WHERE f.lead_id = l.id AND f.status IN ('pending', 'overdue')) AS next_follow_up
     FROM leads l
     LEFT JOIN companies c ON c.id = l.company_id
     ${whereClause}
     ORDER BY ${sortField} ${sortOrder} NULLS LAST`,
    params
  );

  return result.rows.map((lead) => ({
    ...lead,
    score_label: getScoreLabel(lead.score),
  }));
}

export async function getLeadById(id: number) {
  const leadResult = await query(
    `SELECT l.*, c.name AS company_name, c.industry, c.website, c.size AS company_size, c.country, c.status AS company_status
     FROM leads l
     LEFT JOIN companies c ON c.id = l.company_id
     WHERE l.id = $1`,
    [id]
  );

  if (leadResult.rows.length === 0) return null;

  const lead = leadResult.rows[0];

  const [activities, notes, tasks, followUps, outreach, deals, outreachStats] = await Promise.all([
    query(`SELECT * FROM activities WHERE lead_id = $1 ORDER BY created_at DESC`, [id]),
    query(`SELECT * FROM lead_notes WHERE lead_id = $1 ORDER BY created_at DESC`, [id]),
    query(`SELECT * FROM tasks WHERE related_lead_id = $1 ORDER BY due_date ASC`, [id]),
    query(`SELECT f.*, d.title AS deal_title FROM follow_ups f LEFT JOIN deals d ON d.id = f.deal_id WHERE f.lead_id = $1 ORDER BY f.due_date ASC`, [id]),
    query(`SELECT * FROM outreach_messages WHERE lead_id = $1 ORDER BY created_at DESC`, [id]),
    query(`SELECT * FROM deals WHERE lead_id = $1 ORDER BY created_at DESC`, [id]),
    query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'replied')::int AS replied FROM outreach_messages WHERE lead_id = $1`, [id]),
  ]);

  const hasReply = outreachStats.rows[0].replied > 0;
  const outreachCount = outreachStats.rows[0].total;
  const overdueFollowUp = followUps.rows.some((f) => f.status === 'overdue');
  const relatedDeal = deals.rows[0] || null;

  const nextAction = getLeadNextAction({
    status: lead.status,
    score: lead.score,
    has_outreach: outreachCount > 0,
    has_reply: hasReply,
    outreach_count: outreachCount,
    overdue_follow_up: overdueFollowUp,
    has_deal: deals.rows.length > 0,
    deal_stage: relatedDeal?.stage,
  });

  return {
    ...lead,
    score_label: getScoreLabel(lead.score),
    next_action: nextAction,
    activities: activities.rows,
    notes: notes.rows,
    tasks: tasks.rows,
    follow_ups: followUps.rows,
    outreach_messages: outreach.rows,
    deals: deals.rows,
    communication_history: [
      ...activities.rows.map((a) => ({ ...a, source: 'activity' })),
      ...outreach.rows.map((o) => ({ ...o, source: 'outreach', title: o.subject, type: o.channel })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  };
}

export async function createLead(data: Record<string, unknown>) {
  const result = await query(
    `INSERT INTO leads (company_id, first_name, last_name, title, email, phone, linkedin_url, lead_source, status, score, owner)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      data.company_id, data.first_name, data.last_name, data.title, data.email,
      data.phone, data.linkedin_url, data.lead_source, data.status || 'new',
      data.score || 30, data.owner || 'Alex Morgan',
    ]
  );
  return result.rows[0];
}

export async function updateLead(id: number, data: Record<string, unknown>) {
  const result = await query(
    `UPDATE leads SET
      company_id = COALESCE($1, company_id),
      first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name),
      title = COALESCE($4, title),
      email = COALESCE($5, email),
      phone = COALESCE($6, phone),
      linkedin_url = COALESCE($7, linkedin_url),
      lead_source = COALESCE($8, lead_source),
      status = COALESCE($9, status),
      score = COALESCE($10, score),
      owner = COALESCE($11, owner),
      updated_at = NOW()
     WHERE id = $12 RETURNING *`,
    [
      data.company_id, data.first_name, data.last_name, data.title, data.email,
      data.phone, data.linkedin_url, data.lead_source, data.status, data.score,
      data.owner, id,
    ]
  );
  return result.rows[0] || null;
}

export async function deleteLead(id: number) {
  const result = await query(`DELETE FROM leads WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
}
