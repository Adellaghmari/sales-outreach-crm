const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data;
}

export const api = {
  getDashboard: () => request<import('../types').DashboardData>('/dashboard'),

  getCompanies: (search?: string) =>
    request<import('../types').Company[]>(`/companies${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getLeads: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<import('../types').Lead[]>(`/leads${query}`);
  },

  getLead: (id: number) => request<import('../types').Lead & Record<string, unknown>>(`/leads/${id}`),

  createLead: (data: Record<string, unknown>) =>
    request<import('../types').Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),

  getCompany: (id: number) => request<import('../types').Company & Record<string, unknown>>(`/companies/${id}`),

  getDeals: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<import('../types').Deal[]>(`/deals${query}`);
  },

  getPipeline: () =>
    request<{ stages: import('../types').PipelineStage[]; totals: { pipeline_value: number; expected_revenue: number; deal_count: number } }>('/pipeline'),

  updateDealStage: (id: number, stage: string) =>
    request<import('../types').Deal>(`/deals/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage }),
    }),

  getOutreach: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<import('../types').OutreachMessage[]>(`/outreach${query}`);
  },

  createOutreach: (data: Record<string, unknown>) =>
    request<import('../types').OutreachMessage>('/outreach', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOutreach: (id: number, data: Record<string, unknown>) =>
    request<import('../types').OutreachMessage>(`/outreach/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getFollowUps: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{
      all: import('../types').FollowUp[];
      dueToday: import('../types').FollowUp[];
      overdue: import('../types').FollowUp[];
      thisWeek: import('../types').FollowUp[];
      completed: import('../types').FollowUp[];
    }>(`/follow-ups${query}`);
  },

  updateFollowUp: (id: number, data: Record<string, unknown>) =>
    request<import('../types').FollowUp>(`/follow-ups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getTemplates: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<import('../types').EmailTemplate[]>(`/templates${query}`);
  },

  getTemplate: (id: number) => request<import('../types').EmailTemplate>(`/templates/${id}`),

  getReports: () => request<import('../types').ReportsData>('/reports'),

  health: () => request<{ status: string }>('/health'),
};
