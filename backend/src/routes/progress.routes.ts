import { Router } from 'express';
import {
  getProgress,
  updateProgress,
  getRewards,
  unlockReward,
} from '../controllers/progress.controller';

const router = Router();

/**
 * @openapi
 * /api/progress/{childId}:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Obtenir le progrès d'un enfant
 *     description: Récupère les statistiques de progression complètes d'un enfant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enfant
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Statistiques de progression
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Progress'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:childId', getProgress);

/**
 * @openapi
 * /api/progress/{childId}:
 *   put:
 *     tags:
 *       - Progress
 *     summary: Mettre à jour le progrès d'un enfant
 *     description: Mise à jour manuelle des statistiques de progression (admin uniquement)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enfant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalActivitiesCompleted:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nombre total d'activités complétées
 *                 example: 50
 *               tokensEarned:
 *                 type: integer
 *                 minimum: 0
 *                 description: Tokens gagnés
 *                 example: 500
 *               currentStreak:
 *                 type: integer
 *                 minimum: 0
 *                 description: Série actuelle de jours consécutifs
 *                 example: 7
 *     responses:
 *       200:
 *         description: Progrès mis à jour avec succès
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
 *                   example: Progrès mis à jour
 *                 data:
 *                   $ref: '#/components/schemas/Progress'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Accès refusé
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:childId', updateProgress);

/**
 * @openapi
 * /api/progress/{childId}/rewards:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Obtenir les récompenses d'un enfant
 *     description: Récupère la liste des récompenses débloquées et disponibles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enfant
 *     responses:
 *       200:
 *         description: Liste des récompenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     unlocked:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Récompenses débloquées
 *                       example: ["badge_1", "badge_5"]
 *                     available:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Récompenses disponibles
 *                       example: ["badge_10", "badge_15"]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:childId/rewards', getRewards);

/**
 * @openapi
 * /api/progress/{childId}/rewards/{rewardId}/unlock:
 *   post:
 *     tags:
 *       - Progress
 *     summary: Débloquer une récompense
 *     description: Débloque une nouvelle récompense pour l'enfant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: childId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'enfant
 *       - in: path
 *         name: rewardId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la récompense
 *         example: badge_10
 *     responses:
 *       200:
 *         description: Récompense débloquée avec succès
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
 *                   example: Récompense débloquée
 *                 data:
 *                   type: object
 *                   properties:
 *                     rewardId:
 *                       type: string
 *                       example: badge_10
 *                     tokensSpent:
 *                       type: integer
 *                       example: 100
 *       400:
 *         description: Tokens insuffisants ou récompense déjà débloquée
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:childId/rewards/:rewardId/unlock', unlockReward);

export default router;
