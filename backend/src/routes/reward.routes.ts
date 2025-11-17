import { Router } from 'express';
import { awardActivityReward, getRewardSummary } from '../controllers/rewards.controller';

const router = Router();

/**
 * @openapi
 * /api/rewards/{childId}:
 *   get:
 *     tags:
 *       - Rewards
 *     summary: Récupérer les récompenses d'un enfant
 *     parameters:
 *       - in: path
 *         name: childId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Résumé des récompenses et jetons
 */
router.get('/:childId', getRewardSummary);

/**
 * @openapi
 * /api/rewards/activity:
 *   post:
 *     tags:
 *       - Rewards
 *     summary: Attribuer des récompenses après une activité
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               childId:
 *                 type: string
 *               activityId:
 *                 type: string
 *               tokens:
 *                 type: integer
 *               badgeId:
 *                 type: string
 *               themeId:
 *                 type: string
 *               avatarId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Récompense appliquée
 */
router.post('/activity', awardActivityReward);

export default router;
