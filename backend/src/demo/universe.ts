import { addDays, addDaysISO, daysFromToday } from '../utils/dateHelpers';
import { refreshDemoActivityDates } from '../utils/activitySchedule';
import { DEAL_CLOSE_OFFSETS } from '../utils/dealSchedule';
import { buildDemoFollowUp, followUpSeeds, refreshDemoFollowUpDates } from '../utils/followUpSchedule';

export const OWNERS = ['Alex Morgan', 'Nadia Rahman', 'Leo Sandberg', 'Miriam Costa'];

export const pipelineStages = [
  { id: 1, name: 'New Lead', slug: 'new_lead', sort_order: 1, color: '#c4b5a0' },
  { id: 2, name: 'Contacted', slug: 'contacted', sort_order: 2, color: '#d4846a' },
  { id: 3, name: 'Qualified', slug: 'qualified', sort_order: 3, color: '#c9a86c' },
  { id: 4, name: 'Proposal', slug: 'proposal', sort_order: 4, color: '#9b6b8a' },
  { id: 5, name: 'Negotiation', slug: 'negotiation', sort_order: 5, color: '#d4a056' },
  { id: 6, name: 'Won', slug: 'won', sort_order: 6, color: '#3d8b6e' },
  { id: 7, name: 'Lost', slug: 'lost', sort_order: 7, color: '#c45c6a' },
];

export const demoCompanies = [
  { id: 1, name: 'Northstar Revenue', industry: 'Revenue Operations', website: 'northstarrevenue.com', size: '200-500', country: 'Sweden', status: 'active_opportunity', created_at: addDaysISO(-90), lead_count: 3, open_deals: 2, total_deal_value: 92000 },
  { id: 2, name: 'Mavenly', industry: 'SaaS', website: 'mavenly.io', size: '50-200', country: 'Norway', status: 'active_opportunity', created_at: addDaysISO(-85), lead_count: 3, open_deals: 1, total_deal_value: 44000 },
  { id: 3, name: 'Clearbitic', industry: 'Data Enrichment', website: 'clearbitic.com', size: '50-200', country: 'UK', status: 'prospect', created_at: addDaysISO(-80), lead_count: 2, open_deals: 1, total_deal_value: 22000 },
  { id: 4, name: 'OrbitWorks', industry: 'Productivity', website: 'orbitworks.app', size: '200-500', country: 'Denmark', status: 'active_opportunity', created_at: addDaysISO(-75), lead_count: 3, open_deals: 2, total_deal_value: 68000 },
  { id: 5, name: 'Velora Systems', industry: 'Enterprise Software', website: 'velora.systems', size: '500-1000', country: 'Germany', status: 'active_opportunity', created_at: addDaysISO(-70), lead_count: 2, open_deals: 1, total_deal_value: 85000 },
  { id: 6, name: 'Credora Pay', industry: 'Fintech', website: 'credorapay.eu', size: '200-500', country: 'Estonia', status: 'customer', created_at: addDaysISO(-65), lead_count: 2, open_deals: 0, total_deal_value: 52000 },
  { id: 7, name: 'Fjordline Analytics', industry: 'Analytics', website: 'fjordline.io', size: '50-200', country: 'Norway', status: 'active_opportunity', created_at: addDaysISO(-60), lead_count: 3, open_deals: 1, total_deal_value: 38000 },
  { id: 8, name: 'Horizon Grid', industry: 'Energy Tech', website: 'horizongrid.com', size: '200-500', country: 'Netherlands', status: 'prospect', created_at: addDaysISO(-55), lead_count: 2, open_deals: 1, total_deal_value: 29000 },
  { id: 9, name: 'Axentia Labs', industry: 'AI Tools', website: 'axentialabs.com', size: '50-200', country: 'Sweden', status: 'active_opportunity', created_at: addDaysISO(-50), lead_count: 3, open_deals: 1, total_deal_value: 41000 },
  { id: 10, name: 'Meridian Commerce', industry: 'E-commerce', website: 'meridiancommerce.com', size: '500-1000', country: 'UK', status: 'customer', created_at: addDaysISO(-45), lead_count: 2, open_deals: 1, total_deal_value: 76000 },
  { id: 11, name: 'SignalDesk', industry: 'Communications', website: 'signaldesk.io', size: '50-200', country: 'Finland', status: 'lost', created_at: addDaysISO(-40), lead_count: 2, open_deals: 0, total_deal_value: 0 },
  { id: 12, name: 'VantaCore', industry: 'Security', website: 'vantacore.com', size: '200-500', country: 'Germany', status: 'active_opportunity', created_at: addDaysISO(-35), lead_count: 2, open_deals: 1, total_deal_value: 54000 },
  { id: 13, name: 'LumaFlow', industry: 'Workflow Automation', website: 'lumaflow.app', size: '50-200', country: 'Sweden', status: 'prospect', created_at: addDaysISO(-30), lead_count: 2, open_deals: 1, total_deal_value: 18000 },
  { id: 14, name: 'Nexora Digital', industry: 'Digital Agency', website: 'nexoradigital.com', size: '50-200', country: 'Spain', status: 'active_opportunity', created_at: addDaysISO(-25), lead_count: 3, open_deals: 1, total_deal_value: 26000 },
  { id: 15, name: 'Copperlane', industry: 'Manufacturing', website: 'copperlane.com', size: '500-1000', country: 'Belgium', status: 'lost', created_at: addDaysISO(-20), lead_count: 2, open_deals: 0, total_deal_value: 0 },
  { id: 16, name: 'BrightPath Operations', industry: 'Operations Consulting', website: 'brightpathops.com', size: '50-200', country: 'Portugal', status: 'prospect', created_at: addDaysISO(-15), lead_count: 2, open_deals: 1, total_deal_value: 15000 },
];

