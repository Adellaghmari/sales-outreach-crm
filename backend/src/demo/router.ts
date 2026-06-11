import { Router, Request, Response } from 'express';
import { addDays, followUpStatus } from '../utils/dateHelpers';
import { countFollowUpStats, groupFollowUps, offsetFromDueDate } from '../utils/followUpSchedule';
import { buildForecastedRevenue } from '../utils/forecastHelpers';
import {
  demoCompanies, demoLeads, demoDeals, demoOutreach, demoFollowUps,
  demoTemplates, demoActivities, demoNotes, demoTasks, pipelineStages,
  enrichDeal, refreshFollowUpStatuses, refreshDemoDealDates, addLead, addOutreach,
} from './universe';
import { refreshDemoActivityDates, sortActivitiesByRecent } from '../utils/activitySchedule';
import {
  countDealsCloseThisWeek,
  countPipelineAtRisk,
  countWarmRepliesWaiting,
  computePipelineTotals,
  getHighestIntentLead,
} from '../utils/dealMetrics';

const router = Router();

const openDeals = () => demoDeals.filter((d) => d.status === 'open');
const wonDeals = () => demoDeals.filter((d) => d.status === 'won');
const lostDeals = () => demoDeals.filter((d) => d.status === 'lost');

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', mode: 'demo', timestamp: new Date().toISOString() });
});

router.get('/dashboard', (_req, res) => {
  refreshFollowUpStatuses();
  refreshDemoDealDates();
  refreshDemoActivityDates(demoActivities);
  const open = openDeals();
  const pipelineValue = open.reduce((s, d) => s + d.value, 0);
  const expectedRevenue = open.reduce((s, d) => s + (d.expected_revenue || 0), 0);
  const followUpStats = countFollowUpStats(demoFollowUps as { due_date: string; status: string }[]);
  const overdue = followUpStats.overdue;
  const dueToday = demoFollowUps.filter((f) => String(f.due_date) === addDays(0) && f.status !== 'completed');
  const pipelineAtRisk = countPipelineAtRisk(open);
  const warmReplies = countWarmRepliesWaiting(
    demoOutreach as { lead_id: number; status: string }[],
    demoLeads,
  );
  const dealsCloseThisWeek = countDealsCloseThisWeek(open);
  const highestIntentLead = getHighestIntentLead(demoLeads);

  res.json({
    success: true,
    data: {
      stats: {
        totalLeads: demoLeads.length,
        newLeadsThisWeek: demoLeads.filter((l) => new Date(l.created_at) > new Date(addDays(-7))).length || 4,
        qualifiedLeads: demoLeads.filter((l) => l.status === 'qualified').length,
        openDeals: open.length,
        pipelineValue,
        expectedRevenue,
        wonDeals: wonDeals().length,
        lostDeals: lostDeals().length,
        overdueFollowUps: overdue,
        replyRate: Math.round((demoOutreach.filter((o) => o.status === 'replied').length / Math.max(demoOutreach.filter((o) => o.status !== 'draft').length, 1)) * 100),
        conversionRate: Math.round((demoLeads.filter((l) => l.status === 'converted').length / demoLeads.length) * 100),
      },
      summaryCopy: overdue > 0
        ? `Today's pipeline has strong momentum, but ${pipelineAtRisk} deals need follow up before close risk increases.`
        : "Today's pipeline has strong momentum with healthy reply activity across key accounts.",
      commandMetrics: {
        pipelineAtRisk,
        warmRepliesWaiting: warmReplies,
        dealsCloseThisWeek,
        expectedRevenueThisMonth: expectedRevenue,
        followUpPressure: followUpStats.followUpPressure,
        highestIntentLead,
      },
      todayFollowUps: dueToday,
      hotLeads: demoLeads.filter((l) => l.score >= 70 && !['not_interested', 'converted'].includes(l.status)).slice(0, 6),
      closingDeals: open.filter((d) => (d.days_to_close ?? 99) <= 14).slice(0, 6),
      recentReplies: demoOutreach.filter((o) => o.status === 'replied').slice(0, 5),
      recentActivity: sortActivitiesByRecent(demoActivities as { created_at: string; lead_id: number }[]).slice(0, 10).map((a) => {
        const lead = demoLeads.find((l) => l.id === a.lead_id);
        return { ...a, first_name: lead?.first_name, last_name: lead?.last_name, company_name: lead?.company_name };
      }),
      pipelineByStage: ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'].map((stage) => ({
        stage,
        count: open.filter((d) => d.stage === stage).length,
        total_value: open.filter((d) => d.stage === stage).reduce((s, d) => s + d.value, 0),
      })),
      leadSources: ['LinkedIn', 'Inbound', 'Referral', 'Event', 'Partner', 'Cold outreach'].map((src) => ({
        lead_source: src,
        count: demoLeads.filter((l) => l.lead_source === src).length,
      })).filter((s) => s.count > 0),
      recommendedActions: [
        'Follow up with Amina at Northstar Revenue before negotiation close',
        'Review proposal status with Victor at Mavenly',
        'Send second follow up to Lina at Horizon Grid',
        'Call Samir at Velora Systems before expected close date',
        'Schedule discovery call with Sara at VantaCore',
        'Confirm procurement timeline for OrbitWorks expansion',
      ],
      topDealsRequiringAction: open.filter((d) => (d.days_to_close ?? 99) <= 10).slice(0, 3),
      topLeadsToContact: demoLeads.filter((l) => l.score >= 75).slice(0, 3),
    },
  });
});

