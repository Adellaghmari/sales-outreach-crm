import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as templateService from '../services/templateService';

export async function getTemplates(req: Request, res: Response) {
  const data = await templateService.getTemplates(
    req.query.category as string,
    req.query.search as string
  );
  res.json({ success: true, data });
}

export async function getTemplate(req: Request, res: Response) {
  const template = await templateService.getTemplateById(Number(req.params.id));
  if (!template) throw new AppError('Template not found', 404);
  res.json({ success: true, data: template });
}

export async function createTemplate(req: Request, res: Response) {
  const template = await templateService.createTemplate(req.body);
  res.status(201).json({ success: true, data: template });
}

export async function updateTemplate(req: Request, res: Response) {
  const template = await templateService.updateTemplate(Number(req.params.id), req.body);
  if (!template) throw new AppError('Template not found', 404);
  res.json({ success: true, data: template });
}
