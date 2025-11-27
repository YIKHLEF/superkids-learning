import { Request, Response } from 'express';
import { ServiceFactory } from '../services';
import { logger } from '../utils/logger';

export class ReportingController {
  async getSummary(req: Request, res: Response) {
    const { childId } = req.query;
    const reportingService = ServiceFactory.getReportingService();

    const summary = await reportingService.getSummary(childId as string | undefined);
    return res.json({ status: 'success', data: summary });
  }

  async exportReport(req: Request, res: Response) {
    const { childId, format = 'csv' } = req.query;
    const reportingService = ServiceFactory.getReportingService();

    if (format !== 'csv') {
      return res.status(400).json({ message: 'Format non supporté' });
    }

    try {
      const csv = await reportingService.exportCsv(childId as string | undefined);
        res.header('Content-Type', 'text/csv');
        res.attachment('rapport-progress.csv');
        return res.send(csv);
      } catch (error) {
        logger.error('Erreur export rapport', error);
        return res.status(500).json({ message: 'Impossible de générer le rapport' });
      }
    }
  }

export default new ReportingController();

