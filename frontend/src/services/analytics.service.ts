import api, { getApiErrorMessage, logApiError } from './api';
import { DifficultyLevel } from '../types';

export type ActivityEventType =
  | 'activity_start'
  | 'activity_end'
  | 'attempt'
  | 'success'
  | 'emotion';

export interface ActivityEventPayload {
  activityId: string;
  childId: string;
  type: ActivityEventType;
  timestamp: string;
  difficulty: DifficultyLevel;
  attempts?: number;
  successRate?: number;
  emotionalState?: string;
  dominantEmotion?: string;
  supportLevel?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  events: ActivityEventPayload[];
  aggregates: {
    totalActivities: number;
    averageSuccessRate: number;
    totalDurationSeconds: number;
    emotionalStates: Record<string, number>;
    attempts: number;
    skillAverages?: Record<string, number>;
  };
}

export const analyticsService = {
  async sendEvent(event: ActivityEventPayload) {
    try {
      await api.post('/progress/events', event);
    } catch (error) {
      logApiError(error as any, 'progress/events');
      console.warn('[Analytics] événement conservé côté client (API indisponible).', event);
    }
  },

  async getEvents(childId: string): Promise<AnalyticsSummary> {
    try {
      const { data } = await api.get<{ status: string; data: AnalyticsSummary }>(
        `/progress/events?childId=${childId}`
      );
      return data.data;
    } catch (error) {
      logApiError(error as any, 'progress/events');
      throw new Error(getApiErrorMessage(error, 'progress')); 
    }
  },
};

export default analyticsService;