type Lead = {
  id: number; company_id: number; first_name: string; last_name: string; title: string;
  email: string; phone: string; linkedin_url: string; lead_source: string; status: string;
  score: number; score_label: string; owner: string; created_at: string; updated_at: string;
  company_name: string; industry: string; company_size: string;
  last_activity: string | null; next_follow_up: string | null;
};

function lead(id: number, cid: number, fn: string, ln: string, title: string, email: string, source: string, status: string, score: number, owner: string, actDays: number | null, fuDays: number | null): Lead {
  const c = demoCompanies.find((x) => x.id === cid)!;
  const label = score >= 75 ? 'Hot' : score >= 55 ? 'Warm' : score >= 35 ? 'Cold' : 'Low priority';
  return {
    id, company_id: cid, first_name: fn, last_name: ln, title, email,
    phone: '+46 70 000 0000', linkedin_url: `linkedin.com/in/${fn.toLowerCase()}${ln.toLowerCase()}`,
    lead_source: source, status, score, score_label: label, owner,
    created_at: addDaysISO(-60 + id), updated_at: addDaysISO(-3),
    company_name: c.name, industry: c.industry, company_size: c.size,
    last_activity: actDays !== null ? addDaysISO(actDays) : null,
    next_follow_up: fuDays !== null ? addDays(fuDays) : null,
  };
}

