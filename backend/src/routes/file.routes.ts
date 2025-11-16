import { Router } from 'express';
import fileController from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';
import { requirePermission, requireRole } from '../middleware/rbac';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { uploadLimiter, deleteLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Gestion des fichiers (upload, download, suppression)
 */

/**
 * @swagger
 * /api/files/avatar:
 *   post:
 *     summary: Upload un avatar utilisateur
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Avatar uploadé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/FileMetadata'
 *       400:
 *         description: Fichier invalide ou manquant
 *       401:
 *         description: Non authentifié
 */
router.post(
  '/avatar',
  authenticate,
  uploadLimiter,
  uploadSingle('file'),
  fileController.uploadAvatar
);

/**
 * @swagger
 * /api/files/resource:
 *   post:
 *     summary: Upload une ressource pédagogique
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 description: Catégorie de la ressource
 *     responses:
 *       200:
 *         description: Ressource uploadée avec succès
 *       400:
 *         description: Fichier invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé (permission requise)
 */
router.post(
  '/resource',
  authenticate,
  requirePermission('resource.create'),
  uploadLimiter,
  uploadSingle('file'),
  fileController.uploadResource
);

/**
 * @swagger
 * /api/files/activity/{activityId}:
 *   post:
 *     summary: Upload un fichier pour une activité
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Fichier uploadé avec succès
 *       400:
 *         description: Fichier invalide ou ID activité invalide
 *       401:
 *         description: Non authentifié
 */
router.post(
  '/activity/:activityId',
  authenticate,
  requirePermission('activity.update'),
  uploadLimiter,
  uploadSingle('file'),
  fileController.uploadActivityFile
);

/**
 * @swagger
 * /api/files/multiple:
 *   post:
 *     summary: Upload plusieurs fichiers
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fichiers uploadés avec succès
 *       400:
 *         description: Fichiers invalides
 *       401:
 *         description: Non authentifié
 */
router.post(
  '/multiple',
  authenticate,
  requirePermission('resource.create'),
  uploadLimiter,
  uploadMultiple('files', 10),
  fileController.uploadMultiple
);

/**
 * @swagger
 * /api/files/download/{filename}:
 *   get:
 *     summary: Télécharger un fichier
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [avatar, resource, activity, thumbnail]
 *     responses:
 *       200:
 *         description: Fichier téléchargé
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Fichier non trouvé
 *       401:
 *         description: Non authentifié
 */
router.get('/download/:filename', authenticate, fileController.downloadFile);

/**
 * @swagger
 * /api/files/info/{filename}:
 *   get:
 *     summary: Obtenir les informations d'un fichier
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [avatar, resource, activity]
 *     responses:
 *       200:
 *         description: Informations du fichier
 *       404:
 *         description: Fichier non trouvé
 *       401:
 *         description: Non authentifié
 */
router.get('/info/:filename', authenticate, fileController.getFileInfo);

/**
 * @swagger
 * /api/files/avatar/{filename}:
 *   delete:
 *     summary: Supprimer un avatar
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avatar supprimé avec succès
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Fichier non trouvé
 */
router.delete('/avatar/:filename', authenticate, deleteLimiter, fileController.deleteAvatar);

/**
 * @swagger
 * /api/files/resource/{filename}:
 *   delete:
 *     summary: Supprimer une ressource
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ressource supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: Fichier non trouvé
 */
router.delete(
  '/resource/:filename',
  authenticate,
  requirePermission('resource.delete'),
  deleteLimiter,
  fileController.deleteResource
);

/**
 * @swagger
 * /api/files/storage/stats:
 *   get:
 *     summary: Obtenir les statistiques de stockage
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de stockage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: string
 *                       description: Taille totale formatée
 *                     totalBytes:
 *                       type: number
 *                     byType:
 *                       type: object
 *                     fileCount:
 *                       type: number
 *       401:
 *         description: Non authentifié
 */
router.get('/storage/stats', authenticate, requireRole('ADMIN'), fileController.getStorageStats);

/**
 * @swagger
 * /api/files/cleanup:
 *   post:
 *     summary: Nettoyer les fichiers temporaires (admin uniquement)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fichiers nettoyés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Non autorisé
 */
router.post('/cleanup', authenticate, requireRole('ADMIN'), fileController.cleanupTempFiles);

/**
 * @swagger
 * components:
 *   schemas:
 *     FileMetadata:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         originalName:
 *           type: string
 *         filename:
 *           type: string
 *         path:
 *           type: string
 *         size:
 *           type: number
 *         mimetype:
 *           type: string
 *         type:
 *           type: string
 *           enum: [image, video, document, audio]
 *         uploadedBy:
 *           type: number
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *         url:
 *           type: string
 */

export default router;
