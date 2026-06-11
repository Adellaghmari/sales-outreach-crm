import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as outreachService from '../services/outreachService';

export async function getOutreach(req: Request, res: Response) {
  const data = await outreachService.getOutreachMessages({
    status: req.query.status as string,
    channel: req.query.channel as string,
    search: req.query.search as string,
  });
  res.json({ success: true, data });
}

export async function createOutreach(req: Request, res: Response) {
  const message = await outreachService.createOutreachMessage(req.body);
  res.status(201).json({ success: true, data: message });
}

export async function updateOutreach(req: Request, res: Response) {
  const message = await outreachService.updateOutreachMessage(Number(req.params.id), req.body);
  if (!message) throw new AppError('Outreach message not found', 404);
  res.json({ success: true, data: message });
}