export let demoLeads: Lead[] = [
  lead(1, 1, 'Amina', 'El Karimi', 'Head of Revenue Operations', 'amina@northstarrevenue.com', 'Referral', 'qualified', 88, OWNERS[0], -2, 0),
  lead(2, 2, 'Victor', 'Dahl', 'VP Sales', 'victor@mavenly.io', 'Inbound', 'responded', 82, OWNERS[1], -1, 0),
  lead(3, 4, 'Nora', 'Lindqvist', 'Customer Growth Lead', 'nora@orbitworks.app', 'Partner', 'qualified', 79, OWNERS[2], -3, 1),
  lead(4, 5, 'Samir', 'Haddad', 'COO', 'samir@velora.systems', 'Referral', 'qualified', 91, OWNERS[3], -4, 2),
  lead(5, 6, 'Elin', 'Fors', 'Partnerships Manager', 'elin@credorapay.eu', 'Event', 'converted', 85, OWNERS[0], -10, null),
  lead(6, 7, 'Marcus', 'Venn', 'Commercial Director', 'marcus@fjordline.io', 'LinkedIn', 'contacted', 64, OWNERS[1], -5, 3),
  lead(7, 8, 'Lina', 'Wiberg', 'Sales Enablement Lead', 'lina@horizongrid.com', 'Cold outreach', 'contacted', 58, OWNERS[2], -6, -1),
  lead(8, 9, 'Adam', 'Chen', 'Product Lead', 'adam@axentialabs.com', 'Inbound', 'responded', 76, OWNERS[3], -2, 0),
  lead(9, 10, 'Maya', 'Rosén', 'Operations Manager', 'maya@meridiancommerce.com', 'Referral', 'qualified', 80, OWNERS[0], -7, 1),
  lead(10, 11, 'Jonas', 'Bergwall', 'Founder', 'jonas@signaldesk.io', 'Cold outreach', 'not_interested', 22, OWNERS[1], -30, null),
  lead(11, 12, 'Sara', 'Mårtensson', 'Head of Customer Growth', 'sara@vantacore.com', 'Partner', 'responded', 77, OWNERS[2], -3, 0),
  lead(12, 14, 'Omar', 'Benali', 'Business Development Lead', 'omar@nexoradigital.com', 'Event', 'contacted', 61, OWNERS[3], -8, 4),
  lead(13, 3, 'Priya', 'Nair', 'Growth Manager', 'priya@clearbitic.com', 'LinkedIn', 'new', 42, OWNERS[0], null, 5),
  lead(14, 1, 'Henrik', 'Ström', 'Sales Director', 'henrik@northstarrevenue.com', 'Referral', 'contacted', 70, OWNERS[1], -4, 2),
  lead(15, 2, 'Clara', 'Meier', 'Customer Success Lead', 'clara@mavenly.io', 'Inbound', 'qualified', 74, OWNERS[2], -5, 1),
  lead(16, 4, 'Felix', 'Kowalski', 'Head of Product', 'felix@orbitworks.app', 'Partner', 'responded', 81, OWNERS[3], -1, 0),
  lead(17, 5, 'Ingrid', 'Haugen', 'VP Operations', 'ingrid@velora.systems', 'Referral', 'qualified', 86, OWNERS[0], -6, 3),
  lead(18, 7, 'Tobias', 'Richter', 'Data Director', 'tobias@fjordline.io', 'Event', 'new', 39, OWNERS[1], null, 6),
  lead(19, 8, 'Yuki', 'Tanaka', 'Revenue Analyst', 'yuki@horizongrid.com', 'Cold outreach', 'contacted', 55, OWNERS[2], -9, -3),
  lead(20, 9, 'Elena', 'Varga', 'AI Product Manager', 'elena@axentialabs.com', 'LinkedIn', 'contacted', 63, OWNERS[3], -7, 2),
  lead(21, 10, 'David', 'Okafor', 'Commercial Lead', 'david@meridiancommerce.com', 'Inbound', 'responded', 78, OWNERS[0], -2, 0),
  lead(22, 12, 'Freja', 'Lind', 'Security Sales Lead', 'freja@vantacore.com', 'Referral', 'qualified', 72, OWNERS[1], -4, 1),
  lead(23, 13, 'Lucas', 'Martins', 'Workflow Consultant', 'lucas@lumaflow.app', 'LinkedIn', 'new', 36, OWNERS[2], null, 7),
  lead(24, 13, 'Hannah', 'Weiss', 'Customer Ops Manager', 'hannah@lumaflow.app', 'Cold outreach', 'contacted', 51, OWNERS[3], -10, 5),
  lead(25, 14, 'Ravi', 'Patel', 'Agency Director', 'ravi@nexoradigital.com', 'Referral', 'qualified', 69, OWNERS[0], -3, 0),
  lead(26, 14, 'Sofia', 'Alvarez', 'New Business Manager', 'sofia@nexoradigital.com', 'Cold outreach', 'contacted', 57, OWNERS[1], -11, 6),
  lead(27, 15, 'Karl', 'Brenner', 'Procurement Head', 'karl@copperlane.com', 'Cold outreach', 'not_interested', 18, OWNERS[2], -25, null),
  lead(28, 15, 'Nina', 'Petrova', 'Operations Lead', 'nina@copperlane.com', 'Referral', 'contacted', 48, OWNERS[3], -12, -2),
  lead(29, 16, 'André', 'Silva', 'Managing Partner', 'andre@brightpathops.com', 'Inbound', 'new', 44, OWNERS[0], null, 4),
  lead(30, 16, 'Camille', 'Dubois', 'Client Director', 'camille@brightpathops.com', 'Referral', 'contacted', 59, OWNERS[1], -8, 3),
  lead(31, 3, 'James', 'Whitfield', 'VP Marketing', 'james@clearbitic.com', 'Inbound', 'responded', 67, OWNERS[2], -2, 1),
  lead(32, 6, 'Leila', 'Hassan', 'Product Marketing Lead', 'leila@credorapay.eu', 'Referral', 'converted', 83, OWNERS[3], -14, null),
  lead(33, 11, 'Petra', 'Johansson', 'Enterprise AE', 'petra@signaldesk.io', 'LinkedIn', 'contacted', 45, OWNERS[0], -15, -1),
  lead(34, 2, 'Noah', 'Berg', 'Founding AE', 'noah@mavenly.io', 'Cold outreach', 'new', 41, OWNERS[1], null, 5),
  lead(35, 5, 'Zara', 'Okonkwo', 'Head of Partnerships', 'zara@velora.systems', 'Cold outreach', 'responded', 75, OWNERS[2], -3, 0),
  lead(36, 9, 'Mikael', 'Söderberg', 'Engineering Manager', 'mikael@axentialabs.com', 'Partner', 'contacted', 60, OWNERS[3], -6, 2),
];

export interface DemoDeal {
  id: number; company_id: number; lead_id: number; title: string; value: number;
  stage: string; probability: number; expected_close_date: string; status: string;
  company_name: string; first_name: string; last_name: string; owner: string;
  expected_revenue?: number; days_to_close?: number | null; next_action?: string; priority?: string;
  closed_date?: string; reason_won?: string; reason_lost?: string; lesson_learned?: string; risk_badge?: string | null;
}

