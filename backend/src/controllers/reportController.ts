import { Request, Response } from 'express';
import { getReports as fetchReports } from '../services/reportService';

export async function getReports(_req: Request, res: Response) {
  const data = await fetchReports();
  res.json({ success: true, data });
}
