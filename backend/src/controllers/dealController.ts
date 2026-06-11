import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as dealService from '../services/dealService';

export async function getDeals(req: Request, res: Response) {
  const data = await dealService.getDeals({
    search: req.query.search as string,
    stage: req.query.stage as string,
    status: req.query.status as string,
    minValue: req.query.minValue ? Number(req.query.minValue) : undefined,
    owner: req.query.owner as string,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as string,
  });
  res.json({ success: true, data });
}

export async function getDeal(req: Request, res: Response) {
  const deal = await dealService.getDealById(Number(req.params.id));
  if (!deal) throw new AppError('Deal not found', 404);
  res.json({ success: true, data: deal });
}

export async function getPipeline(_req: Request, res: Response) {
  const data = await dealService.getPipeline();
  res.json({ success: true, data });
}

export async function createDeal(req: Request, res: Response) {
  const deal = await dealService.createDeal(req.body);
  res.status(201).json({ success: true, data: deal });
}

export async function updateDeal(req: Request, res: Response) {
  const deal = await dealService.updateDeal(Number(req.params.id), req.body);
  if (!deal) throw new AppError('Deal not found', 404);
  res.json({ success: true, data: deal });
}

export async function updateDealStage(req: Request, res: Response) {
  const { stage } = req.body;
  if (!stage) throw new AppError('Stage is required', 400);
  const deal = await dealService.updateDealStage(Number(req.params.id), stage);
  if (!deal) throw new AppError('Deal not found', 404);
  res.json({ success: true, data: deal });
}

export async function deleteDeal(req: Request, res: Response) {
  const deal = await dealService.deleteDeal(Number(req.params.id));
  if (!deal) throw new AppError('Deal not found', 404);
  res.json({ success: true, data: deal });
}
