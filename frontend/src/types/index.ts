export interface Company {
  id: number;
  name: string;
  industry?: string;
  website?: string;
  size?: string;
  country?: string;
  status: string;
  created_at: string;
  lead_count?: number;
  open_deals?: number;
}

export interface Lead {
  id: number;
  company_id?: number;
  first_name: string;
  last_name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  lead_source?: string;
  status: string;
  score: number;
  score_label?: string;
  owner: string;
  created_at: string;
  updated_at: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  last_activity?: string;
  next_follow_up?: string;
  next_action?: string;
}

export interface Deal {
  id: number;
  company_id?: number;
  lead_id?: number;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  owner?: string;
  expected_revenue?: number;
  days_to_close?: number | null;
  next_action?: string;
  priority?: string;
}

export interface Activity {
  id: number;
  lead_id: number;
  deal_id?: number;
  type: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  source?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export interface OutreachMessage {
  id: number;
  lead_id: number;
  subject?: string;
  body?: string;
  channel: string;
  status: string;
  sent_at?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  lead_email?: string;
  company_name?: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  category: string;
  subject?: string;
  body?: string;
  created_at: string;
}

export interface FollowUp {
  id: number;
  lead_id: number;
  deal_id?: number;
  due_date: string;
  priority: string;
  status: string;
  reason?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  owner?: string;
  company_name?: string;
  deal_title?: string;
  recommended_action?: string;
}

export interface DashboardData {
  stats: {
    totalLeads: number;
    newLeadsThisWeek: number;
    qualifiedLeads: number;
    openDeals: number;
    pipelineValue: number;
    expectedRevenue: number;
    wonDeals: number;
    lostDeals: number;
    overdueFollowUps: number;
    replyRate: number;
    conversionRate: number;
  };
  todayFollowUps: FollowUp[];
  hotLeads: Lead[];
  closingDeals: Deal[];
  recentActivity: Activity[];
  pipelineByStage: { stage: string; count: number; total_value: number }[];
  leadSources: { lead_source: string; count: number }[];
  recommendedActions: string[];
}

export interface PipelineStage {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  color: string;
  deals: Deal[];
  deal_count: number;
  total_value: number;
  expected_revenue: number;
}

export interface ReportsData {
  pipelineByStage: { stage: string; count: number; total_value: number; expected_revenue: number }[];
  conversionRate: number;
  qualifiedLeads: number;
  totalLeads: number;
  replyRate: number;
  leadSourcePerformance: { lead_source: string; count: number }[];
  wonVsLost: { status: string; count: number; total_value: number }[];
  averageDealValue: number;
  followUpCompletionRate: number;
  overdueFollowUps: number;
  topPriorityLeads: Lead[];
  forecastedRevenue: { month: string; forecast: number }[];
  totals: { pipelineValue: number; expectedRevenue: number };
}