router.get('/companies', (req: Request, res: Response) => {
  const search = (req.query.search as string)?.toLowerCase();
  let data = demoCompanies.map((c) => {
    const leads = demoLeads.filter((l) => l.company_id === c.id);
    const deals = demoDeals.filter((d) => d.company_id === c.id && d.status === 'open');
    const primary = leads.sort((a, b) => b.score - a.score)[0];
    const lastAct = demoActivities.filter((a) => leads.some((l) => l.id === a.lead_id)).sort((a, b) => new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime())[0];
    return {
      ...c,
      open_deals: deals.length,
      total_deal_value: deals.reduce((s, d) => s + d.value, 0),
      primary_lead: primary ? `${primary.first_name} ${primary.last_name}` : null,
      primary_lead_id: primary?.id,
      last_activity: lastAct?.created_at || null,
      last_activity_title: lastAct?.title || null,
      next_action: primary?.score >= 75 ? 'Schedule discovery call' : 'Send first outreach email',
    };
  });
  if (search) data = data.filter((c) => c.name.toLowerCase().includes(search) || c.industry?.toLowerCase().includes(search));
  res.json({ success: true, data });
});

router.get('/companies/:id', (req, res) => {
  const company = demoCompanies.find((c) => c.id === Number(req.params.id));
  if (!company) return res.status(404).json({ success: false, error: 'Company not found' });
  const leads = demoLeads.filter((l) => l.company_id === company.id);
  const deals = demoDeals.filter((d) => d.company_id === company.id);
  res.json({
    success: true,
    data: {
      ...company,
      leads,
      deals,
      activities: demoActivities.filter((a) => leads.some((l) => l.id === a.lead_id)),
      next_action: 'Review account pipeline and schedule next touchpoint',
    },
  });
});

router.post('/companies', (req, res) => {
  const id = demoCompanies.length + 1;
  const company = { id, ...req.body, created_at: new Date().toISOString(), lead_count: 0, open_deals: 0, total_deal_value: 0 };
  demoCompanies.push(company);
  res.status(201).json({ success: true, data: company });
});

router.get('/leads', (req: Request, res: Response) => {
  let data = [...demoLeads];
  const search = (req.query.search as string)?.toLowerCase();
  if (search) data = data.filter((l) =>
    `${l.first_name} ${l.last_name}`.toLowerCase().includes(search) ||
    l.company_name?.toLowerCase().includes(search) || l.email?.toLowerCase().includes(search)
  );
  if (req.query.status) data = data.filter((l) => l.status === req.query.status);
  if (req.query.minScore) data = data.filter((l) => l.score >= Number(req.query.minScore));
  if (req.query.source) data = data.filter((l) => l.lead_source?.toLowerCase().includes((req.query.source as string).toLowerCase()));

  const sortBy = (req.query.sortBy as string) || 'score';
  data.sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'last_activity') return new Date(b.last_activity || 0).getTime() - new Date(a.last_activity || 0).getTime();
    if (sortBy === 'name') return a.last_name.localeCompare(b.last_name);
    return 0;
  });
  res.json({ success: true, data });
});

router.post('/leads', (req, res) => {
  const lead = addLead(req.body);
  if (req.body.note) {
    demoNotes[lead.id] = [{ id: 1, note: req.body.note, created_by: lead.owner, created_at: new Date().toISOString() }];
  }
  if (req.body.next_follow_up_date) {
    demoFollowUps.push({
      id: demoFollowUps.length + 1,
      lead_id: lead.id, deal_id: null,
      due_date: req.body.next_follow_up_date,
      priority: 'medium', status: 'pending',
      reason: 'Initial follow up for new lead',
      first_name: lead.first_name, last_name: lead.last_name,
      owner: lead.owner, company_name: lead.company_name,
      deal_title: null, recommended_action: 'Send first outreach email',
    });
    lead.next_follow_up = req.body.next_follow_up_date;
  }
  res.status(201).json({ success: true, data: lead });
});

