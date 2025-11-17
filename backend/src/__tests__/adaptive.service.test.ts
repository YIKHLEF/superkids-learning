import { ActivityCategory, DifficultyLevel, SensoryPreference } from '@prisma/client';
import { AdaptiveService } from '../services/adaptive.service';
import { AdaptiveContext } from '../types';

describe('AdaptiveService', () => {
  const baseContext: AdaptiveContext = {
    childId: '11111111-1111-1111-1111-111111111111',
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

    const result = await service.getRecommendations({
      ...baseContext,
      currentDifficulty: DifficultyLevel.ADVANCED,
    });

    expect(result.source).toBe('heuristic');
    expect(result.recommendation.nextDifficulty).toBe(DifficultyLevel.INTERMEDIATE);
    expect(result.recommendation.recommendations[0].difficulty).toBe(DifficultyLevel.INTERMEDIATE);
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

    const result = await service.getRecommendations(baseContext);

    expect(fetchMock).toHaveBeenCalled();
    expect(result.source).toBe('ml');
    expect(result.recommendation.nextDifficulty).toBe(DifficultyLevel.ADVANCED);
    expect(result.recommendation.recommendations[0].reason).toBe('test');
    expect(result.recommendation.rationale).toContain('ml used');
  });

  it('should persist recommendations for audit', async () => {
    const createSpy = jest.fn();
    const service = new AdaptiveService({ mlEnabled: false, prisma: { adaptiveRecommendation: { create: createSpy } } } as any);

    const result = await service.getRecommendations(baseContext);

    expect(result.source).toBe('heuristic');
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          childId: baseContext.childId,
          source: 'heuristic',
        }),
      })
    );
  });
});
