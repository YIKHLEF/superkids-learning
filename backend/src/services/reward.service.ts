import { PrismaClient, RewardType } from '@prisma/client';
import { AppError } from '../types';
import { logger } from '../utils/logger';
import { ActivityRewardPayload } from '../types';

export class RewardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getRewardSummary(childId: string) {
    const progress = await this.prisma.progress.findUnique({ where: { childId } });

    if (!progress) {
      throw new AppError('Progrès introuvable', 404);
    }

    const rewards = await this.prisma.reward.findMany({ orderBy: { tokensRequired: 'asc' } });
    const unlocked = new Set(progress.rewardsUnlocked);

    return {
      tokensEarned: progress.tokensEarned,
      rewards: rewards.map((reward) => ({
        ...reward,
        unlocked: unlocked.has(reward.id),
      })),
    } as any;
  }

  async awardForActivity(payload: ActivityRewardPayload) {
    const { childId, activityId, tokens = 0, badgeId, avatarId, themeId, rewardType } = payload;

    let progress = await this.prisma.progress.findUnique({ where: { childId } });

    if (!progress) {
      progress = await this.prisma.progress.create({
        data: {
          childId,
          tokensEarned: 0,
          totalActivitiesCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          rewardsUnlocked: [],
        },
      });
      logger.info(`Progress créé pour ${childId} avant attribution de récompense`);
    }

    const unlockedRewards = new Set(progress.rewardsUnlocked);
    const badgesUnlocked = new Set(progress.badgesUnlocked || []);
    const avatarsUnlocked = new Set(progress.avatarsUnlocked || []);
    const themesUnlocked = new Set(progress.themesUnlocked || []);

    if (badgeId) {
      unlockedRewards.add(badgeId);
      badgesUnlocked.add(badgeId);
    }
    if (avatarId) {
      unlockedRewards.add(avatarId);
      avatarsUnlocked.add(avatarId);
    }
    if (themeId) {
      unlockedRewards.add(themeId);
      themesUnlocked.add(themeId);
    }

    const updatedProgress = await this.prisma.progress.update({
      where: { childId },
      data: {
        tokensEarned: progress.tokensEarned + tokens,
        totalActivitiesCompleted: (progress.totalActivitiesCompleted || 0) + 1,
        rewardsUnlocked: Array.from(unlockedRewards),
        badgesUnlocked: Array.from(badgesUnlocked),
        avatarsUnlocked: Array.from(avatarsUnlocked),
        themesUnlocked: Array.from(themesUnlocked),
        lastActivityDate: new Date(),
        weeklyProgress: (progress.weeklyProgress || 0) + 1,
      },
    });

    const rewards = await this.prisma.reward.findMany({ orderBy: { tokensRequired: 'asc' } });
    logger.info(
      `Récompenses attribuées pour l'activité ${activityId} (${tokens} jetons, type ${rewardType || 'generic'}).`
    );

    return {
      balance: updatedProgress.tokensEarned,
      unlocked: Array.from(unlockedRewards),
      rewards: rewards.map((reward) => ({
        ...reward,
        unlocked: unlockedRewards.has(reward.id),
        owned:
          reward.type === RewardType.BADGE
            ? badgesUnlocked.has(reward.id)
            : reward.type === RewardType.AVATAR
            ? avatarsUnlocked.has(reward.id)
            : themesUnlocked.has(reward.id),
      })),
    } as any;
  }
}
