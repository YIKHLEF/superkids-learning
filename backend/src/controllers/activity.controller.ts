import { Request, Response } from 'express';

export const getAllActivities = async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      activities: [
        {
          id: '1',
          title: 'Reconnaissance des émotions',
          description: 'Apprends à identifier les différentes émotions',
          category: 'SOCIAL_SKILLS',
          difficulty: 'BEGINNER',
          duration: 10,
          thumbnailUrl: null,
          videoUrl: null,
          instructions: ['Regarde chaque visage', 'Identifie l\'émotion', 'Clique sur la bonne réponse'],
          targetSkills: ['reconnaissance_emotions', 'empathie'],
        },
      ],
    },
  });
};

export const getActivityById = async (req: Request, res: Response) => {
  const { id } = req.params;

  res.json({
    status: 'success',
    data: {
      activity: {
        id,
        title: 'Activité exemple',
        description: 'Description de l\'activité',
        category: 'SOCIAL_SKILLS',
        difficulty: 'BEGINNER',
        duration: 10,
      },
    },
  });
};

export const getActivitiesByCategory = async (req: Request, res: Response) => {
  const { category } = req.params;

  res.json({
    status: 'success',
    data: {
      activities: [],
      category,
    },
  });
};

export const startActivity = async (req: Request, res: Response) => {
  const { childId, activityId } = req.body;

  res.json({
    status: 'success',
    data: {
      session: {
        id: 'session-id',
        childId,
        activityId,
        startTime: new Date(),
        completed: false,
      },
    },
  });
};

export const completeActivity = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { successRate, emotionalState } = req.body;

  res.json({
    status: 'success',
    data: {
      session: {
        id: sessionId,
        completed: true,
        endTime: new Date(),
        successRate,
        emotionalState,
      },
    },
  });
};

export const updateActivitySession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const updates = req.body;

  res.json({
    status: 'success',
    data: {
      session: {
        id: sessionId,
        ...updates,
      },
    },
  });
};
