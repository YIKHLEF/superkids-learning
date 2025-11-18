import api from './api';

export interface ReportAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  recommendation?: string;
}

export interface ReportSummary {
  aggregates: {
    totalActivities: number;
    averageSuccessRate: number;
    totalDurationMinutes: number;
    attempts: number;
  };
  skillAverages: Record<string, number>;
  emotionalStates: Record<string, number>;
  alerts: ReportAlert[];
  iepComparison: { objective: string; achievedRate: number }[];
}

export const reportingService = {
  async fetchSummary(childId: string): Promise<ReportSummary> {
    const { data } = await api.get<{ status: string; data: ReportSummary }>(
      `/reports/summary?childId=${childId}`
    );
    return data.data;
  },

  async exportCsv(childId: string): Promise<Blob> {
    const { data } = await api.get(`/reports/export?childId=${childId}&format=csv`, {
      responseType: 'blob',
    });
    return data;
  },
};

export default reportingService;

