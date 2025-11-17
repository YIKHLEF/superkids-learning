import { PrismaClient, ChildProfile } from '@prisma/client';
import { ZodError } from 'zod';
import {
  UpdateProfileDTO,
  PreferencesDTO,
  AppError,
  UploadMetadata,
} from '../types';
import {
  parsePreferencesDTO,
  parseUpdateProfileDTO,
  uiPreferencesSchema,
} from '../types/profile';
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

      const parsedGoals = profileData.iepGoals
        ? parseUpdateProfileDTO({ iepGoals: profileData.iepGoals }).iepGoals
        : [];
      const parsedUiPreferences = uiPreferencesSchema.parse(profileData.uiPreferences ?? {});

      const profile = await this.prisma.childProfile.create({
        data: {
          userId,
          dateOfBirth: profileData.dateOfBirth,
          age: profileData.age,
          developmentLevel: profileData.developmentLevel || 'beginner',
          iepGoals: parsedGoals || [],
          parentIds: profileData.parentIds || [],
          educatorIds: profileData.educatorIds || [],
          sensoryPreferences: profileData.sensoryPreferences || [],
          roles: profileData.roles || [],
          uiPreferences: parsedUiPreferences,
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
      if (error instanceof ZodError) {
        throw new AppError(error.errors[0]?.message || 'Profil invalide', 400);
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

      const parsedData = parseUpdateProfileDTO(data);
      const mergedUiPreferences = parsedData.uiPreferences
        ? {
            ...uiPreferencesSchema.parse(profile.uiPreferences ?? {}),
            ...parsedData.uiPreferences,
          }
        : undefined;

      const updatedProfile = await this.prisma.childProfile.update({
        where: { userId },
        data: {
          ...(parsedData.dateOfBirth && { dateOfBirth: parsedData.dateOfBirth }),
          ...(parsedData.avatarUrl && { avatarUrl: parsedData.avatarUrl }),
          ...(parsedData.developmentLevel && {
            developmentLevel: parsedData.developmentLevel,
          }),
          ...(parsedData.iepGoals && { iepGoals: parsedData.iepGoals }),
          ...(parsedData.parentIds && { parentIds: parsedData.parentIds }),
          ...(parsedData.educatorIds && { educatorIds: parsedData.educatorIds }),
          ...(parsedData.sensoryPreferences && { sensoryPreferences: parsedData.sensoryPreferences }),
          ...(parsedData.roles && { roles: parsedData.roles }),
          ...(mergedUiPreferences && { uiPreferences: mergedUiPreferences }),
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
      if (error instanceof ZodError) {
        throw new AppError(error.errors[0]?.message || 'Données invalides', 400);
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

      const parsedPreferences = parsePreferencesDTO(preferences);
      const mergedUiPreferences = parsedPreferences.uiPreferences
        ? {
            ...uiPreferencesSchema.parse(profile.uiPreferences ?? {}),
            ...parsedPreferences.uiPreferences,
          }
        : uiPreferencesSchema.parse(profile.uiPreferences ?? {});

      const updatedProfile = await this.prisma.childProfile.update({
        where: { userId },
        data: {
          ...(parsedPreferences.soundEnabled !== undefined && {
            soundEnabled: parsedPreferences.soundEnabled,
          }),
          ...(parsedPreferences.animationsEnabled !== undefined && {
            animationsEnabled: parsedPreferences.animationsEnabled,
          }),
          ...(parsedPreferences.dyslexiaMode !== undefined && {
            dyslexiaMode: parsedPreferences.dyslexiaMode,
          }),
          ...(parsedPreferences.highContrastMode !== undefined && {
            highContrastMode: parsedPreferences.highContrastMode,
          }),
          ...(parsedPreferences.fontSize && { fontSize: parsedPreferences.fontSize }),
          uiPreferences: mergedUiPreferences,
        },
      });

      logger.info(`Préférences mises à jour pour: ${userId}`);
      return updatedProfile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof ZodError) {
        throw new AppError(error.errors[0]?.message || 'Préférences invalides', 400);
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
