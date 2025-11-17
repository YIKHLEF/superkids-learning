import { PrismaClient, Resource } from '@prisma/client';
import {
  ResourceFilters,
  CreateResourceDTO,
  UpdateResourceDTO,
  AppError,
  PaginationOptions,
  PaginatedResponse,
  UploadMetadata,
} from '../types';
import { logger } from '../utils/logger';
import { storageClient } from '../utils/storageClient';

export class ResourceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtenir toutes les ressources avec filtres et pagination
   */
  async getAllResources(
    filters?: ResourceFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResponse<Resource>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const skip = (page - 1) * limit;

      const whereClause: any = {};

      // Filtres
      if (filters?.type) {
        whereClause.type = filters.type;
      }

      if (filters?.category) {
        whereClause.category = filters.category;
      }

      if (filters?.tags && filters.tags.length > 0) {
        whereClause.tags = {
          hasSome: filters.tags,
        };
      }

      if (filters?.search) {
        whereClause.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Compter le total
      const total = await this.prisma.resource.count({ where: whereClause });

      // Récupérer les ressources
      const resources = await this.prisma.resource.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [pagination?.sortBy || 'createdAt']: pagination?.sortOrder || 'desc',
        },
      });

      logger.info(`${resources.length} ressources récupérées`);

      return {
        data: resources,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des ressources:', error);
      throw new AppError('Erreur lors de la récupération des ressources', 500);
    }
  }

  /**
   * Obtenir une ressource par ID
   */
  async getResourceById(id: string): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.findUnique({
        where: { id },
      });

      if (!resource) {
        throw new AppError('Ressource introuvable', 404);
      }

      logger.info(`Ressource récupérée: ${id}`);
      return resource;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la récupération de la ressource:', error);
      throw new AppError('Erreur lors de la récupération de la ressource', 500);
    }
  }

  /**
   * Obtenir les ressources par type
   */
  async getResourcesByType(type: string): Promise<Resource[]> {
    try {
      const resources = await this.prisma.resource.findMany({
        where: { type },
        orderBy: { createdAt: 'desc' },
      });

      logger.info(`${resources.length} ressources de type "${type}" récupérées`);
      return resources;
    } catch (error) {
      logger.error('Erreur lors de la récupération des ressources par type:', error);
      throw new AppError(
        'Erreur lors de la récupération des ressources par type',
        500
      );
    }
  }

  /**
   * Rechercher des ressources
   */
  async searchResources(query: string): Promise<Resource[]> {
    try {
      const resources = await this.prisma.resource.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query.toLowerCase()] } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 50, // Limiter les résultats de recherche
      });

      logger.info(`${resources.length} ressources trouvées pour la requête: "${query}"`);
      return resources;
    } catch (error) {
      logger.error('Erreur lors de la recherche de ressources:', error);
      throw new AppError('Erreur lors de la recherche de ressources', 500);
    }
  }

  /**
   * Créer une nouvelle ressource
   */
  async createResource(data: CreateResourceDTO): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.create({
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          category: data.category,
          url: data.url,
          thumbnailUrl: data.thumbnailUrl,
          tags: data.tags,
        },
      });

      logger.info(`Nouvelle ressource créée: ${resource.id}`);
      return resource;
    } catch (error) {
      logger.error('Erreur lors de la création de la ressource:', error);
      throw new AppError('Erreur lors de la création de la ressource', 500);
    }
  }

  /**
   * Mettre à jour une ressource
   */
  async updateResource(
    id: string,
    data: UpdateResourceDTO
  ): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.findUnique({
        where: { id },
      });

      if (!resource) {
        throw new AppError('Ressource introuvable', 404);
      }

      const updatedResource = await this.prisma.resource.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.category && { category: data.category }),
          ...(data.url && { url: data.url }),
          ...(data.thumbnailUrl && { thumbnailUrl: data.thumbnailUrl }),
          ...(data.tags && { tags: data.tags }),
        },
      });

      logger.info(`Ressource mise à jour: ${id}`);
      return updatedResource;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la mise à jour de la ressource:', error);
      throw new AppError('Erreur lors de la mise à jour de la ressource', 500);
    }
  }

  async uploadResourceAsset(
    file?: Express.Multer.File,
    info?: Partial<CreateResourceDTO>
  ): Promise<{ resource: Resource; metadata: UploadMetadata }> {
    if (!file) {
      throw new AppError('Aucun fichier fourni', 400);
    }

    const metadata = await storageClient.upload(file, 'resources');
    const resource = await this.prisma.resource.create({
      data: {
        title: info?.title || file.originalname,
        description: info?.description || 'Ressource importée',
        type: info?.type || file.mimetype.split('/')[0],
        category: info?.category || 'general',
        url: metadata.url,
        thumbnailUrl: info?.thumbnailUrl,
        tags: info?.tags || [],
      },
    });

    return { resource, metadata };
  }

  /**
   * Supprimer une ressource
   */
  async deleteResource(id: string): Promise<void> {
    try {
      const resource = await this.prisma.resource.findUnique({
        where: { id },
      });

      if (!resource) {
        throw new AppError('Ressource introuvable', 404);
      }

      await this.prisma.resource.delete({
        where: { id },
      });

      logger.info(`Ressource supprimée: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la suppression de la ressource:', error);
      throw new AppError('Erreur lors de la suppression de la ressource', 500);
    }
  }

  /**
   * Obtenir les ressources populaires (les plus récentes)
   */
  async getPopularResources(limit: number = 10): Promise<Resource[]> {
    try {
      const resources = await this.prisma.resource.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      logger.info(`${resources.length} ressources populaires récupérées`);
      return resources;
    } catch (error) {
      logger.error('Erreur lors de la récupération des ressources populaires:', error);
      throw new AppError(
        'Erreur lors de la récupération des ressources populaires',
        500
      );
    }
  }

  /**
   * Obtenir toutes les catégories de ressources
   */
  async getCategories(): Promise<string[]> {
    try {
      const resources = await this.prisma.resource.findMany({
        select: { category: true },
        distinct: ['category'],
      });

      const categories = resources.map((r) => r.category).filter(Boolean);

      logger.info(`${categories.length} catégories récupérées`);
      return categories;
    } catch (error) {
      logger.error('Erreur lors de la récupération des catégories:', error);
      throw new AppError('Erreur lors de la récupération des catégories', 500);
    }
  }

  /**
   * Obtenir tous les tags de ressources
   */
  async getAllTags(): Promise<string[]> {
    try {
      const resources = await this.prisma.resource.findMany({
        select: { tags: true },
      });

      // Extraire tous les tags uniques
      const allTags = new Set<string>();
      resources.forEach((resource) => {
        resource.tags.forEach((tag) => allTags.add(tag));
      });

      const tags = Array.from(allTags).sort();

      logger.info(`${tags.length} tags récupérés`);
      return tags;
    } catch (error) {
      logger.error('Erreur lors de la récupération des tags:', error);
      throw new AppError('Erreur lors de la récupération des tags', 500);
    }
  }
}
