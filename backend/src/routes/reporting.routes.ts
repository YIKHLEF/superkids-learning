import { Router } from 'express';
import reportingController from '../controllers/reporting.controller';

const router = Router();

router.get('/summary', (req, res) => reportingController.getSummary(req, res));
router.get('/export', (req, res) => reportingController.exportReport(req, res));

export default router;

