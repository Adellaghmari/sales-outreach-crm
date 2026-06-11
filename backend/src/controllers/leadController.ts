import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as leadService from '../services/leadService';

export async function getLeads(req: Request, res: Response) {
  const data = await leadService.getLeads({
    search: req.query.search as string,
    status: req.query.status as string,
    minScore: req.query.minScore ? Number(req.query.minScore) : undefined,
    maxScore: req.query.maxScore ? Number(req.query.maxScore) : undefined,
    source: req.query.source as string,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string,
  });
  res.json({ success: true, data });
}

export async function getLead(req: Request, res: Response) {
  const lead = await leadService.getLeadById(Number(req.params.id));
  if (!lead) throw new AppError('Lead not found', 404);
  res.json({ success: true, data: lead });
}

export async function createLead(req: Request, res: Response) {
  const lead = await leadService.createLead(req.body);
  res.status(201).json({ success: true, data: lead });
}

export async function updateLead(req: Request, res: Response) {
  const lead = await leadService.updateLead(Number(req.params.id), req.body);
  if (!lead) throw new AppError('Lead not found', 404);
  res.json({ success: true, data: lead });
}

export async function deleteLead(req: Request, res: Response) {
  const lead = await leadService.deleteLead(Number(req.params.id));
  if (!lead) throw new AppError('Lead not found', 404);
  res.json({ success: true, data: lead });
}
