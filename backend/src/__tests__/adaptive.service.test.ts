import { ActivityCategory, DifficultyLevel, SensoryPreference } from '@prisma/client';
import { AdaptiveService } from '../services/adaptive.service';
import { AdaptiveContext } from '../types';

describe('AdaptiveService', () => {
  const baseContext: AdaptiveContext = {
    childId: 'child-1',
    targetCategory: ActivityCategory.SOCIAL_SKILLS,
    currentDifficulty: DifficultyLevel.INTERMEDIATE,
    currentActivityId: 'activity-1',
    recentPerformance: [
      {
        successRate: 0.9,
        attemptsCount: 1,
        emotionalState: 'calm',
        supportLevel: 'minimal',
      },
    ],
    personalization: { prefersLowStimuli: true },
    sensoryPreferences: [SensoryPreference.LOW_STIMULATION],
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should downgrade advanced difficulty when low stimulation is preferred', async () => {
    const service = new AdaptiveService({ mlEnabled: false });

    const recommendation = await service.getRecommendations({
      ...baseContext,
      currentDifficulty: DifficultyLevel.ADVANCED,
    });

    expect(recommendation.nextDifficulty).toBe(DifficultyLevel.INTERMEDIATE);
    expect(recommendation.recommendations[0].difficulty).toBe(DifficultyLevel.INTERMEDIATE);
  });

  it('should call ML connector when enabled and normalize the response', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        nextDifficulty: DifficultyLevel.ADVANCED,
        recommendations: [
          { category: ActivityCategory.ACADEMIC, difficulty: DifficultyLevel.ADVANCED, weight: 0.8, reason: 'test' },
        ],
        explanation: ['ml used'],
      }),
    } as any);

    const service = new AdaptiveService({
      mlEnabled: true,
      mlEndpoint: 'http://ml-endpoint',
      mlApiKey: 'secret',
    });

    const recommendation = await service.getRecommendations(baseContext);

    expect(fetchMock).toHaveBeenCalled();
    expect(recommendation.nextDifficulty).toBe(DifficultyLevel.ADVANCED);
    expect(recommendation.recommendations[0].reason).toBe('test');
    expect(recommendation.rationale).toContain('ml used');
  });
});
