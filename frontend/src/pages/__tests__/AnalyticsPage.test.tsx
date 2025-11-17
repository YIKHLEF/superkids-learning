import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsPage from '../AnalyticsPage';
import analyticsService from '../../services/analytics.service';

jest.mock('../../services/analytics.service');

const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;

describe('AnalyticsPage', () => {
  beforeEach(() => {
    mockAnalyticsService.getEvents.mockResolvedValue({
      events: [
        {
          activityId: 'demo',
          childId: 'demo-child',
          type: 'activity_start',
          timestamp: new Date().toISOString(),
          difficulty: 'BEGINNER',
        },
      ],
      aggregates: {
        totalActivities: 1,
        averageSuccessRate: 0.5,
        totalDurationSeconds: 120,
        emotionalStates: { calm: 2 },
        attempts: 2,
      },
    });
  });

  it('affiche les métriques de synthèse', async () => {
    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Activités complétées/i)).toBeInTheDocument();
      expect(screen.getByText(/Taux de réussite moyen/i)).toBeInTheDocument();
    });
  });
});
