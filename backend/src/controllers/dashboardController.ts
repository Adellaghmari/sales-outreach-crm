import { Request, Response } from 'express';
import { getDashboardData } from '../services/dashboardService';

export async function getDashboard(_req: Request, res: Response) {
  const data = await getDashboardData();
  res.json({ success: true, data });
}
