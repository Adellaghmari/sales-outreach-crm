import { query } from '../db';
import { addDays } from '../utils/dateHelpers';
import {
  countDealsCloseThisWeek,
  countPipelineAtRisk,
  countWarmRepliesWaiting,
  getHighestIntentLead,
} from '../utils/dealMetrics';
import { countFollowUpStats, resolveFollowUpDates } from '../utils/followUpSchedule';
import { resolveActivityCreatedAt, sortActivitiesByRecent } from '../utils/activitySchedule';
import { enrichDeal } from './dealService';
import { buildDashboardPriorities } from '../utils/recommendations';

const priorityRank: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

export async function getDashboardData() {
  const [
    leadStats,
    dealStats,
    outreachStats,
    allFollowUps,
    allDeals,
    repliedOutreach,
    allLeads,
    hotLeads,
    recentActivity,
    pipelineByStage,
    leadSources,
  ] = await Promise.all([
    query(`
      SELECT
        COUNT(*)::int AS total_leads,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new_leads_this_week,
        COUNT(*) FILTER (WHERE status = 'qualified')::int AS qualified_leads
      FROM leads
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open')::int AS open_deals,
        COALESCE(SUM(value) FILTER (WHERE status = 'open'), 0)::float AS pipeline_value,
        COALESCE(SUM(value * probability / 100.0) FILTER (WHERE status = 'open'), 0)::float AS expected_revenue,
        COUNT(*) FILTER (WHERE status = 'won')::int AS won_deals,
        COUNT(*) FILTER (WHERE status = 'lost')::int AS lost_deals
      FROM deals
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('sent', 'replied'))::int AS sent_count,
        COUNT(*) FILTER (WHERE status = 'replied')::int AS replied_count
      FROM outreach_messages
    `),
    query(`
      SELECT f.id, f.reason, f.priority, f.due_date, f.status,
        l.first_name, l.last_name, c.name AS company_name, d.title AS deal_title, d.stage
      FROM follow_ups f
      JOIN leads l ON l.id = f.lead_id
      LEFT JOIN companies c ON c.id = l.company_id
      LEFT JOIN deals d ON d.id = f.deal_id
    `),
    query(`SELECT d.* FROM deals d`),
    query(`SELECT lead_id, status FROM outreach_messages WHERE status = 'replied'`),
    query(`
      SELECT l.id, l.first_name, l.last_name, l.score, l.status, c.name AS company_name
      FROM leads l
      LEFT JOIN companies c ON c.id = l.company_id
    `),
    query(`
      SELECT l.id, l.first_name, l.last_name, l.score, l.status, c.name AS company_name
      FROM leads l
      LEFT JOIN companies c ON c.id = l.company_id
      WHERE l.score >= 70 AND l.status NOT IN ('not_interested', 'converted')
      ORDER BY l.score DESC
      LIMIT 6
    `),
    query(`
      SELECT a.id, a.type, a.title, a.description, a.created_at,
        l.first_name, l.last_name, c.name AS company_name
      FROM activities a
      JOIN leads l ON l.id = a.lead_id
      LEFT JOIN companies c ON c.id = l.company_id
      ORDER BY a.created_at DESC
      LIMIT 10
    `),
    query(`
      SELECT stage, COUNT(*)::int AS count, COALESCE(SUM(value), 0)::float AS total_value
      FROM deals WHERE status = 'open'
      GROUP BY stage ORDER BY
        CASE stage
          WHEN 'new_lead' THEN 1 WHEN 'contacted' THEN 2 WHEN 'qualified' THEN 3
          WHEN 'proposal' THEN 4 WHEN 'negotiation' THEN 5 WHEN 'won' THEN 6 ELSE 7
        END
    `),
    query(`
      SELECT lead_source, COUNT(*)::int AS count
      FROM leads WHERE lead_source IS NOT NULL
      GROUP BY lead_source ORDER BY count DESC
    `),
  ]);

  const today = addDays(0);
  const resolvedFollowUps = allFollowUps.rows.map((row) => {
    const dynamic = resolveFollowUpDates(row.id, {
      due_date: String(row.due_date).split('T')[0],
      status: row.status,
    });
    return { ...row, due_date: dynamic.due_date, status: dynamic.status };
  });

  const enrichedDeals = allDeals.rows.map((row) => enrichDeal(row));
  const openDeals = enrichedDeals.filter((d) => d.status === 'open');
  const closingSoon = openDeals
    .filter((d) => d.days_to_close !== null && d.days_to_close <= 14)
    .sort((a, b) => (a.days_to_close ?? 99) - (b.days_to_close ?? 99))
    .slice(0, 6);

  const followUpStats = countFollowUpStats(resolvedFollowUps);
  const highestIntentLead = getHighestIntentLead(allLeads.rows);
  const todayFollowUps = resolvedFollowUps
    .filter((f) => f.due_date === today && f.status !== 'completed')
    .sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0))
    .slice(0, 8);
  const priorities = resolvedFollowUps
    .filter((f) => f.status === 'pending' || f.status === 'overdue')
    .sort((a, b) => {
      const byPriority = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
      if (byPriority !== 0) return byPriority;
      return String(a.due_date).localeCompare(String(b.due_date));
    })
    .slice(0, 10);

  const sentCount = outreachStats.rows[0].sent_count || 0;
  const repliedCount = outreachStats.rows[0].replied_count || 0;
  const replyRate = sentCount > 0 ? Math.round((repliedCount / sentCount) * 100) : 0;

  const totalLeads = leadStats.rows[0].total_leads || 0;
  const convertedLeads = await query(`SELECT COUNT(*)::int AS count FROM leads WHERE status = 'converted'`);
  const conversionRate = totalLeads > 0
    ? Math.round((convertedLeads.rows[0].count / totalLeads) * 100)
    : 0;

  const priorityItems = priorities.map((row) => {
    let action = row.reason;
    let label = '';
    if (row.deal_title && row.stage === 'proposal') {
      label = `Move ${row.deal_title} to Proposal`;
      action = 'Move deal stage';
    } else if (row.reason?.includes('follow up') || row.reason?.includes('Follow up')) {
      label = `Follow up with ${row.first_name} at ${row.company_name}`;
    } else if (row.reason?.includes('Call')) {
      label = `Call ${row.company_name} before expected close date`;
    } else if (row.reason?.includes('outreach')) {
      label = `Send outreach to ${row.first_name} at ${row.company_name}`;
    } else {
      label = `${row.reason} for ${row.first_name} at ${row.company_name}`;
    }
    const priorityMap: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    return { type: 'follow_up' as const, action, label, priority: priorityMap[row.priority] || 1 };
  });

  const dealPriorities = closingSoon.slice(0, 3).map((d) => ({
    type: 'deal' as const,
    action: 'Review close timeline',
    label: d.stage === 'negotiation'
      ? `Move ${d.title} closer to close`
      : `Review ${d.title} before close date`,
    priority: d.probability >= 70 ? 3 : 2,
  }));

  const recommendedActions = buildDashboardPriorities([...priorityItems, ...dealPriorities]);

  return {
    stats: {
      totalLeads: leadStats.rows[0].total_leads,
      newLeadsThisWeek: leadStats.rows[0].new_leads_this_week,
      qualifiedLeads: leadStats.rows[0].qualified_leads,
      openDeals: dealStats.rows[0].open_deals,
      pipelineValue: dealStats.rows[0].pipeline_value,
      expectedRevenue: dealStats.rows[0].expected_revenue,
      wonDeals: dealStats.rows[0].won_deals,
      lostDeals: dealStats.rows[0].lost_deals,
      overdueFollowUps: followUpStats.overdue,
      replyRate,
      conversionRate,
    },
    todayFollowUps,
    commandMetrics: {
      pipelineAtRisk: countPipelineAtRisk(openDeals),
      warmRepliesWaiting: countWarmRepliesWaiting(repliedOutreach.rows, allLeads.rows),
      dealsCloseThisWeek: countDealsCloseThisWeek(openDeals),
      expectedRevenueThisMonth: dealStats.rows[0].expected_revenue,
      followUpPressure: followUpStats.followUpPressure,
      highestIntentLead,
    },
    hotLeads: hotLeads.rows,
    closingDeals: closingSoon,
    summaryCopy: followUpStats.overdue > 0
      ? `Today's pipeline has strong momentum, but ${countPipelineAtRisk(openDeals)} deals need follow up before close risk increases.`
      : "Today's pipeline has strong momentum with healthy reply activity across key accounts.",
    recentActivity: sortActivitiesByRecent(
      recentActivity.rows.map((row) => ({
        ...row,
        created_at: resolveActivityCreatedAt(row.id, String(row.created_at)),
      })),
    ),
    pipelineByStage: pipelineByStage.rows,
    leadSources: leadSources.rows,
    recommendedActions,
  };
}