export let demoDeals: DemoDeal[] = [
  { id: 1, company_id: 1, lead_id: 1, title: 'Northstar sales enablement rollout', value: 62000, stage: 'negotiation', probability: 75, expected_close_date: addDays(5), status: 'open', company_name: 'Northstar Revenue', first_name: 'Amina', last_name: 'El Karimi', owner: OWNERS[0] },
  { id: 2, company_id: 2, lead_id: 2, title: 'Mavenly pipeline workspace', value: 44000, stage: 'proposal', probability: 60, expected_close_date: addDays(12), status: 'open', company_name: 'Mavenly', first_name: 'Victor', last_name: 'Dahl', owner: OWNERS[1] },
  { id: 3, company_id: 4, lead_id: 3, title: 'OrbitWorks growth CRM module', value: 38000, stage: 'qualified', probability: 45, expected_close_date: addDays(18), status: 'open', company_name: 'OrbitWorks', first_name: 'Nora', last_name: 'Lindqvist', owner: OWNERS[2] },
  { id: 4, company_id: 5, lead_id: 4, title: 'Velora enterprise outreach program', value: 85000, stage: 'negotiation', probability: 70, expected_close_date: addDays(4), status: 'open', company_name: 'Velora Systems', first_name: 'Samir', last_name: 'Haddad', owner: OWNERS[3] },
  { id: 5, company_id: 7, lead_id: 6, title: 'Fjordline commercial analytics pack', value: 38000, stage: 'contacted', probability: 25, expected_close_date: addDays(28), status: 'open', company_name: 'Fjordline Analytics', first_name: 'Marcus', last_name: 'Venn', owner: OWNERS[1] },
  { id: 6, company_id: 8, lead_id: 7, title: 'Horizon Grid sales playbook', value: 29000, stage: 'contacted', probability: 20, expected_close_date: addDays(21), status: 'open', company_name: 'Horizon Grid', first_name: 'Lina', last_name: 'Wiberg', owner: OWNERS[2] },
  { id: 7, company_id: 9, lead_id: 8, title: 'Axentia Labs pilot CRM', value: 41000, stage: 'proposal', probability: 55, expected_close_date: addDays(10), status: 'open', company_name: 'Axentia Labs', first_name: 'Adam', last_name: 'Chen', owner: OWNERS[3] },
  { id: 8, company_id: 10, lead_id: 9, title: 'Meridian Commerce pilot expansion', value: 76000, stage: 'won', probability: 100, expected_close_date: addDays(-8), status: 'won', company_name: 'Meridian Commerce', first_name: 'Maya', last_name: 'Rosén', owner: OWNERS[0], closed_date: addDays(-8), reason_won: 'Strong ops sponsor and clear rollout plan' },
  { id: 9, company_id: 1, lead_id: 1, title: 'Northstar Revenue sales enablement rollout', value: 52000, stage: 'won', probability: 100, expected_close_date: addDays(-14), status: 'won', company_name: 'Northstar Revenue', first_name: 'Amina', last_name: 'El Karimi', owner: OWNERS[0], closed_date: addDays(-14), reason_won: 'Replaced fragmented follow up process' },
  { id: 10, company_id: 6, lead_id: 5, title: 'Credora Pay outreach automation', value: 52000, stage: 'won', probability: 100, expected_close_date: addDays(-5), status: 'won', company_name: 'Credora Pay', first_name: 'Elin', last_name: 'Fors', owner: OWNERS[1], closed_date: addDays(-5), reason_won: 'Partner team needed structured handoffs' },
  { id: 11, company_id: 15, lead_id: 27, title: 'Copperlane outbound trial', value: 24000, stage: 'lost', probability: 0, expected_close_date: addDays(-12), status: 'lost', company_name: 'Copperlane', first_name: 'Karl', last_name: 'Brenner', owner: OWNERS[2], closed_date: addDays(-12), reason_lost: 'Budget frozen after leadership change', lesson_learned: 'Confirm budget holder earlier in cycle' },
  { id: 12, company_id: 11, lead_id: 10, title: 'SignalDesk enterprise renewal', value: 36000, stage: 'lost', probability: 0, expected_close_date: addDays(-20), status: 'lost', company_name: 'SignalDesk', first_name: 'Jonas', last_name: 'Bergwall', owner: OWNERS[1], closed_date: addDays(-20), reason_lost: 'Chose incumbent vendor for renewal', lesson_learned: 'Engage renewal conversation 90 days earlier' },
  { id: 13, company_id: 12, lead_id: 11, title: 'VantaCore security sales workspace', value: 54000, stage: 'qualified', probability: 40, expected_close_date: addDays(16), status: 'open', company_name: 'VantaCore', first_name: 'Sara', last_name: 'Mårtensson', owner: OWNERS[2] },
  { id: 14, company_id: 13, lead_id: 24, title: 'LumaFlow workflow outreach', value: 18000, stage: 'new_lead', probability: 10, expected_close_date: addDays(35), status: 'open', company_name: 'LumaFlow', first_name: 'Hannah', last_name: 'Weiss', owner: OWNERS[3] },
  { id: 15, company_id: 14, lead_id: 12, title: 'Nexora account growth program', value: 26000, stage: 'contacted', probability: 25, expected_close_date: addDays(22), status: 'open', company_name: 'Nexora Digital', first_name: 'Omar', last_name: 'Benali', owner: OWNERS[3] },
  { id: 16, company_id: 3, lead_id: 31, title: 'Clearbitic enrichment sales layer', value: 22000, stage: 'proposal', probability: 50, expected_close_date: addDays(14), status: 'open', company_name: 'Clearbitic', first_name: 'James', last_name: 'Whitfield', owner: OWNERS[2] },
  { id: 17, company_id: 16, lead_id: 30, title: 'BrightPath client pipeline tool', value: 15000, stage: 'new_lead', probability: 10, expected_close_date: addDays(40), status: 'open', company_name: 'BrightPath Operations', first_name: 'Camille', last_name: 'Dubois', owner: OWNERS[1] },
  { id: 18, company_id: 4, lead_id: 16, title: 'OrbitWorks product expansion', value: 30000, stage: 'negotiation', probability: 65, expected_close_date: addDays(7), status: 'open', company_name: 'OrbitWorks', first_name: 'Felix', last_name: 'Kowalski', owner: OWNERS[3] },
];

