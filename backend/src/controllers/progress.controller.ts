import { Request, Response } from 'express';

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
