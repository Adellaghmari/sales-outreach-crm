import { query } from '../db';

export async function getLeadActivities(leadId: number) {
  const result = await query(
    `SELECT * FROM activities WHERE lead_id = $1 ORDER BY created_at DESC`,
    [leadId]
  );
  return result.rows;
}

export async function createActivity(data: Record<string, unknown>) {
  const result = await query(
    `INSERT INTO activities (lead_id, deal_id, type, title, description, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.lead_id, data.deal_id || null, data.type, data.title, data.description, data.created_by || 'Alex Morgan']
  );
  return result.rows[0];
}