demoDeals.forEach((d) => {
  (d as DemoDeal & { close_day_offset?: number }).close_day_offset = DEAL_CLOSE_OFFSETS[d.id];
});
export function refreshDemoDealDates() {
  demoDeals.forEach((d) => {
    const offset = DEAL_CLOSE_OFFSETS[d.id];
    if (offset !== undefined) {
      d.expected_close_date = addDays(offset);
      if (d.status === 'won' || d.status === 'lost') {
        d.closed_date = addDays(offset);
      }
    }
    Object.assign(d, enrichDeal(d));
  });
}
refreshDemoDealDates();

export let demoOutreach: Record<string, unknown>[] = [
  { id: 1, lead_id: 1, subject: 'Outbound motion at Northstar Revenue', body: 'Hi Amina,\n\nI saw that Northstar Revenue is expanding its outbound motion this quarter. I wanted to reach out because teams at this stage often need a cleaner way to track follow ups, pipeline risk and account level activity in one place.\n\nWould it be useful to compare how your team is currently managing sales handoffs and follow up timing?', channel: 'email', status: 'replied', sent_at: addDaysISO(-5), created_at: addDaysISO(-5), first_name: 'Amina', last_name: 'El Karimi', lead_email: 'amina@northstarrevenue.com', company_name: 'Northstar Revenue' },
  { id: 2, lead_id: 2, subject: 'Pipeline visibility for Mavenly', body: 'Hi Victor,\n\nYour inbound growth at Mavenly suggests the sales team is handling more conversations than last quarter. We help teams keep outreach, follow ups and deal stages aligned without adding admin overhead.\n\nOpen to a short walkthrough?', channel: 'email', status: 'replied', sent_at: addDaysISO(-4), created_at: addDaysISO(-4), first_name: 'Victor', last_name: 'Dahl', lead_email: 'victor@mavenly.io', company_name: 'Mavenly' },
  { id: 3, lead_id: 4, subject: 'Enterprise outreach at Velora', body: 'Hi Samir,\n\nFollowing our referral intro, I wanted to share how enterprise teams like Velora Systems structure outreach and pipeline reviews in one workspace.', channel: 'email', status: 'sent', sent_at: addDaysISO(-6), created_at: addDaysISO(-6), first_name: 'Samir', last_name: 'Haddad', lead_email: 'samir@velora.systems', company_name: 'Velora Systems' },
  { id: 4, lead_id: 7, subject: 'Sales enablement at Horizon Grid', body: 'Hi Lina,\n\nTeams in energy tech often struggle to keep follow up timing consistent across regions. I thought this might be relevant for Horizon Grid.', channel: 'email', status: 'sent', sent_at: addDaysISO(-8), created_at: addDaysISO(-8), first_name: 'Lina', last_name: 'Wiberg', lead_email: 'lina@horizongrid.com', company_name: 'Horizon Grid' },
  { id: 5, lead_id: 13, subject: 'Growth workflow for Clearbitic', body: 'Hi Priya,\n\nI help growth teams keep outbound organized as they scale. Would a 15 minute overview be useful for Clearbitic?', channel: 'email', status: 'draft', sent_at: null, created_at: addDaysISO(-2), first_name: 'Priya', last_name: 'Nair', lead_email: 'priya@clearbitic.com', company_name: 'Clearbitic' },
  { id: 6, lead_id: 8, subject: 'Re: product led growth outreach', body: 'Hi Adam,\n\nThanks for the reply. I put together a short overview of how product led teams at Axentia Labs could structure outreach without slowing down the product cycle.', channel: 'email', status: 'replied', sent_at: addDaysISO(-3), created_at: addDaysISO(-3), first_name: 'Adam', last_name: 'Chen', lead_email: 'adam@axentialabs.com', company_name: 'Axentia Labs' },
  { id: 7, lead_id: 11, subject: 'Customer growth workflow', body: 'Hi Sara,\n\nSecurity teams often need tighter follow up discipline on enterprise deals. Thought VantaCore might benefit from a clearer outreach workspace.', channel: 'linkedin', status: 'sent', sent_at: addDaysISO(-4), created_at: addDaysISO(-4), first_name: 'Sara', last_name: 'Mårtensson', lead_email: 'sara@vantacore.com', company_name: 'VantaCore' },
  { id: 8, lead_id: 19, subject: 'Following up on regional pipeline', body: 'Hi Yuki,\n\nI wanted to follow up on my note about regional pipeline visibility at Horizon Grid.', channel: 'email', status: 'sent', sent_at: addDaysISO(-10), created_at: addDaysISO(-10), first_name: 'Yuki', last_name: 'Tanaka', lead_email: 'yuki@horizongrid.com', company_name: 'Horizon Grid' },
  { id: 9, lead_id: 3, subject: 'Growth planning at OrbitWorks', body: 'Hi Nora,\n\nGreat connecting at the partner session. I would love to show how OrbitWorks could keep customer growth outreach more structured.', channel: 'email', status: 'replied', sent_at: addDaysISO(-7), created_at: addDaysISO(-7), first_name: 'Nora', last_name: 'Lindqvist', lead_email: 'nora@orbitworks.app', company_name: 'OrbitWorks' },
  { id: 10, lead_id: 6, subject: 'Commercial workflow overview', body: 'Hi Marcus,\n\nI help commercial teams reduce missed follow ups during active deal cycles. Relevant for Fjordline Analytics?', channel: 'email', status: 'sent', sent_at: addDaysISO(-6), created_at: addDaysISO(-6), first_name: 'Marcus', last_name: 'Venn', lead_email: 'marcus@fjordline.io', company_name: 'Fjordline Analytics' },
];

