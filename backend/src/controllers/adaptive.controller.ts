import { Request, Response } from 'express';
import { ServiceFactory } from '../services';
import { AdaptiveContext } from '../types';
import { logger } from '../utils/logger';

/**
 * @openapi
 * /api/adaptive/recommendations:
 *   post:
 *     tags:
 *       - Adaptive
 *     summary: Générer une recommandation adaptative pour un enfant
 *     description: Combine un modèle heuristique local et un connecteur ML optionnel pour proposer la prochaine difficulté et des activités.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdaptiveContext'
 *     responses:
 *       200:
 *         description: Recommandation générée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     recommendation:
 *                       $ref: '#/components/schemas/AdaptiveRecommendation'
 *                     source:
 *                       type: string
 *                       example: heuristic
 *       500:
 *         description: Erreur lors de la génération
 */

export const getAdaptiveRecommendations = async (req: Request, res: Response) => {
  const context = req.body as AdaptiveContext;
  const adaptiveService = ServiceFactory.getAdaptiveService();

  try {
    const recommendation = await adaptiveService.getRecommendations(context);

    res.json({
      status: 'success',
      data: {
        recommendation,
        source: adaptiveService.isMlActive() ? 'ml' : 'heuristic',
      },
    });
  } catch (error) {
    logger.error('Erreur lors de la génération des recommandations adaptatives', { error });
    res.status(500).json({
      status: 'error',
      message: 'Impossible de générer une recommandation adaptative',
    });
  }
};
