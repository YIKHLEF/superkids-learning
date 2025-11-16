import { PrismaClient, Progress, Reward } from '@prisma/client';
import { ProgressUpdate, DateRange, AnalyticsData, AppError } from '../types';
import { logger } from '../utils/logger';

export class ProgressService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtenir les progrès d'un enfant
   */
  async getProgress(childId: string): Promise<Progress> {
    try {
      let progress = await this.prisma.progress.findUnique({
        where: { childId },
        include: {
          child: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      // Si le progrès n'existe pas, le créer
      if (!progress) {
        progress = await this.prisma.progress.create({
          data: { childId },
          include: {
            child: {
              select: {
                id: true,
                userId: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        logger.info(`Nouveau progrès créé pour l'enfant: ${childId}`);
      }

      logger.info(`Progrès récupéré pour l'enfant: ${childId}`);
      return progress;
    } catch (error) {
      logger.error('Erreur lors de la récupération des progrès:', error);
      throw new AppError('Erreur lors de la récupération des progrès', 500);
    }
  }

  /**
   * Mettre à jour les progrès d'un enfant
   */
  async updateProgress(
    childId: string,
    update: ProgressUpdate
  ): Promise<Progress> {
    try {
      const progress = await this.prisma.progress.findUnique({
        where: { childId },
      });

      if (!progress) {
        throw new AppError('Progrès introuvable', 404);
      }

      const updatedProgress = await this.prisma.progress.update({
        where: { childId },
        data: {
          ...(update.tokensEarned && {
            tokensEarned: progress.tokensEarned + update.tokensEarned,
          }),
          ...(update.skillsAcquired && {
            skillsAcquired: {
              ...((progress.skillsAcquired as any) || {}),
              ...update.skillsAcquired,
            },
          }),
        },
      });

      logger.info(`Progrès mis à jour pour l'enfant: ${childId}`);
      return updatedProgress;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la mise à jour des progrès:', error);
      throw new AppError('Erreur lors de la mise à jour des progrès', 500);
    }
  }

  /**
   * Obtenir toutes les récompenses disponibles
   */
  async getRewards(childId?: string): Promise<Reward[]> {
    try {
      const rewards = await this.prisma.reward.findMany({
        orderBy: { tokensRequired: 'asc' },
      });

      // Si un childId est fourni, marquer les récompenses débloquées
      if (childId) {
        const progress = await this.prisma.progress.findUnique({
          where: { childId },
          select: { rewardsUnlocked: true },
        });

        // Ajouter une propriété "unlocked" aux récompenses
        const rewardsWithStatus = rewards.map((reward) => ({
          ...reward,
          unlocked: progress?.rewardsUnlocked.includes(reward.id) || false,
        }));

        logger.info(`${rewards.length} récompenses récupérées`);
        return rewardsWithStatus as any;
      }

      logger.info(`${rewards.length} récompenses récupérées`);
      return rewards;
    } catch (error) {
      logger.error('Erreur lors de la récupération des récompenses:', error);
      throw new AppError('Erreur lors de la récupération des récompenses', 500);
    }
  }

  /**
   * Débloquer une récompense pour un enfant
   */
  async unlockReward(childId: string, rewardId: string): Promise<Progress> {
    try {
      // Vérifier que la récompense existe
      const reward = await this.prisma.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward) {
        throw new AppError('Récompense introuvable', 404);
      }

      // Récupérer les progrès de l'enfant
      const progress = await this.prisma.progress.findUnique({
        where: { childId },
      });

      if (!progress) {
        throw new AppError('Progrès introuvable', 404);
      }

      // Vérifier si l'enfant a assez de jetons
      if (progress.tokensEarned < reward.tokensRequired) {
        throw new AppError('Pas assez de jetons pour débloquer cette récompense', 400);
      }

      // Vérifier si la récompense n'est pas déjà débloquée
      if (progress.rewardsUnlocked.includes(rewardId)) {
        throw new AppError('Récompense déjà débloquée', 400);
      }

      // Débloquer la récompense
      const updatedProgress = await this.prisma.progress.update({
        where: { childId },
        data: {
          tokensEarned: progress.tokensEarned - reward.tokensRequired,
          rewardsUnlocked: [...progress.rewardsUnlocked, rewardId],
        },
      });

      logger.info(`Récompense ${rewardId} débloquée pour l'enfant: ${childId}`);
      return updatedProgress;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors du déblocage de la récompense:', error);
      throw new AppError('Erreur lors du déblocage de la récompense', 500);
    }
  }

  /**
   * Calculer la série (streak) d'un enfant
   */
  async calculateStreak(childId: string): Promise<number> {
    try {
      const progress = await this.prisma.progress.findUnique({
        where: { childId },
        select: {
          currentStreak: true,
          lastActivityDate: true,
        },
      });

      if (!progress || !progress.lastActivityDate) {
        return 0;
      }

      // Vérifier si la série est toujours active
      const today = new Date();
      const daysSinceLastActivity = Math.floor(
        (today.getTime() - progress.lastActivityDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Si plus d'un jour, la série est cassée
      if (daysSinceLastActivity > 1) {
        await this.prisma.progress.update({
          where: { childId },
          data: { currentStreak: 0 },
        });
        return 0;
      }

      return progress.currentStreak;
    } catch (error) {
      logger.error('Erreur lors du calcul de la série:', error);
      throw new AppError('Erreur lors du calcul de la série', 500);
    }
  }

  /**
   * Obtenir les analytiques détaillées pour un enfant
   */
  async getAnalytics(
    childId: string,
    period?: DateRange
  ): Promise<AnalyticsData> {
    try {
      const whereClause: any = { childId };

      // Filtrer par période si fournie
      if (period) {
        whereClause.startTime = {
          gte: period.startDate,
          lte: period.endDate,
        };
      }

      // Récupérer toutes les sessions
      const sessions = await this.prisma.activitySession.findMany({
        where: whereClause,
        include: {
          activity: {
            select: {
              category: true,
            },
          },
        },
      });

      const completedSessions = sessions.filter((s) => s.completed);

      // Calculer le taux de réussite moyen
      const successRate =
        completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + s.successRate, 0) /
            completedSessions.length
          : 0;

      // Calculer les catégories favorites
      const categoryCount: Record<string, number> = {};
      completedSessions.forEach((session) => {
        const category = session.activity.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const favoriteCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Calculer les états émotionnels
      const emotionalStates: Record<string, number> = {};
      completedSessions.forEach((session) => {
        if (session.emotionalState) {
          emotionalStates[session.emotionalState] =
            (emotionalStates[session.emotionalState] || 0) + 1;
        }
      });

      // Calculer le temps total passé
      const timeSpent = completedSessions.reduce((total, session) => {
        if (session.endTime && session.startTime) {
          return (
            total +
            (session.endTime.getTime() - session.startTime.getTime()) / 60000
          ); // en minutes
        }
        return total;
      }, 0);

      // Récupérer le streak actuel
      const progress = await this.prisma.progress.findUnique({
        where: { childId },
        select: {
          currentStreak: true,
          skillsAcquired: true,
        },
      });

      const analytics: AnalyticsData = {
        totalActivities: completedSessions.length,
        successRate: Math.round(successRate * 100) / 100,
        favoriteCategories,
        skillProgress: (progress?.skillsAcquired as Record<string, number>) || {},
        emotionalStates,
        timeSpent: Math.round(timeSpent),
        streak: progress?.currentStreak || 0,
      };

      logger.info(`Analytiques calculées pour l'enfant: ${childId}`);
      return analytics;
    } catch (error) {
      logger.error('Erreur lors du calcul des analytiques:', error);
      throw new AppError('Erreur lors du calcul des analytiques', 500);
    }
  }

  /**
   * Obtenir le classement des enfants (leaderboard)
   */
  async getLeaderboard(limit: number = 10) {
    try {
      const topProgress = await this.prisma.progress.findMany({
        orderBy: { tokensEarned: 'desc' },
        take: limit,
        include: {
          child: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                },
              },
              avatarUrl: true,
            },
          },
        },
      });

      logger.info(`Classement récupéré (top ${limit})`);
      return topProgress;
    } catch (error) {
      logger.error('Erreur lors de la récupération du classement:', error);
      throw new AppError('Erreur lors de la récupération du classement', 500);
    }
  }
}