export let demoFollowUps: Record<string, unknown>[] = followUpSeeds.map((seed) =>
  buildDemoFollowUp(seed, demoLeads, demoDeals),
);

export const demoTemplates = [
  { id: 1, name: 'Cold outreach intro', category: 'cold_outreach', subject: 'Quick idea for {{company}}', body: 'Hi {{first_name}},\n\nI noticed {{company}} is scaling its outbound motion. Teams at this stage often need one place to track follow ups, pipeline risk and account activity.\n\nWould a short comparison be useful?', best_used_when: 'First contact with a new qualified account', created_at: addDaysISO(-120) },
  { id: 2, name: 'First follow up', category: 'follow_up', subject: 'Following up on my note', body: 'Hi {{first_name}},\n\nI wanted to follow up on my previous message. If improving follow up discipline and pipeline visibility is still relevant for {{company}}, I can share a short overview.', best_used_when: '3 to 5 days after first outreach with no reply', created_at: addDaysISO(-120) },
  { id: 3, name: 'Second follow up', category: 'follow_up', subject: 'Still relevant for {{company}}?', body: 'Hi {{first_name}},\n\nI know priorities shift quickly. If this is still on your radar, happy to send a concise walkthrough. If not, just let me know.', best_used_when: 'Second nudge after no response', created_at: addDaysISO(-120) },
  { id: 4, name: 'Meeting request', category: 'meeting_request', subject: '20 minute intro for {{company}}', body: 'Hi {{first_name}},\n\nA short discovery call could help us see whether our outreach workflow is a fit for {{company}}. Would Tuesday or Wednesday work?', best_used_when: 'Lead has shown mild interest', created_at: addDaysISO(-120) },
  { id: 5, name: 'Pricing follow up', category: 'proposal_follow_up', subject: 'Pricing options for {{company}}', body: 'Hi {{first_name}},\n\nFollowing our conversation, I put together pricing and rollout options for {{company}}. Happy to review together.', best_used_when: 'After pricing question in discovery', created_at: addDaysISO(-120) },
  { id: 6, name: 'Proposal follow up', category: 'proposal_follow_up', subject: 'Any questions on the proposal?', body: 'Hi {{first_name}},\n\nWanted to check if you had a chance to review the proposal for {{company}}. I can walk through scope, timeline and next steps.', best_used_when: 'Proposal sent, awaiting feedback', created_at: addDaysISO(-120) },
  { id: 7, name: 'Reengagement', category: 'reengagement', subject: 'Checking back in', body: 'Hi {{first_name}},\n\nWe spoke a while back about outreach workflow at {{company}}. If priorities have changed, I would appreciate hearing what shifted.', best_used_when: 'Dormant lead after 30+ days', created_at: addDaysISO(-120) },
  { id: 8, name: 'Breakup email', category: 'reengagement', subject: 'Should I close the loop?', body: 'Hi {{first_name}},\n\nI do not want to crowd your inbox if this is not a priority. Should I check back later or close the loop for now?', best_used_when: 'Final attempt after multiple follow ups', created_at: addDaysISO(-120) },
  { id: 9, name: 'Referral intro', category: 'cold_outreach', subject: 'Intro from a mutual contact', body: 'Hi {{first_name}},\n\nA mutual contact suggested I reach out. We help teams like {{company}} keep outreach and pipeline management structured as they grow.', best_used_when: 'Warm intro from partner or customer', created_at: addDaysISO(-120) },
  { id: 10, name: 'Post demo recap', category: 'meeting_request', subject: 'Recap from our demo', body: 'Hi {{first_name}},\n\nThanks for the demo today. I summarized the use cases we discussed for {{company}} and attached next steps.', best_used_when: 'Within 24 hours after demo', created_at: addDaysISO(-120) },
  { id: 11, name: 'Decision maker follow up', category: 'follow_up', subject: 'Next step for {{company}}', body: 'Hi {{first_name}},\n\nBased on our last conversation, the next step would be a short review with your leadership team. I can tailor the overview for executive stakeholders.', best_used_when: 'Champion needs exec alignment', created_at: addDaysISO(-120) },
  { id: 12, name: 'No response sequence', category: 'follow_up', subject: 'One last follow up', body: 'Hi {{first_name}},\n\nI have reached out a few times and will pause here unless timing improves. If outreach workflow becomes a priority at {{company}}, I am happy to reconnect.', best_used_when: 'End of cadence with no reply', created_at: addDaysISO(-120) },
];

