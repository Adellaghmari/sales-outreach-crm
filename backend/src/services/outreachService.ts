import { query } from '../db';

interface OutreachFilters {
  status?: string;
  channel?: string;
  search?: string;
}

export async function getOutreachMessages(filters: OutreachFilters = {}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.status) {
    conditions.push(`o.status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }
  if (filters.channel) {
    conditions.push(`o.channel = $${paramIndex}`);
    params.push(filters.channel);
    paramIndex++;
  }
  if (filters.search) {
    conditions.push(`(o.subject ILIKE $${paramIndex} OR l.first_name ILIKE $${paramIndex} OR l.last_name ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT o.*, l.first_name, l.last_name, l.email AS lead_email, c.name AS company_name
     FROM outreach_messages o
     JOIN leads l ON l.id = o.lead_id
     LEFT JOIN companies c ON c.id = l.company_id
     ${whereClause}
     ORDER BY o.created_at DESC`,
    params
  );
  return result.rows;
}

export async function createOutreachMessage(data: Record<string, unknown>) {
  const result = await query(
    `INSERT INTO outreach_messages (lead_id, subject, body, channel, status, sent_at)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      data.lead_id, data.subject, data.body, data.channel || 'email',
      data.status || 'draft', data.status === 'sent' ? new Date() : null,
    ]
  );

  if (data.status === 'sent') {
    await query(
      `INSERT INTO activities (lead_id, type, title, description, created_by) VALUES ($1,'email',$2,$3,'Alex Morgan')`,
      [data.lead_id, `Outreach sent: ${data.subject}`, 'Outreach message marked as sent.']
    );
  }

  return result.rows[0];
}

export async function updateOutreachMessage(id: number, data: Record<string, unknown>) {
  const sentAt = data.status === 'sent' || data.status === 'replied' ? new Date() : data.sent_at;
  const result = await query(
    `UPDATE outreach_messages SET
      subject = COALESCE($1, subject),
      body = COALESCE($2, body),
      channel = COALESCE($3, channel),
      status = COALESCE($4, status),
      sent_at = COALESCE($5, sent_at)
     WHERE id = $6 RETURNING *`,
    [data.subject, data.body, data.channel, data.status, sentAt, id]
  );

  if (data.status === 'sent' && result.rows[0]) {
    await query(
      `INSERT INTO activities (lead_id, type, title, description, created_by) VALUES ($1,'email',$2,$3,'Alex Morgan')`,
      [result.rows[0].lead_id, `Outreach sent: ${result.rows[0].subject}`, 'Outreach message marked as sent.']
    );
  }

  if (data.status === 'replied' && result.rows[0]) {
    await query(
      `UPDATE leads SET status = CASE WHEN status IN ('new','contacted') THEN 'responded' ELSE status END, updated_at = NOW() WHERE id = $1`,
      [result.rows[0].lead_id]
    );
  }

  return result.rows[0] || null;
}
