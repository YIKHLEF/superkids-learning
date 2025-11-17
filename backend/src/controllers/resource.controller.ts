import { NextFunction, Request, Response } from 'express';
import { ServiceFactory } from '../services';

export const getAllResources = async (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      resources: [
        {
          id: '1',
          title: 'Comment dire bonjour',
          description: 'Vidéo de modélisation pour apprendre à saluer',
          type: 'video',
          category: 'Communication',
          url: '/videos/dire-bonjour.mp4',
          thumbnailUrl: '/thumbnails/dire-bonjour.jpg',
          tags: ['salutations', 'social', 'communication'],
        },
      ],
    },
  });
};

export const getResourcesByType = async (req: Request, res: Response) => {
  const { type } = req.params;

  res.json({
    status: 'success',
    data: {
      resources: [],
      type,
    },
  });
};

export const getResourceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  res.json({
    status: 'success',
    data: {
      resource: {
        id,
        title: 'Ressource exemple',
        description: 'Description de la ressource',
        type: 'video',
        url: '/resources/example.mp4',
      },
    },
  });
};

export const searchResources = async (req: Request, res: Response) => {
  const { query } = req.query;

  res.json({
    status: 'success',
    data: {
      resources: [],
      query,
    },
  });
};

export const uploadResourceAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = ServiceFactory.getResourceService();
    const { resource, metadata } = await service.uploadResourceAsset(req.file, req.body);

    res.status(201).json({
      success: true,
      message: 'Ressource importée avec succès',
      data: resource,
      metadata,
    });
  } catch (error) {
    next(error);
  }
};
