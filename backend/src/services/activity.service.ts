import { PrismaClient, Activity, ActivitySession, DifficultyLevel } from '@prisma/client';
import {
  ActivityFilters,
  CreateActivityDTO,
  SessionResults,
  StartSessionDTO,
  AppError,
} from '../types';
import { logger } from '../utils/logger';

export class ActivityService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private calculateSuccessRate(results: SessionResults): number {
    if (typeof results.successRate === 'number') {
      return results.successRate;
    }

    if (results.totalQuestions && results.totalQuestions > 0 && typeof results.correctAnswers === 'number') {
      return results.correctAnswers / results.totalQuestions;
    }

    return 0;
  }

  private determineDifficultyAdjustment(
    currentDifficulty: DifficultyLevel,
    successRate: number,
    supportLevel: string,
    hintsUsed = 0
  ): DifficultyLevel {
    if (successRate >= 0.85 && supportLevel === 'none' && hintsUsed === 0) {
      if (currentDifficulty === DifficultyLevel.BEGINNER) return DifficultyLevel.INTERMEDIATE;
      if (currentDifficulty === DifficultyLevel.INTERMEDIATE) return DifficultyLevel.ADVANCED;
    }

    if (successRate < 0.5 || supportLevel === 'moderate' || supportLevel === 'full') {
      return DifficultyLevel.BEGINNER;
    }

    return currentDifficulty;
  }

  private buildSessionNotes(params: {
    baseNotes?: string;
    successRate: number;
    adjustedDifficulty: DifficultyLevel;
    attemptsCount: number;
  }): string {
    const payload = {
      feedback: params.successRate >= 0.7 ? 'Succès solide, encourager la progression.' : 'Renforcer avec du soutien.',
      recommendedDifficulty: params.adjustedDifficulty,
      attempts: params.attemptsCount,
      successRate: params.successRate,
      notes: params.baseNotes,
    };

    return JSON.stringify(payload);
  }

  /**
   * Obtenir toutes les activités avec filtres optionnels
   */
  async getAllActivities(filters?: ActivityFilters): Promise<Activity[]> {
    try {
      const activities = await this.prisma.activity.findMany({
        where: {
          ...(filters?.category && { category: filters.category }),
          ...(filters?.difficulty && { difficulty: filters.difficulty }),
          ...(filters?.search && {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
            ],
          }),
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.info(`Récupération de ${activities.length} activités`);
      return activities;
    } catch (error) {
      logger.error('Erreur lors de la récupération des activités:', error);
      throw new AppError('Erreur lors de la récupération des activités', 500);
    }
  }

  /**
   * Obtenir une activité par ID
   */
  async getActivityById(id: string): Promise<Activity> {
    try {
      const activity = await this.prisma.activity.findUnique({
        where: { id },
      });

      if (!activity) {
        throw new AppError('Activité introuvable', 404);
      }

      logger.info(`Activité récupérée: ${id}`);
      return activity;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la récupération de l\'activité:', error);
      throw new AppError('Erreur lors de la récupération de l\'activité', 500);
    }
  }

  /**
   * Obtenir les activités par catégorie
   */
  async getActivitiesByCategory(category: string): Promise<Activity[]> {
    try {
      const activities = await this.prisma.activity.findMany({
        where: { category: category as any },
        orderBy: { difficulty: 'asc' },
      });

      logger.info(`${activities.length} activités récupérées pour la catégorie: ${category}`);
      return activities;
    } catch (error) {
      logger.error('Erreur lors de la récupération des activités par catégorie:', error);
      throw new AppError(
        'Erreur lors de la récupération des activités par catégorie',
        500
      );
    }
  }

  /**
   * Créer une nouvelle activité
   */
  async createActivity(data: CreateActivityDTO): Promise<Activity> {
    try {
      const activity = await this.prisma.activity.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          difficulty: data.difficulty,
          duration: data.duration,
          thumbnailUrl: data.thumbnailUrl,
          videoUrl: data.videoUrl,
          instructions: data.instructions,
          targetSkills: data.targetSkills,
        },
      });

      logger.info(`Nouvelle activité créée: ${activity.id}`);
      return activity;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'activité:', error);
      throw new AppError('Erreur lors de la création de l\'activité', 500);
    }
  }

  /**
   * Démarrer une session d'activité
   */
  async startActivitySession(
    sessionData: StartSessionDTO
  ): Promise<ActivitySession> {
    try {
      // Vérifier que l'enfant existe
      const child = await this.prisma.childProfile.findUnique({
        where: { id: sessionData.childId },
      });

      if (!child) {
        throw new AppError('Profil enfant introuvable', 404);
      }

      // Vérifier que l'activité existe
      const activity = await this.prisma.activity.findUnique({
        where: { id: sessionData.activityId },
      });

      if (!activity) {
        throw new AppError('Activité introuvable', 404);
      }

      // Créer la session
      const session = await this.prisma.activitySession.create({
        data: {
          childId: sessionData.childId,
          activityId: sessionData.activityId,
        },
        include: {
          activity: true,
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

      logger.info(`Session d'activité démarrée: ${session.id}`);
      return session;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors du démarrage de la session:', error);
      throw new AppError('Erreur lors du démarrage de la session', 500);
    }
  }

  /**
   * Compléter une session d'activité
   */
  async completeActivitySession(
    sessionId: string,
    results: SessionResults
  ): Promise<ActivitySession> {
    try {
      const session = await this.prisma.activitySession.findUnique({
        where: { id: sessionId },
        include: {
          child: true,
          activity: true,
        },
      });

      if (!session) {
        throw new AppError('Session introuvable', 404);
      }

      const computedSuccessRate = this.calculateSuccessRate(results);
      const adjustedDifficulty = this.determineDifficultyAdjustment(
        session.activity?.difficulty || DifficultyLevel.BEGINNER,
        computedSuccessRate,
        results.supportLevel,
        results.hintsUsed
      );

      // Mettre à jour la session
      const updatedSession = await this.prisma.activitySession.update({
        where: { id: sessionId },
        data: {
          endTime: new Date(),
          completed: results.completed,
          successRate: computedSuccessRate,
          attemptsCount: results.attemptsCount,
          supportLevel: results.supportLevel,
          emotionalState: results.emotionalState,
          notes: this.buildSessionNotes({
            baseNotes: results.notes,
            successRate: computedSuccessRate,
            adjustedDifficulty,
            attemptsCount: results.attemptsCount,
          }),
        },
        include: {
          activity: true,
          child: true,
        },
      });

      // Mettre à jour les progrès de l'enfant
      if (results.completed) {
        await this.updateChildProgress(session.childId, {
          ...results,
          successRate: computedSuccessRate,
        });
      }

      logger.info(`Session complétée: ${sessionId}`);
      return updatedSession;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la complétion de la session:', error);
      throw new AppError('Erreur lors de la complétion de la session', 500);
    }
  }

  /**
   * Obtenir l'historique des activités d'un enfant
   */
  async getChildActivityHistory(childId: string): Promise<ActivitySession[]> {
    try {
      const sessions = await this.prisma.activitySession.findMany({
        where: { childId },
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              category: true,
              difficulty: true,
              duration: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        take: 50, // Limiter à 50 sessions récentes
      });

      logger.info(`${sessions.length} sessions récupérées pour l'enfant: ${childId}`);
      return sessions;
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'historique:', error);
      throw new AppError(
        'Erreur lors de la récupération de l\'historique',
        500
      );
    }
  }

  /**
   * Obtenir les statistiques d'activité pour un enfant
   */
  async getActivityStats(childId: string) {
    try {
      const totalSessions = await this.prisma.activitySession.count({
        where: { childId },
      });

      const completedSessions = await this.prisma.activitySession.count({
        where: { childId, completed: true },
      });

      const avgSuccessRate = await this.prisma.activitySession.aggregate({
        where: { childId, completed: true },
        _avg: {
          successRate: true,
        },
      });

      const categoriesStats = await this.prisma.activitySession.groupBy({
        by: ['activityId'],
        where: { childId, completed: true },
        _count: true,
      });

      logger.info(`Statistiques calculées pour l'enfant: ${childId}`);

      return {
        totalSessions,
        completedSessions,
        averageSuccessRate: avgSuccessRate._avg.successRate || 0,
        categoriesCount: categoriesStats.length,
      };
    } catch (error) {
      logger.error('Erreur lors du calcul des statistiques:', error);
      throw new AppError('Erreur lors du calcul des statistiques', 500);
    }
  }

  /**
   * Mettre à jour les progrès de l'enfant après une activité
   */
  private async updateChildProgress(
    childId: string,
    results: SessionResults
  ): Promise<void> {
    try {
      const progress = await this.prisma.progress.findUnique({
        where: { childId },
      });

      if (!progress) {
        // Créer un nouveau progrès si n'existe pas
        await this.prisma.progress.create({
          data: {
            childId,
            totalActivitiesCompleted: 1,
            tokensEarned: results.successRate >= 0.7 ? 10 : 5,
            lastActivityDate: new Date(),
          },
        });
      } else {
        // Calculer les tokens gagnés
        const tokensEarned = results.successRate >= 0.7 ? 10 : 5;

        // Calculer la série (streak)
        const today = new Date();
        const lastActivity = progress.lastActivityDate;
        let newStreak = progress.currentStreak;

        if (lastActivity) {
          const daysDiff = Math.floor(
            (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff === 1) {
            newStreak += 1;
          } else if (daysDiff > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        // Mettre à jour les progrès
        await this.prisma.progress.update({
          where: { childId },
          data: {
            totalActivitiesCompleted: progress.totalActivitiesCompleted + 1,
            tokensEarned: progress.tokensEarned + tokensEarned,
            currentStreak: newStreak,
            longestStreak: Math.max(progress.longestStreak, newStreak),
            lastActivityDate: today,
          },
        });
      }

      logger.info(`Progrès mis à jour pour l'enfant: ${childId}`);
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des progrès:', error);
      // On ne throw pas l'erreur pour ne pas bloquer la complétion de la session
    }
  }
}