router.get('/leads/:id', (req, res) => {
  const lead = demoLeads.find((l) => l.id === Number(req.params.id));
  if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
  const outreach = demoOutreach.filter((o) => o.lead_id === lead.id);
  const activities = demoActivities.filter((a) => a.lead_id === lead.id);
  const communication_history = [
    ...activities.map((a) => ({ ...a, source: 'activity' as const })),
    ...outreach.map((o) => ({ ...o, source: 'outreach' as const, title: o.subject, type: o.channel })),
  ].sort((a, b) => new Date(String((a as Record<string, unknown>).created_at)).getTime() - new Date(String((b as Record<string, unknown>).created_at)).getTime());

  res.json({
    success: true,
    data: {
      ...lead,
      website: demoCompanies.find((c) => c.id === lead.company_id)?.website,
      country: demoCompanies.find((c) => c.id === lead.company_id)?.country,
      company_status: demoCompanies.find((c) => c.id === lead.company_id)?.status,
      next_action: lead.score >= 75 ? 'Schedule discovery call' : lead.status === 'new' ? 'Send first outreach email' : 'Follow up after no response',
      suggested_message: `Hi ${lead.first_name}, I wanted to follow up on outreach workflow opportunities at ${lead.company_name}.`,
      notes: demoNotes[lead.id] || [],
      tasks: demoTasks[lead.id] || [],
      follow_ups: demoFollowUps.filter((f) => f.lead_id === lead.id),
      deals: demoDeals.filter((d) => d.lead_id === lead.id),
      outreach_messages: outreach,
      activities,
      communication_history,
    },
  });
});

router.get('/leads/:id/activities', (req, res) => {
  res.json({ success: true, data: demoActivities.filter((a) => a.lead_id === Number(req.params.id)) });
});

router.get('/deals', (req: Request, res: Response) => {
  let data = [...demoDeals];
  if (req.query.status) data = data.filter((d) => d.status === req.query.status);
  if (req.query.stage) data = data.filter((d) => d.stage === req.query.stage);
  res.json({ success: true, data });
});

router.get('/pipeline', (_req, res) => {
  refreshFollowUpStatuses();
  refreshDemoDealDates();
  const stages = pipelineStages.map((stage) => {
    const stageDeals = demoDeals.filter((d) => d.stage === stage.slug);
    return {
      ...stage,
      deals: stageDeals.map(enrichDeal),
      deal_count: stageDeals.length,
      total_value: stageDeals.reduce((s, d) => s + d.value, 0),
      expected_revenue: stageDeals.reduce((s, d) => s + (d.expected_revenue || d.value * d.probability / 100), 0),
    };
  });
  res.json({
    success: true,
    data: {
      stages,
      totals: computePipelineTotals(demoDeals),
    },
  });
});

router.put('/deals/:id/stage', (req, res) => {
  const deal = demoDeals.find((d) => d.id === Number(req.params.id));
  if (!deal) return res.status(404).json({ success: false, error: 'Deal not found' });
  const stage = req.body.stage;
  const probMap: Record<string, number> = { new_lead: 10, contacted: 25, qualified: 45, proposal: 60, negotiation: 75, won: 100, lost: 0 };
  deal.stage = stage;
  deal.probability = probMap[stage] ?? deal.probability;
  if (stage === 'won') { deal.status = 'won'; deal.closed_date = addDays(0); }
  if (stage === 'lost') { deal.status = 'lost'; deal.closed_date = addDays(0); }
  const enriched = enrichDeal(deal);
  Object.assign(deal, enriched);
  res.json({ success: true, data: deal });
});

router.get('/outreach', (req: Request, res: Response) => {
  let data = [...demoOutreach];
  if (req.query.status) data = data.filter((o) => o.status === req.query.status);
  if (req.query.channel) data = data.filter((o) => o.channel === req.query.channel);
  if (req.query.search) {
    const s = (req.query.search as string).toLowerCase();
    data = data.filter((o) => String(o.subject || '').toLowerCase().includes(s));
  }
  res.json({ success: true, data });
});

router.post('/outreach', (req, res) => {
  const msg = addOutreach(req.body);
  res.status(201).json({ success: true, data: msg });
});

router.put('/outreach/:id', (req, res) => {
  const msg = demoOutreach.find((o) => o.id === Number(req.params.id));
  if (!msg) return res.status(404).json({ success: false, error: 'Not found' });
  Object.assign(msg, req.body);
  if (req.body.status === 'sent') msg.sent_at = new Date().toISOString();
  if (req.body.status === 'replied') {
    const lead = demoLeads.find((l) => l.id === msg.lead_id);
    if (lead && ['new', 'contacted'].includes(lead.status)) lead.status = 'responded';
  }
  res.json({ success: true, data: msg });
});

