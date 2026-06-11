import { query } from '../db';

export async function getTemplates(category?: string, search?: string) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }
  if (search) {
    conditions.push(`(name ILIKE $${paramIndex} OR subject ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(`SELECT * FROM email_templates ${whereClause} ORDER BY name`, params);
  return result.rows;
}

export async function getTemplateById(id: number) {
  const result = await query(`SELECT * FROM email_templates WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

export async function createTemplate(data: Record<string, unknown>) {
  const result = await query(
    `INSERT INTO email_templates (name, category, subject, body) VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.name, data.category, data.subject, data.body]
  );
  return result.rows[0];
}

export async function updateTemplate(id: number, data: Record<string, unknown>) {
  const result = await query(
    `UPDATE email_templates SET name = COALESCE($1,name), category = COALESCE($2,category),
      subject = COALESCE($3,subject), body = COALESCE($4,body) WHERE id = $5 RETURNING *`,
    [data.name, data.category, data.subject, data.body, id]
  );
  return result.rows[0] || null;
}