export const demoActivities: Record<string, unknown>[] = [
  { id: 1, lead_id: 1, deal_id: 1, type: 'email', title: 'First outreach sent', description: 'Initial email about outbound motion and follow up discipline.', created_by: OWNERS[0], created_at: addDaysISO(-8) },
  { id: 2, lead_id: 1, deal_id: 1, type: 'email', title: 'Opened message', description: 'Lead opened the first outreach email.', created_by: 'System', created_at: addDaysISO(-7) },
  { id: 3, lead_id: 1, deal_id: 1, type: 'email', title: 'Replied with pricing question', description: 'Asked about rollout pricing and seat model.', created_by: OWNERS[0], created_at: addDaysISO(-5) },
  { id: 4, lead_id: 1, deal_id: 1, type: 'meeting', title: 'Discovery call completed', description: 'Reviewed current handoff process and pipeline reviews.', created_by: OWNERS[0], created_at: addDaysISO(-4) },
  { id: 5, lead_id: 1, deal_id: 1, type: 'email', title: 'Proposal shared', description: 'Sent proposal for sales enablement rollout.', created_by: OWNERS[0], created_at: addDaysISO(-2) },
  { id: 6, lead_id: 2, deal_id: 2, type: 'email', title: 'First outreach sent', description: 'Inbound follow up on pipeline visibility.', created_by: OWNERS[1], created_at: addDaysISO(-10) },
  { id: 7, lead_id: 2, deal_id: 2, type: 'call', title: 'Discovery call completed', description: 'Discussed current CRM gaps and reporting needs.', created_by: OWNERS[1], created_at: addDaysISO(-6) },
  { id: 8, lead_id: 2, deal_id: 2, type: 'email', title: 'Proposal shared', description: 'Shared Mavenly pipeline workspace proposal.', created_by: OWNERS[1], created_at: addDaysISO(-3) },
  { id: 9, lead_id: 4, deal_id: 4, type: 'meeting', title: 'Executive intro meeting', description: 'Met COO and reviewed enterprise outreach program.', created_by: OWNERS[3], created_at: addDaysISO(-12) },
  { id: 10, lead_id: 4, deal_id: 4, type: 'note', title: 'Waiting for procurement review', description: 'Commercial terms under internal review.', created_by: OWNERS[3], created_at: addDaysISO(-1) },
  { id: 11, lead_id: 8, deal_id: 7, type: 'email', title: 'Replied to inbound inquiry', description: 'Positive response to product led growth outreach.', created_by: OWNERS[3], created_at: addDaysISO(-5) },
  { id: 12, lead_id: 8, deal_id: 7, type: 'meeting', title: 'Product review meeting', description: 'Walked through pilot scope with product team.', created_by: OWNERS[3], created_at: addDaysISO(-3) },
  { id: 13, lead_id: 11, deal_id: 13, type: 'email', title: 'Follow up scheduled', description: 'Second follow up planned after LinkedIn intro.', created_by: OWNERS[2], created_at: addDaysISO(-2) },
  { id: 14, lead_id: 7, deal_id: 6, type: 'email', title: 'First outreach sent', description: 'Introduced sales playbook use case.', created_by: OWNERS[2], created_at: addDaysISO(-9) },
  { id: 15, lead_id: 7, deal_id: 6, type: 'follow_up', title: 'Follow up after no response', description: 'No reply after first message.', created_by: OWNERS[2], created_at: addDaysISO(-4) },
];

export const demoNotes: Record<number, { id: number; note: string; created_by: string; created_at: string }[]> = {
  1: [{ id: 1, note: 'Strong champion. Needs rollout plan before quarter end.', created_by: OWNERS[0], created_at: addDaysISO(-3) }],
  2: [{ id: 2, note: 'Wants clearer reporting for inbound to opportunity conversion.', created_by: OWNERS[1], created_at: addDaysISO(-4) }],
  4: [{ id: 3, note: 'Executive sponsor engaged. Procurement is the bottleneck.', created_by: OWNERS[3], created_at: addDaysISO(-2) }],
  8: [{ id: 4, note: 'Product team liked the pilot scope. Needs security review.', created_by: OWNERS[3], created_at: addDaysISO(-1) }],
};

export const demoTasks: Record<number, { id: number; title: string; description?: string; due_date?: string; status: string; priority: string }[]> = {
  1: [{ id: 1, title: 'Prepare negotiation recap', description: 'Send recap before final commercial call.', due_date: addDays(0), status: 'pending', priority: 'urgent' }],
  2: [{ id: 2, title: 'Update proposal pricing', description: 'Adjust rollout tiers for Mavenly.', due_date: addDays(1), status: 'pending', priority: 'high' }],
  4: [{ id: 3, title: 'Confirm procurement timeline', description: 'Check status with Samir.', due_date: addDays(0), status: 'pending', priority: 'urgent' }],
};

