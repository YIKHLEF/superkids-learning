import request from 'supertest';
import express, { Application } from 'express';
import adaptiveRoutes from '../../routes/adaptive.routes';
import { AdaptiveService } from '../../services';
import { AdaptiveContext } from '../../types';
import { ActivityCategory, DifficultyLevel } from '@prisma/client';

describe('Adaptive routes', () => {
  let app: Application;
  const context: AdaptiveContext = {
    childId: 'child-123',
    targetCategory: ActivityCategory.SOCIAL_SKILLS,
    currentDifficulty: DifficultyLevel.BEGINNER,
    recentPerformance: [{ successRate: 0.6, attemptsCount: 3 }],
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/adaptive', adaptiveRoutes);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return adaptive recommendation', async () => {
    jest.spyOn(AdaptiveService.prototype, 'getRecommendations').mockResolvedValue({
      childId: context.childId,
      nextDifficulty: 'INTERMEDIATE' as any,
      recommendations: [],
      rationale: ['test'],
    });

    const response = await request(app)
      .post('/api/adaptive/recommendations')
      .send(context)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.recommendation.nextDifficulty).toBe('INTERMEDIATE');
    expect(response.body.data.source).toBeDefined();
  });

  it('should handle service errors', async () => {
    jest.spyOn(AdaptiveService.prototype, 'getRecommendations').mockRejectedValue(new Error('failure'));

    const response = await request(app)
      .post('/api/adaptive/recommendations')
      .send(context)
      .expect(500);

    expect(response.body.status).toBe('error');
  });
});
