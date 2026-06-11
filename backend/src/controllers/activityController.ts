import { Request, Response } from 'express';
import * as activityService from '../services/activityService';

export async function getLeadActivities(req: Request, res: Response) {
  const data = await activityService.getLeadActivities(Number(req.params.id));
  res.json({ success: true, data });
}

export async function createActivity(req: Request, res: Response) {
  const activity = await activityService.createActivity(req.body);
  res.status(201).json({ success: true, data: activity });
}
