import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as followUpService from '../services/followUpService';

export async function getFollowUps(req: Request, res: Response) {
  const data = await followUpService.getFollowUps({
    status: req.query.status as string,
    priority: req.query.priority as string,
    owner: req.query.owner as string,
  });
  res.json({ success: true, data });
}

export async function updateFollowUp(req: Request, res: Response) {
  const followUp = await followUpService.updateFollowUp(Number(req.params.id), req.body);
  if (!followUp) throw new AppError('Follow up not found', 404);
  res.json({ success: true, data: followUp });
}