export function enrichDeal(deal: DemoDeal): DemoDeal {
  const days = daysFromToday(deal.expected_close_date);
  const expected_revenue = deal.value * deal.probability / 100;
  let risk_badge: string | null = null;
  if (deal.status === 'open' && days <= 7 && days >= 0) risk_badge = 'Close soon';
  if (deal.status === 'open' && days < 0) risk_badge = 'Past close date';

  return {
    ...deal,
    expected_revenue,
    days_to_close: days,
    priority: days <= 7 && days >= 0 ? 'high' : days <= 14 ? 'medium' : 'low',
    next_action: deal.status === 'won' ? 'Begin onboarding handoff' : deal.status === 'lost' ? 'Document loss reason' : days <= 7 ? 'Call before expected close date' : 'Schedule next follow up',
    risk_badge,
  };
}

const extraActivityTitles = ['Follow up scheduled', 'Opened message', 'Call completed', 'Proposal shared', 'Waiting for reply', 'Asked about pricing', 'Needs technical demo', 'Stakeholder meeting', 'Contract review sent', 'Inbound reply received'];
for (let i = 0; i < demoLeads.length && demoActivities.length < 50; i++) {
  const lead = demoLeads[i];
  const deal = demoDeals.find((d) => d.lead_id === lead.id);
  demoActivities.push({
    id: demoActivities.length + 1,
    lead_id: lead.id,
    deal_id: deal?.id || null,
    type: i % 3 === 0 ? 'email' : i % 3 === 1 ? 'call' : 'note',
    title: extraActivityTitles[i % extraActivityTitles.length],
    description: `Activity logged for ${lead.first_name} ${lead.last_name} at ${lead.company_name}.`,
    created_by: lead.owner,
    created_at: addDaysISO(-(i % 14) - 1),
  });
}
refreshDemoActivityDates(demoActivities);

for (let i = 0; i < demoLeads.length && demoOutreach.length < 30; i++) {
  const lead = demoLeads[i];
  if (demoOutreach.some((o) => o.lead_id === lead.id)) continue;
  demoOutreach.push({
    id: demoOutreach.length + 1,
    lead_id: lead.id,
    subject: `Outreach for ${lead.company_name}`,
    body: `Hi ${lead.first_name},\n\nI wanted to reach out about improving outreach workflow and follow up visibility at ${lead.company_name}.`,
    channel: i % 4 === 0 ? 'linkedin' : 'email',
    status: i % 5 === 0 ? 'draft' : i % 3 === 0 ? 'replied' : 'sent',
    sent_at: i % 5 === 0 ? null : addDaysISO(-(i % 10)),
    created_at: addDaysISO(-(i % 10)),
    first_name: lead.first_name,
    last_name: lead.last_name,
    lead_email: lead.email,
    company_name: lead.company_name,
  });
}

demoLeads.forEach((lead, i) => {
  if (!demoNotes[lead.id]) {
    demoNotes[lead.id] = [{
      id: 1,
      note: `Account context: ${lead.company_name} is evaluating workflow improvements. ${lead.first_name} is the main point of contact.`,
      created_by: lead.owner,
      created_at: addDaysISO(-(i % 20)),
    }];
  }
  if (!demoTasks[lead.id]) {
    demoTasks[lead.id] = [{
      id: 1,
      title: `Review next step for ${lead.first_name}`,
      description: 'Confirm follow up timing and deal stage alignment.',
      due_date: addDays(i % 5),
      status: 'pending',
      priority: lead.score >= 75 ? 'high' : 'medium',
    }];
  }
});

export function refreshFollowUpStatuses() {
  refreshDemoFollowUpDates(demoFollowUps);
}

refreshFollowUpStatuses();

let nextLeadId = 37;
let nextOutreachId = 11;

export function addLead(data: Partial<Lead> & { first_name: string; last_name: string; company_id: number }) {
  const company = demoCompanies.find((c) => c.id === data.company_id);
  const score = data.score ?? 40;
  const lead: Lead = {
    id: nextLeadId++,
    company_id: data.company_id,
    first_name: data.first_name,
    last_name: data.last_name,
    title: data.title || '',
    email: data.email || '',
    phone: data.phone || '',
    linkedin_url: data.linkedin_url || '',
    lead_source: data.lead_source || 'Inbound',
    status: data.status || 'new',
    score,
    score_label: score >= 75 ? 'Hot' : score >= 55 ? 'Warm' : score >= 35 ? 'Cold' : 'Low priority',
    owner: data.owner || OWNERS[0],
    created_at: addDaysISO(0),
    updated_at: addDaysISO(0),
    company_name: company?.name || '',
    industry: company?.industry || '',
    company_size: company?.size || '',
    last_activity: null,
    next_follow_up: null,
  };
  demoLeads.unshift(lead);
  if (company) company.lead_count = (company.lead_count || 0) + 1;
  return lead;
}

export function addOutreach(data: Record<string, unknown>) {
  const lead = demoLeads.find((l) => l.id === data.lead_id);
  const msg = {
    id: nextOutreachId++,
    lead_id: data.lead_id as number,
    subject: data.subject as string,
    body: data.body as string,
    channel: (data.channel as string) || 'email',
    status: (data.status as string) || 'draft',
    sent_at: data.status === 'sent' ? addDaysISO(0) : null,
    created_at: addDaysISO(0),
    first_name: lead?.first_name,
    last_name: lead?.last_name,
    lead_email: lead?.email,
    company_name: lead?.company_name,
  };
  demoOutreach.unshift(msg);
  return msg;
}
