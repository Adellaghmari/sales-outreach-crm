import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as dashboardController from '../controllers/dashboardController';
import * as companyController from '../controllers/companyController';
import * as leadController from '../controllers/leadController';
import * as dealController from '../controllers/dealController';
import * as outreachController from '../controllers/outreachController';
import * as followUpController from '../controllers/followUpController';
import * as templateController from '../controllers/templateController';
import * as reportController from '../controllers/reportController';
import * as activityController from '../controllers/activityController';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/dashboard', asyncHandler(dashboardController.getDashboard));

router.get('/companies', asyncHandler(companyController.getCompanies));
router.get('/companies/:id', asyncHandler(companyController.getCompany));
router.post('/companies', asyncHandler(companyController.createCompany));
router.put('/companies/:id', asyncHandler(companyController.updateCompany));
router.delete('/companies/:id', asyncHandler(companyController.deleteCompany));

router.get('/leads', asyncHandler(leadController.getLeads));
router.get('/leads/:id', asyncHandler(leadController.getLead));
router.post('/leads', asyncHandler(leadController.createLead));
router.put('/leads/:id', asyncHandler(leadController.updateLead));
router.delete('/leads/:id', asyncHandler(leadController.deleteLead));
router.get('/leads/:id/activities', asyncHandler(activityController.getLeadActivities));

router.get('/deals', asyncHandler(dealController.getDeals));
router.get('/deals/:id', asyncHandler(dealController.getDeal));
router.post('/deals', asyncHandler(dealController.createDeal));
router.put('/deals/:id', asyncHandler(dealController.updateDeal));
router.delete('/deals/:id', asyncHandler(dealController.deleteDeal));

router.get('/pipeline', asyncHandler(dealController.getPipeline));
router.put('/deals/:id/stage', asyncHandler(dealController.updateDealStage));

router.post('/activities', asyncHandler(activityController.createActivity));

router.get('/outreach', asyncHandler(outreachController.getOutreach));
router.post('/outreach', asyncHandler(outreachController.createOutreach));
router.put('/outreach/:id', asyncHandler(outreachController.updateOutreach));

router.get('/follow-ups', asyncHandler(followUpController.getFollowUps));
router.put('/follow-ups/:id', asyncHandler(followUpController.updateFollowUp));

router.get('/templates', asyncHandler(templateController.getTemplates));
router.get('/templates/:id', asyncHandler(templateController.getTemplate));
router.post('/templates', asyncHandler(templateController.createTemplate));
router.put('/templates/:id', asyncHandler(templateController.updateTemplate));

router.get('/reports', asyncHandler(reportController.getReports));

export default router;
