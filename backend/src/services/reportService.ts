import { query } from '../db';
import { buildForecastedRevenue } from '../utils/forecastHelpers';
import { resolveFollowUpDates } from '../utils/followUpSchedule';

export async function getReports() {
  const [
    pipelineByStage,
    conversion,
    replyRate,
    leadSources,
    wonLost,
    avgDealValue,
    followUpCompletion,
    topLeads,
    openDealsForForecast,
  ] = await Promise.all([
    query(`
      SELECT stage, COUNT(*)::int AS count, COALESCE(SUM(value),0)::float AS total_value,
        COALESCE(SUM(value * probability / 100.0),0)::float AS expected_revenue
      FROM deals WHERE status = 'open' GROUP BY stage
      ORDER BY CASE stage
        WHEN 'new_lead' THEN 1 WHEN 'contacted' THEN 2 WHEN 'qualified' THEN 3
        WHEN 'proposal' THEN 4 WHEN 'negotiation' THEN 5 ELSE 6 END
    `),
    query(`
      SELECT
        COUNT(*)::int AS total_leads,
        COUNT(*) FILTER (WHERE status = 'converted')::int AS converted,
        COUNT(*) FILTER (WHERE status = 'qualified')::int AS qualified
      FROM leads
    `),
    query(`
      SELECT COUNT(*) FILTER (WHERE status IN ('sent','replied'))::int AS sent,
        COUNT(*) FILTER (WHERE status = 'replied')::int AS replied
      FROM outreach_messages
    `),
    query(`SELECT lead_source, COUNT(*)::int AS count FROM leads GROUP BY lead_source ORDER BY count DESC`),
    query(`
      SELECT status, COUNT(*)::int AS count, COALESCE(SUM(value),0)::float AS total_value
      FROM deals WHERE status IN ('won','lost','open') GROUP BY status
    `),
    query(`SELECT COALESCE(AVG(value),0)::float AS avg_value FROM deals WHERE status IN ('open','won')`),
    query(`SELECT id, due_date, status FROM follow_ups`),
    query(`
      SELECT l.id, l.first_name, l.last_name, l.score, l.status, c.name AS company_name
      FROM leads l LEFT JOIN companies c ON c.id = l.company_id
      WHERE l.status NOT IN ('not_interested') ORDER BY l.score DESC LIMIT 8
    `),
    query(`
      SELECT expected_close_date, value, probability, status
      FROM deals WHERE status = 'open'
    `),
  ]);

  const conv = conversion.rows[0];
  const conversionRate = conv.total_leads > 0 ? Math.round((conv.converted / conv.total_leads) * 100) : 0;
  const reply = replyRate.rows[0];
  const replyRatePct = reply.sent > 0 ? Math.round((reply.replied / reply.sent) * 100) : 0;
  const resolvedFollowUps = followUpCompletion.rows.map((row) =>
    resolveFollowUpDates(row.id, {
      due_date: String(row.due_date).split('T')[0],
      status: row.status,
    }),
  );
  const total = resolvedFollowUps.length;
  const completed = resolvedFollowUps.filter((f) => f.status === 'completed').length;
  const overdue = resolvedFollowUps.filter((f) => f.status === 'overdue').length;
  const followUpRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    pipelineByStage: pipelineByStage.rows,
    conversionRate,
    qualifiedLeads: conv.qualified,
    totalLeads: conv.total_leads,
    replyRate: replyRatePct,
    leadSourcePerformance: leadSources.rows,
    wonVsLost: wonLost.rows,
    averageDealValue: avgDealValue.rows[0].avg_value,
    followUpCompletionRate: followUpRate,
    overdueFollowUps: overdue,
    topPriorityLeads: topLeads.rows,
    forecastedRevenue: buildForecastedRevenue(openDealsForForecast.rows),
    totals: {
      pipelineValue: pipelineByStage.rows.reduce((s, r) => s + Number(r.total_value), 0),
      expectedRevenue: pipelineByStage.rows.reduce((s, r) => s + Number(r.expected_revenue), 0),
    },
  };
}
