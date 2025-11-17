import { NextFunction, Request, Response } from 'express';
import { ServiceFactory } from '../services';

export const getProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  res.json({
    status: 'success',
    data: {
      profile: {
        id,
        userId: 'user-id',
        name: 'Enfant Test',
        age: 8,
        dateOfBirth: new Date('2015-06-15'),
        sensoryPreferences: ['LOW_STIMULATION'],
        developmentLevel: 'intermediate',
        iepGoals: ['Améliorer la communication', 'Développer l\'autonomie'],
        preferences: {
          soundEnabled: true,
          animationsEnabled: true,
          dyslexiaMode: false,
          highContrastMode: false,
          fontSize: 'medium',
        },
      },
    },
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  res.json({
    status: 'success',
    data: {
      profile: {
        id,
        ...updates,
      },
    },
  });
};

export const updatePreferences = async (req: Request, res: Response) => {
  const preferences = req.body;

  res.json({
    status: 'success',
    data: {
      preferences,
    },
  });
};

export const getChildProfiles = async (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      profiles: [],
    },
  });
};

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const service = ServiceFactory.getProfileService();
    const { profile, metadata } = await service.uploadAvatar(id, req.file);

    res.json({
      success: true,
      message: 'Avatar mis à jour avec succès',
      data: profile,
      metadata,
    });
  } catch (error) {
    next(error);
  }
};
