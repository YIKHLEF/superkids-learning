import { NextFunction, Request, Response } from 'express';
import { ActivityEventPayload } from '../types';
import { ServiceFactory } from '../services';

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

export const getRewards = async (_req: Request, res: Response) => {
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
  const { childId: _childId, rewardId } = req.params;

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

export const recordProgressEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = req.body as ActivityEventPayload;
    const service = ServiceFactory.getProgressService();
    const analytics = await service.recordProgressEvent(event);

    res.json({
      status: 'success',
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

export const listProgressEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { childId } = req.query;
    const service = ServiceFactory.getProgressService();
    const analytics = await service.getProgressAnalytics(childId as string | undefined);

    res.json({
      status: 'success',
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};