router.get('/follow-ups', (req: Request, res: Response) => {
  refreshFollowUpStatuses();
  let all = [...demoFollowUps];
  if (req.query.priority) all = all.filter((f) => f.priority === req.query.priority);

  res.json({
    success: true,
    data: groupFollowUps(all as { due_date: string; status: string }[]),
  });
});

router.put('/follow-ups/:id', (req, res) => {
  const fu = demoFollowUps.find((f) => f.id === Number(req.params.id));
  if (!fu) return res.status(404).json({ success: false, error: 'Not found' });
  Object.assign(fu, req.body);
  fu.user_modified = true;
  if (req.body.due_date) {
    fu.due_day_offset = offsetFromDueDate(String(req.body.due_date));
  }
  if (req.body.status === 'completed') {
    fu.is_completed = true;
    fu.status = 'completed';
  } else if (req.body.status === 'pending' && req.body.due_date) {
    fu.is_completed = false;
    fu.status = followUpStatus(String(req.body.due_date), 'pending');
  }
  refreshFollowUpStatuses();
  res.json({ success: true, data: fu });
});

router.get('/templates', (req: Request, res: Response) => {
  let data = [...demoTemplates];
  if (req.query.category) data = data.filter((t) => t.category === req.query.category);
  if (req.query.search) {
    const s = (req.query.search as string).toLowerCase();
    data = data.filter((t) => t.name.toLowerCase().includes(s));
  }
  res.json({ success: true, data });
});

router.get('/templates/:id', (req, res) => {
  const t = demoTemplates.find((t) => t.id === Number(req.params.id));
  if (!t) return res.status(404).json({ success: false, error: 'Not found' });
  res.json({ success: true, data: t });
});

router.get('/reports', (_req, res) => {
  const open = openDeals();
  const sources = ['LinkedIn', 'Inbound', 'Referral', 'Event', 'Partner', 'Cold outreach'].map((src) => ({
    lead_source: src,
    count: demoLeads.filter((l) => l.lead_source === src).length,
    qualified: demoLeads.filter((l) => l.lead_source === src && l.status === 'qualified').length,
  })).filter((s) => s.count > 0);
  const bestSource = sources.sort((a, b) => b.qualified - a.qualified)[0];

  res.json({
    success: true,
    data: {
      pipelineByStage: ['new_lead', 'contacted', 'qualified', 'proposal', 'negotiation'].map((stage) => {
        const deals = open.filter((d) => d.stage === stage);
        return { stage, count: deals.length, total_value: deals.reduce((s, d) => s + d.value, 0), expected_revenue: deals.reduce((s, d) => s + (d.expected_revenue || 0), 0) };
      }),
      conversionRate: Math.round((demoLeads.filter((l) => l.status === 'converted').length / demoLeads.length) * 100),
      qualifiedLeads: demoLeads.filter((l) => l.status === 'qualified').length,
      totalLeads: demoLeads.length,
      replyRate: Math.round((demoOutreach.filter((o) => o.status === 'replied').length / Math.max(demoOutreach.filter((o) => o.status !== 'draft').length, 1)) * 100),
      leadSourcePerformance: sources,
      wonVsLost: [
        { status: 'open', count: open.length, total_value: open.reduce((s, d) => s + d.value, 0) },
        { status: 'won', count: wonDeals().length, total_value: wonDeals().reduce((s, d) => s + d.value, 0) },
        { status: 'lost', count: lostDeals().length, total_value: lostDeals().reduce((s, d) => s + d.value, 0) },
      ],
      averageDealValue: demoDeals.length ? demoDeals.reduce((s, d) => s + d.value, 0) / demoDeals.length : 0,
      followUpCompletionRate: Math.round((demoFollowUps.filter((f) => f.status === 'completed').length / demoFollowUps.length) * 100),
      overdueFollowUps: demoFollowUps.filter((f) => f.status === 'overdue').length,
      topPriorityLeads: demoLeads.filter((l) => l.status !== 'not_interested').sort((a, b) => b.score - a.score).slice(0, 8),
      forecastedRevenue: buildForecastedRevenue(open),
      totals: { pipelineValue: open.reduce((s, d) => s + d.value, 0), expectedRevenue: open.reduce((s, d) => s + (d.expected_revenue || 0), 0) },
      insights: {
        bestPerformingSource: bestSource?.lead_source || 'LinkedIn',
        highestRiskStage: 'negotiation',
        strongestLeadSegment: 'Decision makers with score 75+',
        forecastConfidence: 'Medium',
        followUpTrend: 'Below target',
        pipelineGap: 'Contacted stage needs more volume',
      },
      insightTexts: [
        `${bestSource?.lead_source || 'LinkedIn'} produces the highest number of qualified leads.`,
        'Negotiation has the highest value but also the most close risk.',
        'Follow up completion is below target and should be improved.',
      ],
    },
  });
});

export default router;
