import { query } from '../db';
import { getLeadNextAction } from '../utils/recommendations';
import {
  groupFollowUps,
  pinFollowUpDate,
  resolveFollowUpDates,
} from '../utils/followUpSchedule';

interface FollowUpFilters {
  status?: string;
  priority?: string;
  owner?: string;
}

export async function getFollowUps(filters: FollowUpFilters = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.status) {
    conditions.push(`f.status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }
  if (filters.priority) {
    conditions.push(`f.priority = $${paramIndex}`);
    params.push(filters.priority);
    paramIndex++;
  }
  if (filters.owner) {
    conditions.push(`l.owner ILIKE $${paramIndex}`);
    params.push(`%${filters.owner}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT f.*, l.first_name, l.last_name, l.owner, l.status AS lead_status, l.score,
      c.name AS company_name, d.title AS deal_title
     FROM follow_ups f
     JOIN leads l ON l.id = f.lead_id
     LEFT JOIN companies c ON c.id = l.company_id
     LEFT JOIN deals d ON d.id = f.deal_id
     ${whereClause}
     ORDER BY f.due_date ASC`,
    params
  );

  const enriched = result.rows.map((f) => {
    const dynamic = resolveFollowUpDates(f.id, {
      due_date: String(f.due_date).split('T')[0],
      status: f.status,
    });

    return {
      ...f,
      due_date: dynamic.due_date,
      status: dynamic.status,
      recommended_action: getLeadNextAction({
        status: f.lead_status,
        score: f.score,
        has_outreach: true,
        has_reply: false,
        outreach_count: 1,
        overdue_follow_up: dynamic.status === 'overdue',
        has_deal: !!f.deal_id,
      }),
    };
  });

  return groupFollowUps(enriched);
}

export async function updateFollowUp(id: number, data: Record<string, unknown>) {
  const result = await query(
    `UPDATE follow_ups SET
      due_date = COALESCE($1, due_date),
      priority = COALESCE($2, priority),
      status = COALESCE($3, status),
      reason = COALESCE($4, reason)
     WHERE id = $5 RETURNING *`,
    [data.due_date, data.priority, data.status, data.reason, id]
  );

  if (data.due_date || data.status) {
    pinFollowUpDate(id);
  }

  if (data.status === 'completed' && result.rows[0]) {
    await query(
      `INSERT INTO activities (lead_id, deal_id, type, title, description, created_by)
       VALUES ($1,$2,'follow_up',$3,$4,'Alex Morgan')`,
      [result.rows[0].lead_id, result.rows[0].deal_id, 'Follow up completed', result.rows[0].reason]
    );
  }

  const row = result.rows[0];
  if (!row) return null;

  const dynamic = resolveFollowUpDates(row.id, {
    due_date: String(row.due_date).split('T')[0],
    status: row.status,
  }, { useStored: true });

  return { ...row, due_date: dynamic.due_date, status: dynamic.status };
}
