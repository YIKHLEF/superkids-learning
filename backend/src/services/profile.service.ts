import { PrismaClient, ChildProfile } from '@prisma/client';
import { UpdateProfileDTO, PreferencesDTO, AppError, UploadMetadata } from '../types';
import { logger } from '../utils/logger';
import { storageClient } from '../utils/storageClient';

export class ProfileService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtenir le profil d'un enfant par userId
   */
  async getProfile(userId: string): Promise<ChildProfile> {
    try {
      const profile = await this.prisma.childProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          activitySessions: {
            take: 10,
            orderBy: { startTime: 'desc' },
            include: {
              activity: true,
            },
          },
          progress: true,
        },
      });

      if (!profile) {
        throw new AppError('Profil introuvable', 404);
      }

      logger.info(`Profil récupéré: ${userId}`);
      return profile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la récupération du profil:', error);
      throw new AppError('Erreur lors de la récupération du profil', 500);
    }
  }

  /**
   * Créer un profil enfant
   */
  async createProfile(
    userId: string,
    profileData: Omit<UpdateProfileDTO, 'avatarUrl'> & {
      dateOfBirth: Date;
      age: number;
    }
  ): Promise<ChildProfile> {
    try {
      // Vérifier que l'utilisateur existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('Utilisateur introuvable', 404);
      }

      // Vérifier qu'un profil n'existe pas déjà
      const existingProfile = await this.prisma.childProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        throw new AppError('Un profil existe déjà pour cet utilisateur', 409);
      }

      // Créer le profil
      const profile = await this.prisma.childProfile.create({
        data: {
          userId,
          dateOfBirth: profileData.dateOfBirth,
          age: profileData.age,
          developmentLevel: profileData.developmentLevel || 'beginner',
          iepGoals: profileData.iepGoals || [],
          parentIds: profileData.parentIds || [],
          educatorIds: profileData.educatorIds || [],
          sensoryPreferences: profileData.sensoryPreferences || [],
          roles: profileData.roles || [],
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      // Créer automatiquement un objet Progress pour ce profil
      await this.prisma.progress.create({
        data: {
          childId: profile.id,
        },
      });

      logger.info(`Profil créé pour l'utilisateur: ${userId}`);
      return profile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la création du profil:', error);
      throw new AppError('Erreur lors de la création du profil', 500);
    }
  }

  /**
   * Mettre à jour le profil d'un enfant
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileDTO
  ): Promise<ChildProfile> {
    try {
      const profile = await this.prisma.childProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError('Profil introuvable', 404);
      }

      const updatedProfile = await this.prisma.childProfile.update({
        where: { userId },
        data: {
          ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
          ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
          ...(data.developmentLevel && {
            developmentLevel: data.developmentLevel,
          }),
          ...(data.iepGoals && { iepGoals: data.iepGoals }),
          ...(data.parentIds && { parentIds: data.parentIds }),
          ...(data.educatorIds && { educatorIds: data.educatorIds }),
          ...(data.sensoryPreferences && { sensoryPreferences: data.sensoryPreferences }),
          ...(data.roles && { roles: data.roles }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      logger.info(`Profil mis à jour: ${userId}`);
      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la mise à jour du profil:', error);
      throw new AppError('Erreur lors de la mise à jour du profil', 500);
    }
  }

  /**
   * Mettre à jour les préférences d'accessibilité
   */
  async updatePreferences(
    userId: string,
    preferences: PreferencesDTO
  ): Promise<ChildProfile> {
    try {
      const profile = await this.prisma.childProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError('Profil introuvable', 404);
      }

      const updatedProfile = await this.prisma.childProfile.update({
        where: { userId },
        data: {
          ...(preferences.soundEnabled !== undefined && {
            soundEnabled: preferences.soundEnabled,
          }),
          ...(preferences.animationsEnabled !== undefined && {
            animationsEnabled: preferences.animationsEnabled,
          }),
          ...(preferences.dyslexiaMode !== undefined && {
            dyslexiaMode: preferences.dyslexiaMode,
          }),
          ...(preferences.highContrastMode !== undefined && {
            highContrastMode: preferences.highContrastMode,
          }),
          ...(preferences.fontSize && { fontSize: preferences.fontSize }),
        },
      });

      logger.info(`Préférences mises à jour pour: ${userId}`);
      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la mise à jour des préférences:', error);
      throw new AppError(
        'Erreur lors de la mise à jour des préférences',
        500
      );
    }
  }

  /**
   * Obtenir tous les profils enfants d'un parent
   */
  async getAllChildrenProfiles(parentId: string): Promise<ChildProfile[]> {
    try {
      const profiles = await this.prisma.childProfile.findMany({
        where: {
          parentIds: {
            has: parentId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          progress: {
            select: {
              totalActivitiesCompleted: true,
              tokensEarned: true,
              currentStreak: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.info(`${profiles.length} profils récupérés pour le parent: ${parentId}`);
      return profiles;
    } catch (error) {
      logger.error('Erreur lors de la récupération des profils:', error);
      throw new AppError('Erreur lors de la récupération des profils', 500);
    }
  }

  /**
   * Obtenir tous les profils enfants d'un éducateur
   */
  async getEducatorChildrenProfiles(educatorId: string): Promise<ChildProfile[]> {
    try {
      const profiles = await this.prisma.childProfile.findMany({
        where: {
          educatorIds: {
            has: educatorId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
          progress: {
            select: {
              totalActivitiesCompleted: true,
              tokensEarned: true,
              currentStreak: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.info(`${profiles.length} profils récupérés pour l'éducateur: ${educatorId}`);
      return profiles;
    } catch (error) {
      logger.error('Erreur lors de la récupération des profils:', error);
      throw new AppError('Erreur lors de la récupération des profils', 500);
    }
  }

  async uploadAvatar(
    userId: string,
    file?: Express.Multer.File
  ): Promise<{ profile: ChildProfile; metadata: UploadMetadata }> {
    if (!file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const profile = await this.prisma.childProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError('Profil introuvable', 404);
    }

    const metadata = await storageClient.upload(file, 'avatars');
    const updated = await this.prisma.childProfile.update({
      where: { userId },
      data: { avatarUrl: metadata.url },
    });

    return { profile: updated, metadata };
  }

  /**
   * Supprimer un profil enfant
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      const profile = await this.prisma.childProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new AppError('Profil introuvable', 404);
      }

      // Cascade delete géré par Prisma (onDelete: Cascade)
      await this.prisma.childProfile.delete({
        where: { userId },
      });

      logger.info(`Profil supprimé: ${userId}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la suppression du profil:', error);
      throw new AppError('Erreur lors de la suppression du profil', 500);
    }
  }
}
