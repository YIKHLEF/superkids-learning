import { NextFunction, Request, Response } from 'express';
import { ServiceFactory } from '../services';

export const getAllResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = ServiceFactory.getResourceService();
    const { page = '1', limit = '20', type, category, tags, search, language } =
      req.query;

    const parsedTags = typeof tags === 'string' ? tags.split(',').filter(Boolean) : [];

    const resources = await service.getAllResources(
      {
        type: typeof type === 'string' ? type : undefined,
        category: typeof category === 'string' ? category : undefined,
        tags: parsedTags.length ? parsedTags : undefined,
        search: typeof search === 'string' ? search : undefined,
        language: typeof language === 'string' ? language : undefined,
      },
      {
        page: Number(page),
        limit: Number(limit),
      }
    );

    res.json({
      success: true,
      data: resources.data,
      pagination: resources.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getResourcesByType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type } = req.params;
    const service = ServiceFactory.getResourceService();
    const resources = await service.getResourcesByType(type);

    res.json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
};

export const getResourceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const service = ServiceFactory.getResourceService();
    const resource = await service.getResourceById(id);

    return res.json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

export const searchResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, type, category, tags } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, message: 'Paramètre de recherche manquant' });
    }

    const parsedTags = typeof tags === 'string' ? tags.split(',').filter(Boolean) : [];
    const service = ServiceFactory.getResourceService();
    const resources = await service.searchResources(q, {
      type: typeof type === 'string' ? type : undefined,
      category: typeof category === 'string' ? category : undefined,
      tags: parsedTags.length ? parsedTags : undefined,
    });

    return res.json({ success: true, data: resources, count: resources.length });
  } catch (error) {
    next(error);
  }
};

export const uploadResourceAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const service = ServiceFactory.getResourceService();
    const { resource, metadata } = await service.uploadResourceAsset(req.file, req.body);

    return res.status(201).json({
      success: true,
      message: 'Ressource importée avec succès',
      data: resource,
      metadata,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    const service = ServiceFactory.getResourceService();

    const updated = await service.toggleFavorite(id, Boolean(isFavorite));

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
