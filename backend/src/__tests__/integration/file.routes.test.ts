import request from 'supertest';
import express, { Application } from 'express';
import path from 'path';
import fs from 'fs/promises';
import fileRoutes from '../../routes/file.routes';
import { authenticate } from '../../middleware/auth';
import { errorHandler } from '../../middleware/errorHandler';

// Mock des middlewares
jest.mock('../../middleware/auth');
jest.mock('../../middleware/rbac', () => ({
  requirePermission: () => (req: any, res: any, next: any) => next(),
  requireRole: () => (req: any, res: any, next: any) => next(),
}));

// Mock du FileService
jest.mock('../../services/file.service', () => ({
  __esModule: true,
  default: {
    uploadAvatar: jest.fn(),
    uploadResource: jest.fn(),
    uploadActivityFile: jest.fn(),
    getFileInfo: jest.fn(),
    deleteAvatar: jest.fn(),
    deleteResource: jest.fn(),
    getStorageUsage: jest.fn(),
    cleanupTempFiles: jest.fn(),
    initialize: jest.fn(),
  },
}));

// Mock du rate limiter
jest.mock('../../middleware/rateLimiter', () => ({
  uploadLimiter: (req: any, res: any, next: any) => next(),
  deleteLimiter: (req: any, res: any, next: any) => next(),
}));

import fileService from '../../services/file.service';

