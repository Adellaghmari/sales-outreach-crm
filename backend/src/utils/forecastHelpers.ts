interface ForecastDeal {
  expected_close_date?: string | null;
  expected_revenue?: number;
  value?: number;
  probability?: number;
  status?: string;
}

function monthKey(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  if (typeof date === 'string') return date.slice(0, 7);
  const d = date as Date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function dealExpectedRevenue(deal: ForecastDeal): number {
  if (deal.expected_revenue != null) return Number(deal.expected_revenue);
  return (Number(deal.value || 0) * Number(deal.probability || 0)) / 100;
}

export function buildForecastedRevenue(deals: ForecastDeal[]): { month: string; forecast: number }[] {
  const openDeals = deals.filter((d) => d.status === 'open' || d.status === undefined);
  const totalExpected = openDeals.reduce((sum, d) => sum + dealExpectedRevenue(d), 0);
  const now = new Date();

  const months: string[] = [];
  for (let i = -1; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const byMonth = new Map<string, number>();
  for (const deal of openDeals) {
    if (!deal.expected_close_date) continue;
    const month = monthKey(deal.expected_close_date);
    if (!month) continue;
    byMonth.set(month, (byMonth.get(month) || 0) + dealExpectedRevenue(deal));
  }

  const weights = [0.66, 0.76, 0.87, 1.0];
  let previous = 0;

  return months.map((month, index) => {
    const actual = Math.round(byMonth.get(month) || 0);
    const projected = Math.round(totalExpected * weights[index]);
    const forecast = Math.max(actual, projected, previous + Math.round(totalExpected * 0.04));
    previous = forecast;
    return { month, forecast };
  });
}
