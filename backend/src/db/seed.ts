import pool from './index';
import {
  demoCompanies,
  demoLeads,
  demoDeals,
  pipelineStages,
  demoTemplates,
  demoActivities,
  demoOutreach,
  demoFollowUps,
  demoNotes,
  demoTasks,
  OWNERS,
} from '../demo/universe';

async function seed() {
  console.log('Clearing existing data...');
  await pool.query(`
    TRUNCATE report_snapshots, tasks, lead_notes, follow_ups, outreach_messages,
    activities, deals, leads, email_templates, pipeline_stages, companies, users
    RESTART IDENTITY CASCADE
  `);

  for (const owner of OWNERS) {
    const email = `${owner.toLowerCase().replace(/\s+/g, '.')}@salesoutreachcrm.com`;
    await pool.query(
      `INSERT INTO users (name, email, role) VALUES ($1, $2, 'sales_rep') ON CONFLICT (email) DO NOTHING`,
      [owner, email]
    );
  }

  const companyIdByDemoId: Record<number, number> = {};
  for (const c of demoCompanies) {
    const result = await pool.query(
      `INSERT INTO companies (name, industry, website, size, country, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [c.name, c.industry, c.website, c.size, c.country, c.status]
    );
    companyIdByDemoId[c.id] = result.rows[0].id;
  }

  for (const s of pipelineStages) {
    await pool.query(
      `INSERT INTO pipeline_stages (name, slug, sort_order, color) VALUES ($1,$2,$3,$4)`,
      [s.name, s.slug, s.sort_order, s.color]
    );
  }

  const leadIdByDemoId: Record<number, number> = {};
  for (const l of demoLeads) {
    const companyId = companyIdByDemoId[l.company_id];
    const result = await pool.query(
      `INSERT INTO leads (company_id, first_name, last_name, title, email, phone, linkedin_url, lead_source, status, score, owner)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [companyId, l.first_name, l.last_name, l.title, l.email, l.phone, l.linkedin_url, l.lead_source, l.status, l.score, l.owner]
    );
    leadIdByDemoId[l.id] = result.rows[0].id;
  }

  const dealIdByDemoId: Record<number, number> = {};
  for (const d of demoDeals) {
    const companyId = companyIdByDemoId[d.company_id];
    const leadId = leadIdByDemoId[d.lead_id];
    const result = await pool.query(
      `INSERT INTO deals (company_id, lead_id, title, value, stage, probability, expected_close_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [companyId, leadId, d.title, d.value, d.stage, d.probability, d.expected_close_date, d.status]
    );
    dealIdByDemoId[d.id] = result.rows[0].id;
  }

  for (const t of demoTemplates) {
    await pool.query(
      `INSERT INTO email_templates (name, category, subject, body) VALUES ($1,$2,$3,$4)`,
      [t.name, t.category, t.subject, t.body]
    );
  }

  for (const a of demoActivities) {
    const leadId = leadIdByDemoId[a.lead_id as number];
    const dealId = a.deal_id ? dealIdByDemoId[a.deal_id as number] : null;
    await pool.query(
      `INSERT INTO activities (lead_id, deal_id, type, title, description, created_by) VALUES ($1,$2,$3,$4,$5,$6)`,
      [leadId, dealId, a.type, a.title, a.description, a.created_by || 'Alex Morgan']
    );
  }

  for (const m of demoOutreach) {
    const leadId = leadIdByDemoId[m.lead_id as number];
    await pool.query(
      `INSERT INTO outreach_messages (lead_id, subject, body, channel, status, sent_at) VALUES ($1,$2,$3,$4,$5,$6)`,
      [leadId, m.subject, m.body, m.channel, m.status, m.sent_at || null]
    );
  }

  for (const f of demoFollowUps) {
    const leadId = leadIdByDemoId[f.lead_id as number];
    const dealId = f.deal_id ? dealIdByDemoId[f.deal_id as number] : null;
    await pool.query(
      `INSERT INTO follow_ups (lead_id, deal_id, due_date, priority, status, reason) VALUES ($1,$2,$3,$4,$5,$6)`,
      [leadId, dealId, f.due_date, f.priority, f.status, f.reason]
    );
  }

  for (const [leadDemoId, notes] of Object.entries(demoNotes)) {
    const leadId = leadIdByDemoId[Number(leadDemoId)];
    for (const n of notes) {
      await pool.query(
        `INSERT INTO lead_notes (lead_id, note, created_by) VALUES ($1,$2,$3)`,
        [leadId, n.note, n.created_by]
      );
    }
  }

  for (const [leadDemoId, tasks] of Object.entries(demoTasks)) {
    const leadId = leadIdByDemoId[Number(leadDemoId)];
    for (const t of tasks) {
      const deal = demoDeals.find((d) => d.lead_id === Number(leadDemoId));
      const dealId = deal ? dealIdByDemoId[deal.id] : null;
      await pool.query(
        `INSERT INTO tasks (title, description, related_lead_id, related_deal_id, due_date, status, priority)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [t.title, t.description || null, leadId, dealId, t.due_date || null, t.status, t.priority]
      );
    }
  }

  console.log(`Seed complete: ${demoCompanies.length} companies, ${demoLeads.length} leads, ${demoDeals.length} deals, ${demoActivities.length} activities, ${demoOutreach.length} outreach, ${demoTemplates.length} templates, ${demoFollowUps.length} follow ups`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
