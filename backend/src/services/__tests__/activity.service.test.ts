import { ActivityService } from '../activity.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../types';

const mockPrisma = {
  activity: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  activitySession: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  childProfile: {
    findUnique: jest.fn(),
  },
  progress: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ActivityService', () => {
  let activityService: ActivityService;

  beforeEach(() => {
    activityService = new ActivityService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getAllActivities', () => {
    it('devrait récupérer toutes les activités sans filtres', async () => {
      const mockActivities = [
        {
          id: 'activity_1',
          title: 'Reconnaître les émotions',
          category: 'SOCIAL_SKILLS',
          difficulty: 'BEGINNER',
        },
        {
          id: 'activity_2',
          title: 'Compter jusqu\'à 10',
          category: 'ACADEMIC',
          difficulty: 'BEGINNER',
        },
      ];

      (mockPrisma.activity.findMany as jest.Mock).mockResolvedValue(
        mockActivities
      );

      const result = await activityService.getAllActivities();

      expect(mockPrisma.activity.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockActivities);
      expect(result).toHaveLength(2);
    });

    it('devrait filtrer les activités par catégorie', async () => {
      const mockActivities = [
        {
          id: 'activity_1',
          title: 'Reconnaître les émotions',
          category: 'SOCIAL_SKILLS',
        },
      ];

      (mockPrisma.activity.findMany as jest.Mock).mockResolvedValue(
        mockActivities
      );

      const result = await activityService.getAllActivities({
        category: 'SOCIAL_SKILLS' as any,
      });

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: {
          category: 'SOCIAL_SKILLS',
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockActivities);
    });

    it('devrait rechercher des activités par texte', async () => {
      const mockActivities = [
        {
          id: 'activity_1',
          title: 'Reconnaître les émotions',
          description: 'Apprendre à identifier les émotions',
        },
      ];

      (mockPrisma.activity.findMany as jest.Mock).mockResolvedValue(
        mockActivities
      );

      const result = await activityService.getAllActivities({
        search: 'émotions',
      });

      expect(mockPrisma.activity.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'émotions', mode: 'insensitive' } },
            { description: { contains: 'émotions', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockActivities);
    });
  });

  describe('getActivityById', () => {
    it('devrait récupérer une activité par son ID', async () => {
      const activityId = 'activity_123';
      const mockActivity = {
        id: activityId,
        title: 'Reconnaître les émotions',
        category: 'SOCIAL_SKILLS',
      };

      (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue(
        mockActivity
      );

      const result = await activityService.getActivityById(activityId);

      expect(mockPrisma.activity.findUnique).toHaveBeenCalledWith({
        where: { id: activityId },
      });
      expect(result).toEqual(mockActivity);
    });

    it('devrait échouer si l\'activité n\'existe pas', async () => {
      const activityId = 'nonexistent';

      (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        activityService.getActivityById(activityId)
      ).rejects.toThrow(AppError);
      await expect(
        activityService.getActivityById(activityId)
      ).rejects.toThrow('Activité introuvable');
    });
  });

  describe('createActivity', () => {
    it('devrait créer une nouvelle activité', async () => {
      const activityData = {
        title: 'Nouvelle activité',
        description: 'Description test',
        category: 'SOCIAL_SKILLS' as any,
        difficulty: 'BEGINNER' as any,
        duration: 10,
        instructions: ['Étape 1', 'Étape 2'],
        targetSkills: ['Communication'],
      };

      const mockCreatedActivity = {
        id: 'activity_new',
        ...activityData,
      };

      (mockPrisma.activity.create as jest.Mock).mockResolvedValue(
        mockCreatedActivity
      );

      const result = await activityService.createActivity(activityData);

      expect(mockPrisma.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: activityData.title,
          category: activityData.category,
        }),
      });
      expect(result).toEqual(mockCreatedActivity);
    });
  });

  describe('startActivitySession', () => {
    it('devrait démarrer une nouvelle session d\'activité', async () => {
      const sessionData = {
        childId: 'child_123',
        activityId: 'activity_123',
      };

      const mockChild = {
        id: sessionData.childId,
        userId: 'user_123',
      };

      const mockActivity = {
        id: sessionData.activityId,
        title: 'Test Activity',
      };

      const mockSession = {
        id: 'session_123',
        childId: sessionData.childId,
        activityId: sessionData.activityId,
        startTime: new Date(),
        activity: mockActivity,
        child: mockChild,
      };

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(
        mockChild
      );
      (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue(
        mockActivity
      );
      (mockPrisma.activitySession.create as jest.Mock).mockResolvedValue(
        mockSession
      );

      const result = await activityService.startActivitySession(sessionData);

      expect(mockPrisma.childProfile.findUnique).toHaveBeenCalledWith({
        where: { id: sessionData.childId },
      });
      expect(mockPrisma.activity.findUnique).toHaveBeenCalledWith({
        where: { id: sessionData.activityId },
      });
      expect(mockPrisma.activitySession.create).toHaveBeenCalled();
      expect(result).toEqual(mockSession);
    });

    it('devrait échouer si l\'enfant n\'existe pas', async () => {
      const sessionData = {
        childId: 'nonexistent',
        activityId: 'activity_123',
      };

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        activityService.startActivitySession(sessionData)
      ).rejects.toThrow(AppError);
      await expect(
        activityService.startActivitySession(sessionData)
      ).rejects.toThrow('Profil enfant introuvable');
    });

    it('devrait échouer si l\'activité n\'existe pas', async () => {
      const sessionData = {
        childId: 'child_123',
        activityId: 'nonexistent',
      };

      const mockChild = { id: sessionData.childId };

      (mockPrisma.childProfile.findUnique as jest.Mock).mockResolvedValue(
        mockChild
      );
      (mockPrisma.activity.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        activityService.startActivitySession(sessionData)
      ).rejects.toThrow(AppError);
      await expect(
        activityService.startActivitySession(sessionData)
      ).rejects.toThrow('Activité introuvable');
    });
  });

  describe('completeActivitySession', () => {
    it('devrait compléter une session avec succès', async () => {
      const sessionId = 'session_123';
      const results = {
        completed: true,
        successRate: undefined,
        correctAnswers: 9,
        totalQuestions: 10,
        attemptsCount: 3,
        supportLevel: 'minimal',
        emotionalState: 'happy',
        notes: 'Très bien réussi',
      };

      const mockSession = {
        id: sessionId,
        childId: 'child_123',
        activityId: 'activity_123',
        activity: { id: 'activity_123', difficulty: 'BEGINNER' },
        child: {
          id: 'child_123',
        },
      };

      const mockUpdatedSession = {
        ...mockSession,
        ...results,
        endTime: expect.any(Date),
        successRate: 0.9,
      };

      const mockProgress = {
        id: 'progress_123',
        childId: 'child_123',
        tokensEarned: 50,
        totalActivitiesCompleted: 5,
        currentStreak: 2,
      };

      (mockPrisma.activitySession.findUnique as jest.Mock).mockResolvedValue(
        mockSession
      );
      (mockPrisma.activitySession.update as jest.Mock).mockResolvedValue(
        mockUpdatedSession
      );
      (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue(
        mockProgress
      );
      (mockPrisma.progress.update as jest.Mock).mockResolvedValue({
        ...mockProgress,
        tokensEarned: 60,
      });

      const result = await activityService.completeActivitySession(
        sessionId,
        results
      );

      expect(mockPrisma.activitySession.update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: expect.objectContaining({
          completed: true,
          successRate: 0.9,
        }),
        include: expect.any(Object),
      });
      const capturedNotes = (mockPrisma.activitySession.update as jest.Mock).mock.calls[0][0].data
        .notes;
      expect(JSON.parse(capturedNotes)).toMatchObject({
        recommendedDifficulty: 'INTERMEDIATE',
        successRate: 0.9,
      });
      expect(result).toEqual(mockUpdatedSession);
    });

    it('devrait échouer si la session n\'existe pas', async () => {
      const sessionId = 'nonexistent';
      const results = {
        completed: true,
        successRate: 0.85,
        attemptsCount: 3,
        supportLevel: 'minimal',
      };

      (mockPrisma.activitySession.findUnique as jest.Mock).mockResolvedValue(
        null
      );

      await expect(
        activityService.completeActivitySession(sessionId, results)
      ).rejects.toThrow(AppError);
      await expect(
        activityService.completeActivitySession(sessionId, results)
      ).rejects.toThrow('Session introuvable');
    });

    it('devrait adapter la difficulté vers le bas quand le score est faible', async () => {
      const sessionId = 'session_low';
      const results = {
        completed: false,
        attemptsCount: 5,
        supportLevel: 'moderate',
        emotionalState: 'frustrated',
        correctAnswers: 2,
        totalQuestions: 8,
      };

      const mockSession = {
        id: sessionId,
        childId: 'child_low',
        activityId: 'activity_low',
        activity: { id: 'activity_low', difficulty: 'ADVANCED' },
        child: { id: 'child_low' },
      };

      (mockPrisma.activitySession.findUnique as jest.Mock).mockResolvedValue(
        mockSession
      );
      (mockPrisma.activitySession.update as jest.Mock).mockResolvedValue({
        ...mockSession,
        successRate: 0.25,
        notes: JSON.stringify({ recommendedDifficulty: 'BEGINNER' }),
      });

      await activityService.completeActivitySession(sessionId, results);

      const payload = (mockPrisma.activitySession.update as jest.Mock).mock
        .calls[0][0].data;
      expect(payload.successRate).toBeCloseTo(0.25);
      expect(JSON.parse(payload.notes).recommendedDifficulty).toBe('BEGINNER');
    });
  });

  describe('getChildActivityHistory', () => {
    it('devrait récupérer l\'historique des activités d\'un enfant', async () => {
      const childId = 'child_123';
      const mockSessions = [
        {
          id: 'session_1',
          childId,
          activityId: 'activity_1',
          completed: true,
          activity: {
            title: 'Activité 1',
          },
        },
        {
          id: 'session_2',
          childId,
          activityId: 'activity_2',
          completed: true,
          activity: {
            title: 'Activité 2',
          },
        },
      ];

      (mockPrisma.activitySession.findMany as jest.Mock).mockResolvedValue(
        mockSessions
      );

      const result = await activityService.getChildActivityHistory(childId);

      expect(mockPrisma.activitySession.findMany).toHaveBeenCalledWith({
        where: { childId },
        include: expect.any(Object),
        orderBy: { startTime: 'desc' },
        take: 50,
      });
      expect(result).toEqual(mockSessions);
      expect(result).toHaveLength(2);
    });
  });

  describe('getActivityStats', () => {
    it('devrait calculer les statistiques d\'activité', async () => {
      const childId = 'child_123';

      (mockPrisma.activitySession.count as jest.Mock)
        .mockResolvedValueOnce(10) // total sessions
        .mockResolvedValueOnce(8); // completed sessions

      (mockPrisma.activitySession.aggregate as jest.Mock).mockResolvedValue({
        _avg: {
          successRate: 0.75,
        },
      });

      (mockPrisma.activitySession.groupBy as jest.Mock).mockResolvedValue([
        { activityId: 'activity_1', _count: 3 },
        { activityId: 'activity_2', _count: 5 },
      ]);

      const result = await activityService.getActivityStats(childId);

      expect(result).toEqual({
        totalSessions: 10,
        completedSessions: 8,
        averageSuccessRate: 0.75,
        categoriesCount: 2,
      });
    });
  });
});
