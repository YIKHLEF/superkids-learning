import { DifficultyLevel } from '@prisma/client';
import { ProgressService } from '../progress.service';
import { ActivityEventPayload } from '../../types';

describe('ProgressService analytics', () => {
  const prismaMock = {
    activitySession: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds aggregates from stored sessions', async () => {
    prismaMock.activitySession.findMany.mockResolvedValue([
      {
        id: 'session-1',
        childId: 'child-1',
        activityId: 'activity-1',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T10:30:00Z'),
        completed: true,
        successRate: 0.8,
        attemptsCount: 3,
        attempts: 3,
        duration: 1800,
        durationSeconds: 1800,
        supportLevel: 'minimal',
        emotionalState: 'calm',
        dominantEmotion: 'calm',
        notes: null,
        activity: {
          id: 'activity-1',
          title: 'Demo activity',
          category: 'SOCIAL_SKILLS',
          difficulty: DifficultyLevel.BEGINNER,
          duration: 10,
          description: '',
          instructions: [],
          targetSkills: [],
          ebpTags: [],
          thumbnailUrl: null,
          videoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ]);

    const service = new ProgressService(prismaMock as any);
    const analytics = await service.getProgressAnalytics('child-1');

    expect(analytics.aggregates.totalDurationSeconds).toBe(1800);
    expect(analytics.aggregates.attempts).toBe(3);
    expect(analytics.aggregates.skillAverages?.SOCIAL_SKILLS).toBeCloseTo(0.8);
    expect(analytics.events[0].dominantEmotion).toBe('calm');
  });

  it('upserts activity sessions when recording events', async () => {
    prismaMock.activitySession.findFirst.mockResolvedValue(null);
    prismaMock.activitySession.create.mockResolvedValue({
      id: 'session-2',
      childId: 'child-2',
      activityId: 'activity-2',
      startTime: new Date('2024-01-01T11:00:00Z'),
      endTime: null,
      completed: false,
      successRate: 0.5,
      attemptsCount: 1,
      attempts: 1,
      duration: 120,
      durationSeconds: 120,
      supportLevel: 'none',
      emotionalState: 'engaged',
      dominantEmotion: 'engaged',
      notes: null,
      activity: null,
    });
    prismaMock.activitySession.findMany.mockResolvedValue([
      {
        id: 'session-2',
        childId: 'child-2',
        activityId: 'activity-2',
        startTime: new Date('2024-01-01T11:00:00Z'),
        endTime: null,
        completed: false,
        successRate: 0.5,
        attemptsCount: 1,
        attempts: 1,
        duration: 120,
        durationSeconds: 120,
        supportLevel: 'none',
        emotionalState: 'engaged',
        dominantEmotion: 'engaged',
        notes: null,
        activity: null,
      },
    ]);

    const service = new ProgressService(prismaMock as any);
    const payload: ActivityEventPayload = {
      activityId: 'activity-2',
      childId: 'child-2',
      type: 'activity_start',
      timestamp: new Date().toISOString(),
      difficulty: DifficultyLevel.BEGINNER,
      attempts: 1,
      successRate: 0.5,
      emotionalState: 'engaged',
      durationSeconds: 120,
      supportLevel: 'none',
    };

    const analytics = await service.recordProgressEvent(payload);

    expect(prismaMock.activitySession.create).toHaveBeenCalled();
    expect(analytics.aggregates.totalDurationSeconds).toBeGreaterThan(0);
  });
});
