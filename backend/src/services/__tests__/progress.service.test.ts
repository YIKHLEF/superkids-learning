import { ProgressService } from '../progress.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../types';

const mockPrisma = {
  progress: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  reward: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  activitySession: {
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ProgressService', () => {
  let progressService: ProgressService;

  beforeEach(() => {
    progressService = new ProgressService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getProgress', () => {
    it('devrait récupérer les progrès existants', async () => {
      const childId = 'child_123';
      const mockProgress = {
        id: 'progress_123',
        childId,
        tokensEarned: 100,
        totalActivitiesCompleted: 25,
        currentStreak: 5,
        child: {
          id: childId,
          userId: 'user_123',
          user: { name: 'Test Child' },
        },
      };

      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );

      const result = await progressService.getProgress(childId);

      expect(mockPrisma.progress.findUnique).toHaveBeenCalledWith({
        where: { childId },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockProgress);
    });

    it('devrait créer un nouveau progrès s\'il n\'existe pas', async () => {
      const childId = 'child_123';
      const mockCreatedProgress = {
        id: 'progress_new',
        childId,
        tokensEarned: 0,
        totalActivitiesCompleted: 0,
        currentStreak: 0,
        child: {
          id: childId,
          userId: 'user_123',
          user: { name: 'Test Child' },
        },
      };

      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.progress.create as jest.Mock).mockResolvedValue(
        mockCreatedProgress
      );

      const result = await progressService.getProgress(childId);

      expect(mockPrisma.progress.create).toHaveBeenCalledWith({
        data: { childId },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockCreatedProgress);
    });
  });

  describe('updateProgress', () => {
    it('devrait mettre à jour les progrès', async () => {
      const childId = 'child_123';
      const update = {
        tokensEarned: 10,
        skillsAcquired: { communication: 5 },
      };

      const mockProgress = {
        id: 'progress_123',
        childId,
        tokensEarned: 50,
        skillsAcquired: {},
      };

      const mockUpdatedProgress = {
        ...mockProgress,
        tokensEarned: 60,
        skillsAcquired: { communication: 5 },
      };

      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );
      (mockPrisma.progress.update as jest.Mock).mockResolvedValue(
        mockUpdatedProgress
      );

      const result = await progressService.updateProgress(childId, update);

      expect(mockPrisma.progress.update).toHaveBeenCalled();
      expect(result.tokensEarned).toBe(60);
    });

    it('devrait échouer si les progrès n\'existent pas', async () => {
      const childId = 'child_123';
      const update = { tokensEarned: 10 };

      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        progressService.updateProgress(childId, update)
      ).rejects.toThrow(AppError);
      await expect(
        progressService.updateProgress(childId, update)
      ).rejects.toThrow('Progrès introuvable');
    });
  });

  describe('getRewards', () => {
    it('devrait récupérer toutes les récompenses', async () => {
      const mockRewards = [
        {
          id: 'reward_1',
          name: 'Badge Bronze',
          tokensRequired: 10,
        },
        {
          id: 'reward_2',
          name: 'Badge Argent',
          tokensRequired: 50,
        },
      ];

      (mockPrisma.reward.findMany as jest.Mock).mockResolvedValue(mockRewards);

      const result = await progressService.getRewards();

      expect(mockPrisma.reward.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockRewards);
      expect(result).toHaveLength(2);
    });

    it('devrait marquer les récompenses débloquées pour un enfant', async () => {
      const childId = 'child_123';
      const mockRewards = [
        { id: 'reward_1', name: 'Badge Bronze', tokensRequired: 10 },
        { id: 'reward_2', name: 'Badge Argent', tokensRequired: 50 },
      ];

      const mockProgress = {
        rewardsUnlocked: ['reward_1'],
      };

      (mockPrisma.reward.findMany as jest.Mock).mockResolvedValue(mockRewards);
      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );

      const result = await progressService.getRewards(childId);

      expect(result[0]).toHaveProperty('unlocked', true);
      expect(result[1]).toHaveProperty('unlocked', false);
    });
  });

  describe('unlockReward', () => {
    it('devrait débloquer une récompense si assez de jetons', async () => {
      const childId = 'child_123';
      const rewardId = 'reward_1';

      const mockReward = {
        id: rewardId,
        name: 'Badge Bronze',
        tokensRequired: 10,
      };

      const mockProgress = {
        id: 'progress_123',
        childId,
        tokensEarned: 50,
        rewardsUnlocked: [],
      };

      const mockUpdatedProgress = {
        ...mockProgress,
        tokensEarned: 40,
        rewardsUnlocked: [rewardId],
      };

      (mockPrisma.reward.findUnique as jest.Mock).mockResolvedValue(mockReward);
      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );
      (mockPrisma.progress.update as jest.Mock).mockResolvedValue(
        mockUpdatedProgress
      );

      const result = await progressService.unlockReward(childId, rewardId);

      expect(result.tokensEarned).toBe(40);
      expect(result.rewardsUnlocked).toContain(rewardId);
    });

    it('devrait échouer si pas assez de jetons', async () => {
      const childId = 'child_123';
      const rewardId = 'reward_1';

      const mockReward = {
        id: rewardId,
        tokensRequired: 100,
      };

      const mockProgress = {
        childId,
        tokensEarned: 50,
        rewardsUnlocked: [],
      };

      (mockPrisma.reward.findUnique as jest.Mock).mockResolvedValue(mockReward);
      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );

      await expect(
        progressService.unlockReward(childId, rewardId)
      ).rejects.toThrow(AppError);
      await expect(
        progressService.unlockReward(childId, rewardId)
      ).rejects.toThrow('Pas assez de jetons');
    });

    it('devrait échouer si la récompense est déjà débloquée', async () => {
      const childId = 'child_123';
      const rewardId = 'reward_1';

      const mockReward = {
        id: rewardId,
        tokensRequired: 10,
      };

      const mockProgress = {
        childId,
        tokensEarned: 50,
        rewardsUnlocked: [rewardId],
      };

      (mockPrisma.reward.findUnique as jest.Mock).mockResolvedValue(mockReward);
      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );

      await expect(
        progressService.unlockReward(childId, rewardId)
      ).rejects.toThrow(AppError);
      await expect(
        progressService.unlockReward(childId, rewardId)
      ).rejects.toThrow('Récompense déjà débloquée');
    });
  });

  describe('calculateStreak', () => {
    it('devrait retourner le streak actuel si actif', async () => {
      const childId = 'child_123';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockProgress = {
        currentStreak: 5,
        lastActivityDate: yesterday,
      };

      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );

      const result = await progressService.calculateStreak(childId);

      expect(result).toBe(5);
    });

    it('devrait réinitialiser le streak si inactif depuis plus d\'un jour', async () => {
      const childId = 'child_123';
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockProgress = {
        currentStreak: 5,
        lastActivityDate: threeDaysAgo,
      };

      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );
      (mockPrisma.progress.update as jest.Mock).mockResolvedValue({
        ...mockProgress,
        currentStreak: 0,
      });

      const result = await progressService.calculateStreak(childId);

      expect(mockPrisma.progress.update).toHaveBeenCalledWith({
        where: { childId },
        data: { currentStreak: 0 },
      });
      expect(result).toBe(0);
    });
  });

  describe('getAnalytics', () => {
    it('devrait calculer les analytiques détaillées', async () => {
      const childId = 'child_123';

      const mockSessions = [
        {
          id: 'session_1',
          childId,
          completed: true,
          successRate: 0.8,
          emotionalState: 'happy',
          startTime: new Date('2024-01-01T10:00:00'),
          endTime: new Date('2024-01-01T10:15:00'),
          activity: { category: 'SOCIAL_SKILLS' },
        },
        {
          id: 'session_2',
          childId,
          completed: true,
          successRate: 0.9,
          emotionalState: 'happy',
          startTime: new Date('2024-01-01T11:00:00'),
          endTime: new Date('2024-01-01T11:20:00'),
          activity: { category: 'ACADEMIC' },
        },
      ];

      const mockProgress = {
        currentStreak: 3,
        skillsAcquired: { communication: 5, math: 3 },
      };

      (mockPrisma.activitySession.findMany as jest.Mock).mockResolvedValue(
        mockSessions
      );
      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );

      const result = await progressService.getAnalytics(childId);

      expect(result).toHaveProperty('totalActivities', 2);
      expect(result).toHaveProperty('successRate', 0.85); // (0.8 + 0.9) / 2
      expect(result).toHaveProperty('favoriteCategories');
      expect(result).toHaveProperty('emotionalStates');
      expect(result).toHaveProperty('streak', 3);
      expect(result.emotionalStates).toHaveProperty('happy', 2);
    });
  });

  describe('getLeaderboard', () => {
    it('devrait récupérer le classement des enfants', async () => {
      const mockLeaderboard = [
        {
          id: 'progress_1',
          tokensEarned: 500,
          child: {
            id: 'child_1',
            user: { name: 'Enfant 1' },
          },
        },
        {
          id: 'progress_2',
          tokensEarned: 300,
          child: {
            id: 'child_2',
            user: { name: 'Enfant 2' },
          },
        },
      ];

      (mockPrisma.progress.findMany as jest.Mock).mockResolvedValue(
        mockLeaderboard
      );

      const result = await progressService.getLeaderboard(10);

      expect(mockPrisma.progress.findMany).toHaveBeenCalledWith({
        orderBy: { tokensEarned: 'desc' },
        take: 10,
        include: expect.any(Object),
      });
      expect(result).toEqual(mockLeaderboard);
      expect(result).toHaveLength(2);
    });
  });
});
