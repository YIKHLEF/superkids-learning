import { ActivitySession, DifficultyLevel, PrismaClient, Progress, Reward } from '@prisma/client';
import { ProgressUpdate, DateRange, AnalyticsData, AppError, ActivityEventPayload } from '../types';
import { logger } from '../utils/logger';

export class ProgressService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async recordProgressEvent(event: ActivityEventPayload) {
    if (!this.isDatabaseConfigured()) {
      logger.warn(
        "DATABASE_URL manquant - utilisation de données fictives pour l'analytics de progression"
      );
      return this.buildMockAnalytics(event);
    }

    try {
      const session = await this.executeWithTimeout(
        this.upsertSessionFromEvent(event),
        'progress.upsertSession'
      );
      if (event.type === 'success') {
        await this.executeWithTimeout(
          this.applyRewardsForCompletion(session, event),
          'progress.applyRewards'
        );
      }
      return this.getProgressAnalytics(event.childId);
    } catch (error) {
      logger.error("Erreur lors de l'enregistrement de l'événement de progrès:", error);
      throw new AppError("Impossible d'enregistrer l'événement", 500);
    }
  }

  async getProgressAnalytics(childId?: string) {
    if (!this.isDatabaseConfigured()) {
      logger.warn(
        "DATABASE_URL manquant - renvoi de données de progression fictives"
      );
      return this.buildMockAnalytics();
    }

    const sessions = await this.executeWithTimeout(
      this.prisma.activitySession.findMany({
        where: childId ? { childId } : {},
        include: {
          activity: {
            select: { category: true, difficulty: true, title: true, id: true },
          },
        },
        orderBy: { startTime: 'desc' },
        take: 200,
      }),
      'progress.analytics'
    );

    const aggregates = this.buildAnalyticsAggregates(sessions);
    const events = sessions.map((session) => ({
      activityId: session.activityId,
      childId: session.childId,
      type: session.completed ? 'success' : 'activity_start',
      timestamp: (session.endTime || session.startTime).toISOString(),
      difficulty: session.activity?.difficulty || DifficultyLevel.BEGINNER,
      attempts: session.attempts,
      successRate: session.successRate,
      emotionalState: session.emotionalState || undefined,
      dominantEmotion: session.dominantEmotion || undefined,
      durationSeconds: session.duration || session.durationSeconds,
      supportLevel: session.supportLevel,
      metadata: {
        category: session.activity?.category,
        title: session.activity?.title,
      },
    }));

    return { events, aggregates };
  }

  private isDatabaseConfigured() {
    return Boolean(process.env.DATABASE_URL);
  }

  private async executeWithTimeout<T>(promise: Promise<T>, context: string) {
    const timeoutMs = Number(process.env.DB_QUERY_TIMEOUT_MS || 5000);

    return await Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout ${context} après ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  private buildMockAnalytics(event?: ActivityEventPayload) {
    const fallbackEvent: ActivityEventPayload =
      event ||
      ({
        activityId: 'demo-activity',
        childId: 'demo-child',
        type: 'activity_start',
        timestamp: new Date().toISOString(),
        difficulty: DifficultyLevel.BEGINNER,
        attempts: 1,
        durationSeconds: 120,
      } as ActivityEventPayload);

    const aggregates = {
      totalActivities: fallbackEvent.type === 'success' ? 1 : 0,
      averageSuccessRate: fallbackEvent.successRate ?? 0.75,
      totalDurationSeconds: fallbackEvent.durationSeconds ?? 120,
      emotionalStates: fallbackEvent.emotionalState
        ? { [fallbackEvent.emotionalState]: 1 }
        : {},
      attempts: fallbackEvent.attempts ?? 1,
      skillAverages: {},
    };

    const events = [
      {
        activityId: fallbackEvent.activityId,
        childId: fallbackEvent.childId,
        type: fallbackEvent.type,
        timestamp: fallbackEvent.timestamp,
        difficulty: fallbackEvent.difficulty || DifficultyLevel.BEGINNER,
        attempts: fallbackEvent.attempts,
        successRate: fallbackEvent.successRate ?? 0.75,
        emotionalState: fallbackEvent.emotionalState,
        dominantEmotion: fallbackEvent.dominantEmotion,
        durationSeconds: fallbackEvent.durationSeconds,
        supportLevel: fallbackEvent.supportLevel,
        metadata: {},
      },
    ];

    return { events, aggregates };
  }

  private async upsertSessionFromEvent(event: ActivityEventPayload): Promise<ActivitySession> {
    const { childId, activityId, timestamp } = event;
    const attemptsDelta = event.attempts ?? 0;
    const durationDelta = event.durationSeconds ?? 0;

    const existingSession = await this.prisma.activitySession.findFirst({
      where: { childId, activityId, completed: false },
      orderBy: { startTime: 'desc' },
    });

    if (!existingSession || event.type === 'activity_start') {
      return this.prisma.activitySession.create({
        data: {
          childId,
          activityId,
          startTime: new Date(timestamp),
          attempts: attemptsDelta,
          attemptsCount: attemptsDelta,
          duration: durationDelta,
          durationSeconds: durationDelta,
          supportLevel: event.supportLevel || 'none',
          emotionalState: event.emotionalState,
          dominantEmotion: event.dominantEmotion || event.emotionalState,
          successRate: event.successRate ?? 0,
          completed: event.type === 'success' || event.type === 'activity_end',
          endTime:
            event.type === 'success' || event.type === 'activity_end'
              ? new Date(timestamp)
              : undefined,
        },
      });
    }

    const shouldComplete = event.type === 'success' || event.type === 'activity_end';

    return this.prisma.activitySession.update({
      where: { id: existingSession.id },
      data: {
        attempts: existingSession.attempts + attemptsDelta,
        attemptsCount: existingSession.attemptsCount + attemptsDelta,
        duration: existingSession.duration + durationDelta,
        durationSeconds: existingSession.durationSeconds + durationDelta,
        successRate: event.successRate ?? existingSession.successRate,
        supportLevel: event.supportLevel || existingSession.supportLevel,
        emotionalState: event.emotionalState || existingSession.emotionalState,
        dominantEmotion: event.dominantEmotion || existingSession.dominantEmotion,
        completed: shouldComplete ? true : existingSession.completed,
        endTime: shouldComplete ? new Date(timestamp) : existingSession.endTime,
      },
    });
  }

  private buildAnalyticsAggregates(sessions: ActivitySession[]) {
    const emotionalStates: Record<string, number> = {};
    const skillAverages: Record<string, number> = {};
    const skillCounts: Record<string, number> = {};

    let totalDurationSeconds = 0;
    let totalAttempts = 0;
    let completedSessions = 0;
    let successAccumulator = 0;

    sessions.forEach((session) => {
      totalDurationSeconds += session.duration || session.durationSeconds;
      totalAttempts += session.attempts || session.attemptsCount;

      if (session.completed) {
        completedSessions += 1;
        successAccumulator += session.successRate;
      }

      const emotion = session.dominantEmotion || session.emotionalState;
      if (emotion) {
        emotionalStates[emotion] = (emotionalStates[emotion] || 0) + 1;
      }

      const category = (session as any).activity?.category as string | undefined;
      if (category) {
        skillCounts[category] = (skillCounts[category] || 0) + 1;
        skillAverages[category] =
          (skillAverages[category] || 0) + (session.successRate || 0);
      }
    });

    Object.keys(skillAverages).forEach((key) => {
      skillAverages[key] = skillAverages[key] / (skillCounts[key] || 1);
    });

    const averageSuccessRate = completedSessions
      ? successAccumulator / completedSessions
      : 0;

    return {
      totalActivities: completedSessions,
      averageSuccessRate,
      totalDurationSeconds,
      emotionalStates,
      attempts: totalAttempts,
      skillAverages,
    };
  }

  private async applyRewardsForCompletion(session: ActivitySession, event: ActivityEventPayload) {
    const progress = await this.prisma.progress.upsert({
      where: { childId: session.childId },
      create: { childId: session.childId },
      update: {},
    });

    const tokensEarned = Math.max(5, Math.round((event.successRate || 0.5) * 10));
    const streak = progress.lastActivityDate ? this.calculateNextStreak(progress.lastActivityDate) : 1;

    const updatedAttempts = (progress.totalAttempts || 0) + (event.attempts || 0);
    const updatedDuration = (progress.totalDurationSeconds || 0) + (event.durationSeconds || 0);
    const updatedCompleted = (progress.totalActivitiesCompleted || 0) + 1;
    const updatedAverageSuccess = this.recomputeAverage(progress.averageSuccessRate, progress.totalActivitiesCompleted, event.successRate);

    const badgeMilestone = updatedCompleted % 5 === 0;
    const badgeId = badgeMilestone ? 'milestone-badge' : undefined;

    await this.prisma.progress.update({
      where: { childId: session.childId },
      data: {
        tokensEarned: progress.tokensEarned + tokensEarned,
        totalActivitiesCompleted: updatedCompleted,
        weeklyProgress: (progress.weeklyProgress || 0) + 1,
        lastActivityDate: new Date(event.timestamp),
        currentStreak: streak,
        longestStreak: Math.max(progress.longestStreak || 0, streak),
        totalAttempts: updatedAttempts,
        totalDurationSeconds: updatedDuration,
        averageSuccessRate: updatedAverageSuccess,
        ...(badgeId && { badgesUnlocked: Array.from(new Set([...(progress.badgesUnlocked || []), badgeId])) }),
        ...(badgeId && { rewardsUnlocked: Array.from(new Set([...(progress.rewardsUnlocked || []), badgeId])) }),
      },
    });
  }

  private calculateNextStreak(lastDate: Date) {
    const today = new Date();
    const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince === 0) return 1;
    if (daysSince === 1) return 2;
    return 1;
  }

  private recomputeAverage(currentAverage: number, count: number, nextValue?: number) {
    if (!nextValue && nextValue !== 0) return currentAverage;
    const total = currentAverage * (count || 0);
    return (total + nextValue) / ((count || 0) + 1);
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
