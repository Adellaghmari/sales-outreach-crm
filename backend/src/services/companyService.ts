import { query } from '../db';

export async function getCompanies(search?: string) {
  const params: unknown[] = [];
  let where = '';
  if (search) {
    where = 'WHERE name ILIKE $1 OR industry ILIKE $1';
    params.push(`%${search}%`);
  }
  const result = await query(
    `SELECT c.*,
      (SELECT COUNT(*)::int FROM leads l WHERE l.company_id = c.id) AS lead_count,
      (SELECT COUNT(*)::int FROM deals d WHERE d.company_id = c.id AND d.status = 'open') AS open_deals
     FROM companies c ${where} ORDER BY c.name`,
    params
  );
  return result.rows;
}

export async function getCompanyById(id: number) {
  const result = await query(`SELECT * FROM companies WHERE id = $1`, [id]);
  if (result.rows.length === 0) return null;

  const [leads, deals] = await Promise.all([
    query(`SELECT * FROM leads WHERE company_id = $1 ORDER BY score DESC`, [id]),
    query(`SELECT * FROM deals WHERE company_id = $1 ORDER BY created_at DESC`, [id]),
  ]);

  return { ...result.rows[0], leads: leads.rows, deals: deals.rows };
}

export async function createCompany(data: Record<string, unknown>) {
  const result = await query(
    `INSERT INTO companies (name, industry, website, size, country, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [data.name, data.industry, data.website, data.size, data.country, data.status || 'prospect']
  );
  return result.rows[0];
}

export async function updateCompany(id: number, data: Record<string, unknown>) {
  const result = await query(
    `UPDATE companies SET name = COALESCE($1,name), industry = COALESCE($2,industry), website = COALESCE($3,website),
      size = COALESCE($4,size), country = COALESCE($5,country), status = COALESCE($6,status) WHERE id = $7 RETURNING *`,
    [data.name, data.industry, data.website, data.size, data.country, data.status, id]
  );
  return result.rows[0] || null;
}

export async function deleteCompany(id: number) {
  const result = await query(`DELETE FROM companies WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0] || null;
}
