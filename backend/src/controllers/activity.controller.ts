import { NextFunction, Request, Response } from 'express';
import { ServiceFactory } from '../services';
import { ActivityFilters } from '../types';

export const getAllActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = ServiceFactory.getActivityService();
    const filters: ActivityFilters = {
      category: req.query.category as any,
      difficulty: req.query.difficulty as any,
      search: req.query.search as string,
      ebpTag: req.query.ebp as string,
    };

    const activities = await service.getAllActivities(filters);
    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
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
