import { Request, Response, NextFunction } from 'express';
import fileService, { FileService } from '../services/file.service';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs/promises';

/**
 * Contrôleur pour la gestion des fichiers
 * Gère l'upload, le téléchargement et la suppression de fichiers
 */
export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = fileService;
  }

  /**
   * Upload un avatar utilisateur
   * POST /api/files/avatar
   */
  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('Aucun fichier fourni', 400);
      }

      const userId = parseInt(req.user!.userId);
      const metadata = await this.fileService.uploadAvatar(req.file, userId);

      res.status(200).json({
        success: true,
        message: 'Avatar uploadé avec succès',
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload une ressource pédagogique
   * POST /api/files/resource
   */
  uploadResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('Aucun fichier fourni', 400);
      }

      const userId = parseInt(req.user!.userId);
      const category = req.body.category;

      const metadata = await this.fileService.uploadResource(req.file, userId, category);

      res.status(200).json({
        success: true,
        message: 'Ressource uploadée avec succès',
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload un fichier pour une activité
   * POST /api/files/activity/:activityId
   */
  uploadActivityFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('Aucun fichier fourni', 400);
      }

      const userId = parseInt(req.user!.userId);
      const activityId = parseInt(req.params.activityId);

      if (isNaN(activityId)) {
        throw new AppError('ID d\'activité invalide', 400);
      }

      const metadata = await this.fileService.uploadActivityFile(req.file, userId, activityId);

      res.status(200).json({
        success: true,
        message: 'Fichier d\'activité uploadé avec succès',
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload multiple fichiers
   * POST /api/files/multiple
   */
  uploadMultiple = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError('Aucun fichier fourni', 400);
      }

      const userId = parseInt(req.user!.userId);
      const category = req.body.category || 'general';

      const uploadPromises = req.files.map((file) =>
        this.fileService.uploadResource(file, userId, category)
      );

      const results = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: `${results.length} fichiers uploadés avec succès`,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Télécharger un fichier
   * GET /api/files/download/:filename
   */
  downloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;
      const { type } = req.query; // avatar, resource, activity, thumbnail

      // Construire le chemin du fichier
      let filepath: string;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';

      switch (type) {
        case 'avatar':
          filepath = path.join(uploadDir, 'avatars', filename);
          break;
        case 'thumbnail':
          filepath = path.join(uploadDir, 'thumbnails', filename);
          break;
        case 'resource':
          // Chercher dans tous les sous-répertoires de resources
          filepath = await this.findResourceFile(filename);
          break;
        case 'activity':
          // Chercher dans tous les répertoires d'activités
          filepath = await this.findActivityFile(filename);
          break;
        default:
          throw new AppError('Type de fichier non spécifié', 400);
      }

      // Vérifier que le fichier existe
      try {
        await fs.access(filepath);
      } catch {
        throw new AppError('Fichier non trouvé', 404);
      }

      // Envoyer le fichier
      res.sendFile(path.resolve(filepath));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Récupérer les informations d'un fichier
   * GET /api/files/info/:filename
   */
  getFileInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;
      const { type } = req.query;

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      let filepath: string;

      switch (type) {
        case 'avatar':
          filepath = path.join(uploadDir, 'avatars', filename);
          break;
        case 'resource':
          filepath = await this.findResourceFile(filename);
          break;
        case 'activity':
          filepath = await this.findActivityFile(filename);
          break;
        default:
          throw new AppError('Type de fichier non spécifié', 400);
      }

      const info = await this.fileService.getFileInfo(filepath);

      if (!info) {
        throw new AppError('Fichier non trouvé', 404);
      }

      res.status(200).json({
        success: true,
        data: info,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Supprimer un avatar
   * DELETE /api/files/avatar/:filename
   */
  deleteAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;
      const userId = parseInt(req.user!.userId);

      // Vérifier que l'utilisateur est propriétaire (le filename contient userId)
      if (!filename.startsWith(`${userId}_`)) {
        throw new AppError('Non autorisé à supprimer ce fichier', 403);
      }

      await this.fileService.deleteAvatar(filename, userId);

      res.status(200).json({
        success: true,
        message: 'Avatar supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Supprimer une ressource
   * DELETE /api/files/resource/:filename
   */
  deleteResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { filename } = req.params;
      const userId = parseInt(req.user!.userId);

      const filepath = await this.findResourceFile(filename);
      await this.fileService.deleteResource(filepath, userId);

      res.status(200).json({
        success: true,
        message: 'Ressource supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir les statistiques de stockage
   * GET /api/files/storage/stats
   */
  getStorageStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.fileService.getStorageUsage();

      // Convertir en format lisible
      const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
      };

      const formattedStats = {
        total: formatBytes(stats.total),
        totalBytes: stats.total,
        byType: Object.entries(stats.byType).reduce((acc, [key, value]) => {
          acc[key] = {
            size: formatBytes(value),
            bytes: value,
          };
          return acc;
        }, {} as Record<string, { size: string; bytes: number }>),
        fileCount: stats.fileCount,
      };

      res.status(200).json({
        success: true,
        data: formattedStats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Nettoyer les fichiers temporaires
   * POST /api/files/cleanup
   */
  cleanupTempFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deletedCount = await this.fileService.cleanupTempFiles();

      res.status(200).json({
        success: true,
        message: `${deletedCount} fichiers temporaires supprimés`,
        data: { deletedCount },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cherche un fichier de ressource dans les sous-répertoires
   */
  private async findResourceFile(filename: string): Promise<string> {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const resourcesDir = path.join(uploadDir, 'resources');

    // Chercher récursivement dans resources/
    const findFile = async (dir: string): Promise<string | null> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const found = await findFile(fullPath);
          if (found) return found;
        } else if (entry.name === filename) {
          return fullPath;
        }
      }

      return null;
    };

    const filepath = await findFile(resourcesDir);

    if (!filepath) {
      throw new AppError('Fichier non trouvé', 404);
    }

    return filepath;
  }

  /**
   * Cherche un fichier d'activité dans les sous-répertoires
   */
  private async findActivityFile(filename: string): Promise<string> {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const activitiesDir = path.join(uploadDir, 'activities');

    // Chercher récursivement dans activities/
    const findFile = async (dir: string): Promise<string | null> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const found = await findFile(fullPath);
          if (found) return found;
        } else if (entry.name === filename) {
          return fullPath;
        }
      }

      return null;
    };

    const filepath = await findFile(activitiesDir);

    if (!filepath) {
      throw new AppError('Fichier non trouvé', 404);
    }

    return filepath;
  }
}

export default new FileController();
