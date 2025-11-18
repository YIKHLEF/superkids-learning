import { ReportingService } from '../services/reporting.service';

const analyticsFixture = {
  events: [],
  aggregates: {
    totalActivities: 2,
    averageSuccessRate: 0.42,
    totalDurationSeconds: 720,
    emotionalStates: { calm: 1, anxious: 3 },
    attempts: 6,
    skillAverages: {
      SOCIAL_SKILLS: 0.6,
      COMMUNICATION: 0.4,
    },
  },
};

class MockProgressService {
  async getProgressAnalytics() {
    return analyticsFixture;
  }
}

describe('ReportingService', () => {
  const mockProgress = new MockProgressService() as any;
  const service = new ReportingService({ prisma: {} as any, progressService: mockProgress });

  it('builds alerts based on analytics', async () => {
    const summary = await service.getSummary('child-1');
    expect(summary.alerts.map((a) => a.id)).toEqual(
      expect.arrayContaining(['success-risk', 'engagement-low', 'emotion-anxiety'])
    );
  });

  it('exports a csv snapshot', async () => {
    const csv = await service.exportCsv('child-1');
    expect(csv).toContain('totalActivities,2');
    expect(csv).toContain('skill_SOCIAL_SKILLS,0.60');
    expect(csv.split('\n')[0]).toBe('metric,value');
  });
});

