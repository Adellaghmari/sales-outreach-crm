import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as companyService from '../services/companyService';

export async function getCompanies(req: Request, res: Response) {
  const data = await companyService.getCompanies(req.query.search as string);
  res.json({ success: true, data });
}

export async function getCompany(req: Request, res: Response) {
  const company = await companyService.getCompanyById(Number(req.params.id));
  if (!company) throw new AppError('Company not found', 404);
  res.json({ success: true, data: company });
}

export async function createCompany(req: Request, res: Response) {
  const company = await companyService.createCompany(req.body);
  res.status(201).json({ success: true, data: company });
}

export async function updateCompany(req: Request, res: Response) {
  const company = await companyService.updateCompany(Number(req.params.id), req.body);
  if (!company) throw new AppError('Company not found', 404);
  res.json({ success: true, data: company });
}

export async function deleteCompany(req: Request, res: Response) {
  const company = await companyService.deleteCompany(Number(req.params.id));
  if (!company) throw new AppError('Company not found', 404);
  res.json({ success: true, data: company });
}
