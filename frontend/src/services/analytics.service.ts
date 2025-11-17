import api from './api';
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
    await api.post('/progress/events', event);
  },

  async getEvents(childId: string): Promise<AnalyticsSummary> {
    const { data } = await api.get<{ status: string; data: AnalyticsSummary }>(
      `/progress/events?childId=${childId}`
    );
    return data.data;
  },
};

export default analyticsService;
