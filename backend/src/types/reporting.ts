export interface ReportAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  recommendation?: string;
}

export interface ReportSummary {
  childId?: string;
  aggregates: {
    totalActivities: number;
    averageSuccessRate: number;
    totalDurationMinutes: number;
    attempts: number;
  };
  skillAverages: Record<string, number>;
  emotionalStates: Record<string, number>;
  alerts: ReportAlert[];
  iepComparison: {
    objective: string;
    achievedRate: number;
  }[];
}