describe('File Routes Integration Tests', () => {
  let app: Application;
  const testImagePath = path.join(__dirname, 'test-image.jpg');

  beforeAll(async () => {
    // Créer une image de test
    await fs.writeFile(testImagePath, Buffer.from('fake-image-data'));

    // Configuration de l'app de test
    app = express();
    app.use(express.json());
    app.use('/api/files', fileRoutes);
    app.use(errorHandler);

    // Mock authenticate middleware
    (authenticate as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: 1, email: 'test@example.com', role: 'PARENT' };
      next();
    });
  });

  afterAll(async () => {
    // Nettoyer le fichier de test
    try {
      await fs.unlink(testImagePath);
    } catch (error) {
      // Ignorer si le fichier n'existe pas
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/files/avatar', () => {
    it('devrait uploader un avatar avec succès', async () => {
      const mockMetadata = {
        id: '1_1234567890_abc123.jpg',
        originalName: 'avatar.jpg',
        filename: '1_1234567890_abc123.jpg',
        path: '/uploads/avatars/1_1234567890_abc123.jpg',
        size: 12345,
        mimetype: 'image/jpeg',
        type: 'image',
        uploadedBy: 1,
        uploadedAt: new Date(),
        url: '/api/files/download/1_1234567890_abc123.jpg',
      };

      (fileService.uploadAvatar as jest.Mock).mockResolvedValue(mockMetadata);

      const response = await request(app)
        .post('/api/files/avatar')
        .attach('file', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('uploadé avec succès');
      expect(response.body.data).toEqual(mockMetadata);
    });

    it('devrait retourner 400 si aucun fichier n\'est fourni', async () => {
      const response = await request(app)
        .post('/api/files/avatar')
        .expect(400);

      expect(response.body.message).toContain('Aucun fichier fourni');
    });
  });

  describe('POST /api/files/resource', () => {
    it('devrait uploader une ressource avec catégorie', async () => {
      const mockMetadata = {
        id: '1_1234567890_xyz789.pdf',
        originalName: 'guide.pdf',
        filename: '1_1234567890_xyz789.pdf',
        path: '/uploads/resources/guides/1_1234567890_xyz789.pdf',
        size: 54321,
        mimetype: 'application/pdf',
        type: 'document',
        uploadedBy: 1,
        uploadedAt: new Date(),
        url: '/api/files/download/1_1234567890_xyz789.pdf',
      };

      (fileService.uploadResource as jest.Mock).mockResolvedValue(mockMetadata);

      const response = await request(app)
        .post('/api/files/resource')
        .field('category', 'guides')
        .attach('file', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(fileService.uploadResource).toHaveBeenCalledWith(
        expect.any(Object),
        1,
        'guides'
      );
    });
  });

  describe('POST /api/files/activity/:activityId', () => {
    it('devrait uploader un fichier d\'activité', async () => {
      const mockMetadata = {
        id: '1_1234567890_activity123.mp4',
        originalName: 'video.mp4',
        filename: '1_1234567890_activity123.mp4',
        path: '/uploads/activities/42/1_1234567890_activity123.mp4',
        size: 98765,
        mimetype: 'video/mp4',
        type: 'video',
        uploadedBy: 1,
        uploadedAt: new Date(),
        url: '/api/files/download/1_1234567890_activity123.mp4',
      };

      (fileService.uploadActivityFile as jest.Mock).mockResolvedValue(mockMetadata);

      const response = await request(app)
        .post('/api/files/activity/42')
        .attach('file', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(fileService.uploadActivityFile).toHaveBeenCalledWith(
        expect.any(Object),
        1,
        42
      );
    });

    it('devrait retourner 400 si activityId est invalide', async () => {
      const response = await request(app)
        .post('/api/files/activity/invalid')
        .attach('file', testImagePath)
        .expect(400);

      expect(response.body.message).toContain('ID d\'activité invalide');
    });
  });

  describe('POST /api/files/multiple', () => {
    it('devrait uploader plusieurs fichiers', async () => {
      const mockMetadata1 = {
        id: '1_1234567890_file1.jpg',
        originalName: 'file1.jpg',
        filename: '1_1234567890_file1.jpg',
        path: '/uploads/resources/general/1_1234567890_file1.jpg',
        size: 12345,
        mimetype: 'image/jpeg',
        type: 'image',
        uploadedBy: 1,
        uploadedAt: new Date(),
        url: '/api/files/download/1_1234567890_file1.jpg',
      };

      const mockMetadata2 = { ...mockMetadata1, id: '1_1234567890_file2.jpg' };

      (fileService.uploadResource as jest.Mock)
        .mockResolvedValueOnce(mockMetadata1)
        .mockResolvedValueOnce(mockMetadata2);

      const response = await request(app)
        .post('/api/files/multiple')
        .field('category', 'general')
        .attach('files', testImagePath)
        .attach('files', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.message).toContain('2 fichiers uploadés');
    });

    it('devrait retourner 400 si aucun fichier n\'est fourni', async () => {
      const response = await request(app)
        .post('/api/files/multiple')
        .expect(400);

      expect(response.body.message).toContain('Aucun fichier fourni');
    });
  });

  describe('GET /api/files/info/:filename', () => {
    it('devrait retourner les informations d\'un fichier', async () => {
      const mockInfo = {
        id: '1_1234567890_test.jpg',
        originalName: '1_1234567890_test.jpg',
        filename: '1_1234567890_test.jpg',
        path: '/uploads/avatars/1_1234567890_test.jpg',
        size: 12345,
        mimetype: 'image/jpeg',
        type: 'image',
        uploadedBy: 1,
        uploadedAt: new Date(),
        url: '/api/files/download/1_1234567890_test.jpg',
      };

      (fileService.getFileInfo as jest.Mock).mockResolvedValue(mockInfo);

      const response = await request(app)
        .get('/api/files/info/1_1234567890_test.jpg?type=avatar')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockInfo);
    });

    it('devrait retourner 404 si le fichier n\'existe pas', async () => {
      (fileService.getFileInfo as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/files/info/nonexistent.jpg?type=avatar')
        .expect(404);

      expect(response.body.message).toContain('Fichier non trouvé');
    });

    it('devrait retourner 400 si le type n\'est pas spécifié', async () => {
      const response = await request(app)
        .get('/api/files/info/test.jpg')
        .expect(400);

      expect(response.body.message).toContain('Type de fichier non spécifié');
    });
  });

  describe('DELETE /api/files/avatar/:filename', () => {
    it('devrait supprimer un avatar', async () => {
      (fileService.deleteAvatar as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/files/avatar/1_1234567890_avatar.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimé avec succès');
      expect(fileService.deleteAvatar).toHaveBeenCalledWith(
        '1_1234567890_avatar.jpg',
        1
      );
    });

    it('devrait retourner 403 si l\'utilisateur n\'est pas propriétaire', async () => {
      const response = await request(app)
        .delete('/api/files/avatar/999_1234567890_avatar.jpg')
        .expect(403);

      expect(response.body.message).toContain('Non autorisé');
    });
  });

  describe('DELETE /api/files/resource/:filename', () => {
    it('devrait supprimer une ressource', async () => {
      (fileService.deleteResource as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/files/resource/resource.pdf')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimée avec succès');
    });
  });

  describe('GET /api/files/storage/stats', () => {
    it('devrait retourner les statistiques de stockage', async () => {
      const mockStats = {
        total: 123456789,
        byType: {
          avatars: 10000000,
          resources: 50000000,
          activities: 30000000,
          thumbnails: 5000000,
        },
        fileCount: 150,
      };

      (fileService.getStorageUsage as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/files/storage/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBytes).toBe(mockStats.total);
      expect(response.body.data.total).toBeDefined(); // Format lisible
      expect(response.body.data.byType).toBeDefined();
    });
  });

  describe('POST /api/files/cleanup', () => {
    it('devrait nettoyer les fichiers temporaires', async () => {
      (fileService.cleanupTempFiles as jest.Mock).mockResolvedValue(5);

      const response = await request(app)
        .post('/api/files/cleanup')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedCount).toBe(5);
      expect(response.body.message).toContain('5 fichiers temporaires supprimés');
    });
  });
});
