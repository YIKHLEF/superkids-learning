import { Request, Response } from 'express';
import { ActivityEventPayload } from '../types';

const inMemoryEvents: ActivityEventPayload[] = [];

export const getProgress = async (req: Request, res: Response) => {
  const { childId } = req.params;

  res.json({
    status: 'success',
    data: {
      progress: {
        childId,
        totalActivitiesCompleted: 23,
        tokensEarned: 150,
        skillsAcquired: {
          social_skills: 85,
          communication: 78,
          academic: 92,
          autonomy: 70,
          emotional_regulation: 88,
        },
        currentStreak: 7,
        longestStreak: 12,
        lastActivityDate: new Date(),
        rewardsUnlocked: ['reward-1', 'reward-2'],
        totalDurationSeconds: 3600,
        totalAttempts: 42,
        averageSuccessRate: 0.87,
        dominantEmotionalState: 'calm',
      },
    },
  });
};

export const updateProgress = async (req: Request, res: Response) => {
  const { childId } = req.params;
  const updates = req.body;

  res.json({
    status: 'success',
    data: {
      progress: {
        childId,
        ...updates,
      },
    },
  });
};

export const getRewards = async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      rewards: [
        {
          id: 'reward-1',
          name: 'Champion du jour',
          description: 'Complète 5 activités en un jour',
          iconUrl: '/rewards/champion.png',
          tokensRequired: 50,
          type: 'badge',
          unlocked: true,
        },
      ],
    },
  });
};

export const unlockReward = async (req: Request, res: Response) => {
  const { childId, rewardId } = req.params;

  res.json({
    status: 'success',
    data: {
      message: 'Récompense débloquée!',
      reward: {
        id: rewardId,
        unlocked: true,
      },
    },
  });
};

export const recordProgressEvent = async (req: Request, res: Response) => {
  const event = req.body as ActivityEventPayload;
  inMemoryEvents.push(event);

  res.json({
    status: 'success',
    data: { event },
  });
};

export const listProgressEvents = async (req: Request, res: Response) => {
  const { childId } = req.query;
  const filtered = childId
    ? inMemoryEvents.filter((event) => event.childId === childId)
    : inMemoryEvents;

  const totalDurationSeconds = filtered.reduce(
    (acc, event) => acc + (event.durationSeconds || 0),
    0
  );
  const attempts = filtered.reduce((acc, event) => acc + (event.attempts || 0), 0);
  const emotionalStates = filtered.reduce<Record<string, number>>((map, event) => {
    if (event.emotionalState) {
      map[event.emotionalState] = (map[event.emotionalState] || 0) + 1;
    }
    return map;
  }, {});

  const successEvents = filtered.filter((event) => event.type === 'success');
  const averageSuccessRate = successEvents.length
    ?
        successEvents.reduce((acc, event) => acc + (event.successRate ?? 1), 0) /
      successEvents.length
    : 0;

  res.json({
    status: 'success',
    data: {
      events: filtered,
      aggregates: {
        totalActivities: filtered.filter((e) => e.type === 'activity_start').length,
        averageSuccessRate,
        totalDurationSeconds,
        emotionalStates,
        attempts,
      },
    },
  });
};
