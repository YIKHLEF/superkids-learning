import { ProfileService } from '../profile.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../types';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  childProfile: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  progress: {
    create: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ProfileService', () => {
  let profileService: ProfileService;

  beforeEach(() => {
    profileService = new ProfileService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('devrait récupérer un profil existant', async () => {
      const userId = '123';
      const mockProfile = {
        id: 'profile_123',
        userId,
        dateOfBirth: new Date('2015-01-01'),
        age: 9,
        user: {
          id: userId,
          email: 'child@example.com',
          name: 'Test Child',
          role: 'CHILD',
        },
        activitySessions: [],
        progress: null,
      };

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile
      );

      const result = await profileService.getProfile(userId);

      expect(mockPrisma.childProfile.findUnique).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockProfile);
    });

    it('devrait échouer si le profil n\'existe pas', async () => {
      const userId = '123';

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(profileService.getProfile(userId)).rejects.toThrow(AppError);
      await expect(profileService.getProfile(userId)).rejects.toThrow(
        'Profil introuvable'
      );
    });
  });

  describe('createProfile', () => {
    it('devrait créer un nouveau profil avec succès', async () => {
      const userId = '123';
      const profileData = {
        dateOfBirth: new Date('2015-01-01'),
        age: 9,
        developmentLevel: 'intermediate',
        iepGoals: ['Améliorer communication', 'Autonomie'],
        parentIds: ['parent_1'],
        educatorIds: [],
      };

      const mockUser = {
        id: userId,
        email: 'child@example.com',
        name: 'Test Child',
        role: 'CHILD',
      };

      const mockProfile = {
        id: 'profile_123',
        userId,
        ...profileData,
        sensoryPreferences: [],
        user: mockUser,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.childProfile.create as jest.Mock).mockResolvedValue(
        mockProfile
      );
      (mockPrisma.progress.create as jest.Mock).mockResolvedValue({
        id: 'progress_123',
        childId: mockProfile.id,
      });

      const result = await profileService.createProfile(userId, profileData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrisma.childProfile.create).toHaveBeenCalled();
      expect(mockPrisma.progress.create).toHaveBeenCalledWith({
        data: { childId: mockProfile.id },
      });
      expect(result).toEqual(mockProfile);
    });

    it('devrait échouer si l\'utilisateur n\'existe pas', async () => {
      const userId = '123';
      const profileData = {
        dateOfBirth: new Date('2015-01-01'),
        age: 9,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        profileService.createProfile(userId, profileData)
      ).rejects.toThrow(AppError);
      await expect(
        profileService.createProfile(userId, profileData)
      ).rejects.toThrow('Utilisateur introuvable');
    });

    it('devrait échouer si un profil existe déjà', async () => {
      const userId = '123';
      const profileData = {
        dateOfBirth: new Date('2015-01-01'),
        age: 9,
      };

      const mockUser = { id: userId };
      const mockExistingProfile = { id: 'profile_123', userId };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(
        mockExistingProfile
      );

      await expect(
        profileService.createProfile(userId, profileData)
      ).rejects.toThrow(AppError);
      await expect(
        profileService.createProfile(userId, profileData)
      ).rejects.toThrow('Un profil existe déjà pour cet utilisateur');
    });
  });

  describe('updateProfile', () => {
    it('devrait mettre à jour un profil existant', async () => {
      const userId = '123';
      const updateData = {
        avatarUrl: 'https://example.com/avatar.jpg',
        developmentLevel: 'advanced',
        iepGoals: ['Nouveau objectif'],
      };

      const mockProfile = {
        id: 'profile_123',
        userId,
      };

      const mockUpdatedProfile = {
        ...mockProfile,
        ...updateData,
        user: {
          id: userId,
          name: 'Test Child',
        },
      };

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile
      );
      (mockPrisma.childProfile.update as jest.Mock).mockResolvedValue(
        mockUpdatedProfile
      );

      const result = await profileService.updateProfile(userId, updateData);

      expect(mockPrisma.childProfile.update).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('devrait échouer si le profil n\'existe pas', async () => {
      const userId = '123';
      const updateData = { avatarUrl: 'https://example.com/avatar.jpg' };

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        profileService.updateProfile(userId, updateData)
      ).rejects.toThrow(AppError);
      await expect(
        profileService.updateProfile(userId, updateData)
      ).rejects.toThrow('Profil introuvable');
    });
  });

  describe('updatePreferences', () => {
    it('devrait mettre à jour les préférences', async () => {
      const userId = '123';
      const preferences = {
        soundEnabled: false,
        dyslexiaMode: true,
        highContrastMode: true,
      };

      const mockProfile = {
        id: 'profile_123',
        userId,
      };

      const mockUpdatedProfile = {
        ...mockProfile,
        ...preferences,
      };

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile
      );
      (mockPrisma.childProfile.update as jest.Mock).mockResolvedValue(
        mockUpdatedProfile
      );

      const result = await profileService.updatePreferences(
        userId,
        preferences
      );

      expect(mockPrisma.childProfile.update).toHaveBeenCalledWith({
        where: { userId },
        data: expect.objectContaining({
          soundEnabled: false,
          dyslexiaMode: true,
          highContrastMode: true,
        }),
      });
      expect(result).toEqual(mockUpdatedProfile);
    });
  });

  describe('getAllChildrenProfiles', () => {
    it('devrait récupérer tous les profils enfants d\'un parent', async () => {
      const parentId = 'parent_123';
      const mockProfiles = [
        {
          id: 'profile_1',
          userId: 'user_1',
          parentIds: [parentId],
          user: { name: 'Enfant 1' },
          progress: { tokensEarned: 100 },
        },
        {
          id: 'profile_2',
          userId: 'user_2',
          parentIds: [parentId],
          user: { name: 'Enfant 2' },
          progress: { tokensEarned: 50 },
        },
      ];

      (mockPrisma.childProfile.findMany as jest.Mock).mockResolvedValue(
        mockProfiles
      );

      const result = await profileService.getAllChildrenProfiles(parentId);

      expect(mockPrisma.childProfile.findMany).toHaveBeenCalledWith({
        where: {
          parentIds: {
            has: parentId,
          },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockProfiles);
      expect(result).toHaveLength(2);
    });
  });

  describe('deleteProfile', () => {
    it('devrait supprimer un profil existant', async () => {
      const userId = '123';
      const mockProfile = {
        id: 'profile_123',
        userId,
      };

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(
        mockProfile
      );
      (mockPrisma.childProfile.delete as jest.Mock).mockResolvedValue(
        mockProfile
      );

      await profileService.deleteProfile(userId);

      expect(mockPrisma.childProfile.delete).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('devrait échouer si le profil n\'existe pas', async () => {
      const userId = '123';

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(profileService.deleteProfile(userId)).rejects.toThrow(
        AppError
      );
      await expect(profileService.deleteProfile(userId)).rejects.toThrow(
        'Profil introuvable'
      );
    });
  });
});
