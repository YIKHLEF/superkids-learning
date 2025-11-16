import { Router } from 'express';
import {
  getAllActivities,
  getActivityById,
  getActivitiesByCategory,
  startActivity,
  completeActivity,
  updateActivitySession,
} from '../controllers/activity.controller';

const router = Router();

/**
 * @openapi
 * /api/activities:
 *   get:
 *     tags:
 *       - Activities
 *     summary: Obtenir toutes les activités
 *     description: Récupère la liste complète des activités d'apprentissage avec filtres optionnels
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [SOCIAL_SKILLS, COMMUNICATION, ACADEMIC, AUTONOMY, EMOTIONAL_REGULATION]
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *         description: Filtrer par niveau de difficulté
 *     responses:
 *       200:
 *         description: Liste des activités
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
 *                     $ref: '#/components/schemas/Activity'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', getAllActivities);

/**
 * @openapi
 * /api/activities/{id}:
 *   get:
 *     tags:
 *       - Activities
 *     summary: Obtenir une activité par ID
 *     description: Récupère les détails complets d'une activité spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'activité
 *     responses:
 *       200:
 *         description: Détails de l'activité
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', getActivityById);

/**
 * @openapi
 * /api/activities/category/{category}:
 *   get:
 *     tags:
 *       - Activities
 *     summary: Obtenir les activités par catégorie
 *     description: Récupère toutes les activités d'une catégorie spécifique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SOCIAL_SKILLS, COMMUNICATION, ACADEMIC, AUTONOMY, EMOTIONAL_REGULATION]
 *         description: Catégorie d'activité
 *         example: SOCIAL_SKILLS
 *     responses:
 *       200:
 *         description: Activités de la catégorie
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
 *                     $ref: '#/components/schemas/Activity'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/category/:category', getActivitiesByCategory);

/**
 * @openapi
 * /api/activities/session/start:
 *   post:
 *     tags:
 *       - Activities
 *     summary: Démarrer une session d'activité
 *     description: Crée une nouvelle session d'activité pour un enfant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *               - activityId
 *             properties:
 *               childId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de l'enfant
 *               activityId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de l'activité
 *     responses:
 *       201:
 *         description: Session créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Session démarrée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/session/start', startActivity);

/**
 * @openapi
 * /api/activities/session/{sessionId}/complete:
 *   post:
 *     tags:
 *       - Activities
 *     summary: Terminer une session d'activité
 *     description: Marque une session comme terminée et enregistre les résultats
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - successRate
 *             properties:
 *               successRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Taux de réussite (0-100)
 *                 example: 85
 *     responses:
 *       200:
 *         description: Session terminée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Session terminée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/session/:sessionId/complete', completeActivity);

/**
 * @openapi
 * /api/activities/session/{sessionId}:
 *   patch:
 *     tags:
 *       - Activities
 *     summary: Mettre à jour une session en cours
 *     description: Met à jour les informations d'une session d'activité en cours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               responses:
 *                 type: object
 *                 description: Réponses partielles
 *     responses:
 *       200:
 *         description: Session mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Session mise à jour
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/session/:sessionId', updateActivitySession);

export default router;
