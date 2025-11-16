import { AppError } from '../middleware/errorHandler';
import { AuditService } from './audit.service';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';

/**
 * Types de fichiers supportés
 */
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
}

/**
 * Configuration pour le traitement d'images
 */
export interface ImageProcessingOptions {
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number; // 1-100
}

/**
 * Métadonnées de fichier
 */
export interface FileMetadata {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  type: FileType;
  uploadedBy: number;
  uploadedAt: Date;
  url: string;
}

/**
 * Service de gestion des fichiers
 * Gère l'upload, le traitement, le stockage et la suppression de fichiers
 */
export class FileService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: Map<FileType, string[]>;
  private auditService: AuditService;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB par défaut
    this.auditService = new AuditService();

    // Définir les types MIME autorisés par catégorie
    this.allowedMimeTypes = new Map([
      [FileType.IMAGE, ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']],
      [FileType.VIDEO, ['video/mp4', 'video/webm', 'video/ogg']],
      [FileType.DOCUMENT, ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']],
      [FileType.AUDIO, ['audio/mpeg', 'audio/wav', 'audio/ogg']],
    ]);
  }

  /**
   * Initialise les répertoires de stockage
   */
  async initialize(): Promise<void> {
    const directories = [
      this.uploadDir,
      path.join(this.uploadDir, 'avatars'),
      path.join(this.uploadDir, 'resources'),
      path.join(this.uploadDir, 'activities'),
      path.join(this.uploadDir, 'temp'),
      path.join(this.uploadDir, 'thumbnails'),
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Erreur création répertoire ${dir}:`, error);
      }
    }
  }

  /**
   * Valide un fichier uploadé
   */
  validateFile(file: Express.Multer.File, expectedType?: FileType): void {
    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      throw new AppError(
        `Fichier trop volumineux. Taille max: ${this.maxFileSize / 1024 / 1024}MB`,
        400
      );
    }

    // Déterminer le type de fichier
    const fileType = this.getFileType(file.mimetype);

    // Vérifier si le type est attendu
    if (expectedType && fileType !== expectedType) {
      throw new AppError(`Type de fichier incorrect. Attendu: ${expectedType}`, 400);
    }

    // Vérifier si le MIME type est autorisé
    const allowedTypes = this.allowedMimeTypes.get(fileType);
    if (!allowedTypes || !allowedTypes.includes(file.mimetype)) {
      throw new AppError(`Type MIME non autorisé: ${file.mimetype}`, 400);
    }

    // Vérifier l'extension
    const ext = path.extname(file.originalname).toLowerCase();
    const validExtensions = this.getValidExtensions(fileType);
    if (!validExtensions.includes(ext)) {
      throw new AppError(`Extension de fichier non autorisée: ${ext}`, 400);
    }
  }

  /**
   * Détermine le type de fichier à partir du MIME type
   */
  private getFileType(mimetype: string): FileType {
    if (mimetype.startsWith('image/')) return FileType.IMAGE;
    if (mimetype.startsWith('video/')) return FileType.VIDEO;
    if (mimetype.startsWith('audio/')) return FileType.AUDIO;
    if (mimetype.includes('pdf') || mimetype.includes('document')) return FileType.DOCUMENT;
    throw new AppError(`Type MIME non supporté: ${mimetype}`, 400);
  }

  /**
   * Retourne les extensions valides pour un type de fichier
   */
  private getValidExtensions(type: FileType): string[] {
    const extensions: Record<FileType, string[]> = {
      [FileType.IMAGE]: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
      [FileType.VIDEO]: ['.mp4', '.webm', '.ogg'],
      [FileType.DOCUMENT]: ['.pdf', '.doc', '.docx'],
      [FileType.AUDIO]: ['.mp3', '.wav', '.ogg'],
    };
    return extensions[type] || [];
  }

  /**
   * Upload un avatar utilisateur
   */
  async uploadAvatar(
    file: Express.Multer.File,
    userId: number
  ): Promise<FileMetadata> {
    this.validateFile(file, FileType.IMAGE);

    // Générer un nom de fichier unique
    const filename = this.generateSecureFilename(file.originalname, userId);
    const filepath = path.join(this.uploadDir, 'avatars', filename);

    // Traiter l'image (redimensionner et optimiser)
    await this.processImage(file.path, filepath, {
      resize: { width: 300, height: 300, fit: 'cover' },
      format: 'jpeg',
      quality: 85,
    });

    // Supprimer le fichier temporaire
    await this.deleteFile(file.path);

    // Logger l'action
    await this.auditService.log({
      userId,
      action: 'file.upload.avatar',
      resourceType: 'file',
      resourceId: filename,
      details: { originalName: file.originalname, size: file.size },
    });

    return this.createFileMetadata(file, filename, filepath, userId);
  }

  /**
   * Upload une ressource pédagogique
   */
  async uploadResource(
    file: Express.Multer.File,
    userId: number,
    category?: string
  ): Promise<FileMetadata> {
    this.validateFile(file);

    const filename = this.generateSecureFilename(file.originalname, userId);
    const subdir = category || 'general';
    const dir = path.join(this.uploadDir, 'resources', subdir);

    // Créer le sous-répertoire si nécessaire
    await fs.mkdir(dir, { recursive: true });

    const filepath = path.join(dir, filename);

    // Déplacer le fichier
    await fs.rename(file.path, filepath);

    // Si c'est une image, créer une miniature
    if (file.mimetype.startsWith('image/')) {
      await this.createThumbnail(filepath, filename);
    }

    // Logger l'action
    await this.auditService.log({
      userId,
      action: 'file.upload.resource',
      resourceType: 'file',
      resourceId: filename,
      details: { originalName: file.originalname, size: file.size, category },
    });

    return this.createFileMetadata(file, filename, filepath, userId);
  }

  /**
   * Upload un fichier d'activité
   */
  async uploadActivityFile(
    file: Express.Multer.File,
    userId: number,
    activityId: number
  ): Promise<FileMetadata> {
    this.validateFile(file);

    const filename = this.generateSecureFilename(file.originalname, userId);
    const dir = path.join(this.uploadDir, 'activities', activityId.toString());

    await fs.mkdir(dir, { recursive: true });

    const filepath = path.join(dir, filename);
    await fs.rename(file.path, filepath);

    // Logger l'action
    await this.auditService.log({
      userId,
      action: 'file.upload.activity',
      resourceType: 'file',
      resourceId: filename,
      details: { originalName: file.originalname, activityId },
    });

    return this.createFileMetadata(file, filename, filepath, userId);
  }

  /**
   * Traite une image (redimensionnement, compression)
   */
  private async processImage(
    sourcePath: string,
    destPath: string,
    options: ImageProcessingOptions
  ): Promise<void> {
    try {
      let transformer = sharp(sourcePath);

      // Redimensionnement
      if (options.resize) {
        transformer = transformer.resize(
          options.resize.width,
          options.resize.height,
          { fit: options.resize.fit || 'cover' }
        );
      }

      // Conversion de format
      if (options.format) {
        transformer = transformer.toFormat(options.format, {
          quality: options.quality || 80,
        });
      }

      await transformer.toFile(destPath);
    } catch (error) {
      throw new AppError('Erreur lors du traitement de l\'image', 500);
    }
  }

  /**
   * Crée une miniature pour une image
   */
  private async createThumbnail(
    imagePath: string,
    filename: string
  ): Promise<void> {
    const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
    const thumbnailPath = path.join(thumbnailDir, `thumb_${filename}`);

    await this.processImage(imagePath, thumbnailPath, {
      resize: { width: 150, height: 150, fit: 'cover' },
      format: 'jpeg',
      quality: 70,
    });
  }

  /**
   * Génère un nom de fichier sécurisé et unique
   */
  private generateSecureFilename(originalName: string, userId: number): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');
    return `${userId}_${timestamp}_${randomBytes}${ext}`;
  }

  /**
   * Supprime un fichier
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      // Ignorer si le fichier n'existe pas
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Erreur suppression fichier:', error);
      }
    }
  }

  /**
   * Supprime un avatar et ses versions
   */
  async deleteAvatar(filename: string, userId: number): Promise<void> {
    const avatarPath = path.join(this.uploadDir, 'avatars', filename);
    const thumbnailPath = path.join(this.uploadDir, 'thumbnails', `thumb_${filename}`);

    await this.deleteFile(avatarPath);
    await this.deleteFile(thumbnailPath);

    await this.auditService.log({
      userId,
      action: 'file.delete.avatar',
      resourceType: 'file',
      resourceId: filename,
    });
  }

  /**
   * Supprime une ressource
   */
  async deleteResource(filepath: string, userId: number): Promise<void> {
    const filename = path.basename(filepath);
    const thumbnailPath = path.join(this.uploadDir, 'thumbnails', `thumb_${filename}`);

    await this.deleteFile(filepath);
    await this.deleteFile(thumbnailPath);

    await this.auditService.log({
      userId,
      action: 'file.delete.resource',
      resourceType: 'file',
      resourceId: filename,
    });
  }

  /**
   * Récupère les informations d'un fichier
   */
  async getFileInfo(filepath: string): Promise<FileMetadata | null> {
    try {
      const stats = await fs.stat(filepath);
      const filename = path.basename(filepath);

      // Parse le nom de fichier pour extraire les métadonnées
      const parts = filename.split('_');
      const userId = parseInt(parts[0]) || 0;

      return {
        id: filename,
        originalName: filename,
        filename,
        path: filepath,
        size: stats.size,
        mimetype: this.getMimeTypeFromExtension(path.extname(filename)),
        type: this.getFileType(this.getMimeTypeFromExtension(path.extname(filename))),
        uploadedBy: userId,
        uploadedAt: stats.birthtime,
        url: `/api/files/download/${filename}`,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Détermine le MIME type à partir de l'extension
   */
  private getMimeTypeFromExtension(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Crée les métadonnées d'un fichier
   */
  private createFileMetadata(
    file: Express.Multer.File,
    filename: string,
    filepath: string,
    userId: number
  ): FileMetadata {
    return {
      id: filename,
      originalName: file.originalname,
      filename,
      path: filepath,
      size: file.size,
      mimetype: file.mimetype,
      type: this.getFileType(file.mimetype),
      uploadedBy: userId,
      uploadedAt: new Date(),
      url: `/api/files/download/${filename}`,
    };
  }

  /**
   * Nettoie les fichiers temporaires anciens (> 24h)
   */
  async cleanupTempFiles(): Promise<number> {
    const tempDir = path.join(this.uploadDir, 'temp');
    let deletedCount = 0;

    try {
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 heures

      for (const file of files) {
        const filepath = path.join(tempDir, file);
        const stats = await fs.stat(filepath);

        if (now - stats.mtimeMs > maxAge) {
          await this.deleteFile(filepath);
          deletedCount++;
        }
      }
    } catch (error) {
      console.error('Erreur nettoyage fichiers temporaires:', error);
    }

    return deletedCount;
  }

  /**
   * Calcule l'utilisation de l'espace disque
   */
  async getStorageUsage(): Promise<{
    total: number;
    byType: Record<string, number>;
    fileCount: number;
  }> {
    let total = 0;
    let fileCount = 0;
    const byType: Record<string, number> = {
      avatars: 0,
      resources: 0,
      activities: 0,
      thumbnails: 0,
    };

    for (const [key, value] of Object.entries(byType)) {
      const dir = path.join(this.uploadDir, key);
      try {
        const size = await this.getDirectorySize(dir);
        byType[key] = size;
        total += size;
      } catch (error) {
        // Ignorer si le répertoire n'existe pas
      }
    }

    return { total, byType, fileCount };
  }

  /**
   * Calcule la taille d'un répertoire récursivement
   */
  private async getDirectorySize(directory: string): Promise<number> {
    let size = 0;

    try {
      const files = await fs.readdir(directory, { withFileTypes: true });

      for (const file of files) {
        const filepath = path.join(directory, file.name);

        if (file.isDirectory()) {
          size += await this.getDirectorySize(filepath);
        } else {
          const stats = await fs.stat(filepath);
          size += stats.size;
        }
      }
    } catch (error) {
      // Ignorer les erreurs
    }

    return size;
  }
}

export default new FileService();
