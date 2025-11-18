import { PrismaClient } from '@prisma/client';
import { ProgressService } from './progress.service';
import { ReportAlert, ReportSummary } from '../types';

interface ProgressAnalytics {
  events: any[];
  aggregates: {
    totalActivities: number;
    averageSuccessRate: number;
    totalDurationSeconds: number;
    emotionalStates: Record<string, number>;
    attempts: number;
    skillAverages?: Record<string, number>;
  };
}

export class ReportingService {
  private progressService: ProgressService;

  constructor({ prisma, progressService }: { prisma: PrismaClient; progressService?: ProgressService }) {
    this.progressService = progressService || new ProgressService(prisma);
  }

  async getSummary(childId?: string): Promise<ReportSummary> {
    const analytics = (await this.progressService.getProgressAnalytics(childId)) as ProgressAnalytics;

    const alerts = this.buildAlerts(analytics);

    return {
      childId,
      aggregates: {
        totalActivities: analytics.aggregates.totalActivities,
        averageSuccessRate: analytics.aggregates.averageSuccessRate,
        totalDurationMinutes: Math.round((analytics.aggregates.totalDurationSeconds || 0) / 60),
        attempts: analytics.aggregates.attempts,
      },
      skillAverages: analytics.aggregates.skillAverages || {},
      emotionalStates: analytics.aggregates.emotionalStates || {},
      alerts,
      iepComparison: this.buildIepComparison(analytics),
    };
  }

  async exportCsv(childId?: string): Promise<string> {
    const summary = await this.getSummary(childId);
    const lines = [
      'metric,value',
      `totalActivities,${summary.aggregates.totalActivities}`,
      `averageSuccessRate,${summary.aggregates.averageSuccessRate.toFixed(2)}`,
      `totalDurationMinutes,${summary.aggregates.totalDurationMinutes}`,
      `attempts,${summary.aggregates.attempts}`,
      ...Object.entries(summary.skillAverages).map(([skill, value]) => `skill_${skill},${value.toFixed(2)}`),
    ];

    return lines.join('\n');
  }

  private buildAlerts(analytics: ProgressAnalytics): ReportAlert[] {
    const alerts: ReportAlert[] = [];
    const { averageSuccessRate, totalActivities, emotionalStates } = analytics.aggregates;

    if (averageSuccessRate < 0.5) {
      alerts.push({
        id: 'success-risk',
        level: 'warning',
        message: 'Le taux de réussite est en dessous de 50%.',
        recommendation: 'Proposer des activités au niveau débutant et ajouter des supports visuels.',
      });
    }

    if (totalActivities < 3) {
      alerts.push({
        id: 'engagement-low',
        level: 'info',
        message: "Peu d'activités enregistrées cette période.",
        recommendation: 'Planifier des sessions courtes et fréquentes (10 minutes).',
      });
    }

    if ((emotionalStates['anxious'] || 0) > 2) {
      alerts.push({
        id: 'emotion-anxiety',
        level: 'critical',
        message: 'Des signaux d’anxiété sont détectés durant les activités.',
        recommendation: 'Réduire les stimuli et ajouter un exercice de respiration guidée avant chaque session.',
      });
    }

    return alerts;
  }

  private buildIepComparison(analytics: ProgressAnalytics) {
    const skills = analytics.aggregates.skillAverages || {};
    return Object.entries(skills).map(([skill, rate]) => ({
      objective: skill,
      achievedRate: parseFloat(rate.toFixed(2)),
    }));
  }
}

