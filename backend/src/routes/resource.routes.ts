import { Router } from 'express';
import {
  getAllResources,
  getResourcesByType,
  getResourceById,
  searchResources,
  toggleFavorite,
  uploadResourceAsset,
} from '../controllers/resource.controller';
import { uploadResourceMiddleware } from '../middleware/secureUpload';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/resources:
 *   get:
 *     tags:
 *       - Resources
 *     summary: Obtenir toutes les ressources
 *     description: Récupère la liste complète des ressources pédagogiques avec pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Nombre de résultats par page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [video, pictogram, social_story, guide, tutorial]
 *         description: Filtrer par type de ressource
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *     responses:
 *       200:
 *         description: Liste paginée des ressources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     pages:
 *                       type: integer
 *                       example: 8
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', authenticateToken, getAllResources);

/**
 * @openapi
 * /api/resources/type/{type}:
 *   get:
 *     tags:
 *       - Resources
 *     summary: Obtenir les ressources par type
 *     description: Récupère toutes les ressources d'un type spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [video, pictogram, social_story, guide, tutorial]
 *         description: Type de ressource
 *         example: video
 *     responses:
 *       200:
 *         description: Ressources du type spécifié
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/type/:type', authenticateToken, getResourcesByType);

/**
 * @openapi
 * /api/resources/search:
 *   get:
 *     tags:
 *       - Resources
 *     summary: Rechercher des ressources
 *     description: Recherche de ressources par mots-clés dans le titre, description ou tags
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *         example: émotions
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [video, pictogram, social_story, guide, tutorial]
 *         description: Filtrer par type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 *                 count:
 *                   type: integer
 *                   description: Nombre de résultats
 *                   example: 12
 *       400:
 *         description: Paramètre de recherche manquant
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/search', authenticateToken, searchResources);

/**
 * @openapi
 * /api/resources/{id}:
 *   get:
 *     tags:
 *       - Resources
 *     summary: Obtenir une ressource par ID
 *     description: Récupère les détails complets d'une ressource spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la ressource
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Détails de la ressource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticateToken, getResourceById);

router.patch('/:id/favorite', authenticateToken, toggleFavorite);

router.post('/upload', uploadResourceMiddleware, uploadResourceAsset);

export default router;
