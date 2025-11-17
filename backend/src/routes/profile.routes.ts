import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updatePreferences,
  getChildProfiles,
  uploadAvatar,
} from '../controllers/profile.controller';
import { uploadAvatarMiddleware } from '../middleware/secureUpload';

const router = Router();

/**
 * @openapi
 * /api/profiles/children/all:
 *   get:
 *     tags:
 *       - Profiles
 *     summary: Obtenir tous les profils enfants
 *     description: Récupère la liste de tous les profils enfants (pour parents/éducateurs)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des profils enfants
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
 *                     $ref: '#/components/schemas/ChildProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/children/all', getChildProfiles);

/**
 * @openapi
 * /api/profiles/{id}:
 *   get:
 *     tags:
 *       - Profiles
 *     summary: Obtenir un profil enfant
 *     description: Récupère les détails d'un profil enfant par son ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du profil enfant
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Profil enfant récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChildProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', getProfile);

/**
 * @openapi
 * /api/profiles/{id}:
 *   put:
 *     tags:
 *       - Profiles
 *     summary: Mettre à jour un profil enfant
 *     description: Mise à jour complète des informations d'un profil enfant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du profil enfant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date de naissance
 *                 example: "2018-05-15"
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL de l'avatar
 *                 example: https://example.com/avatars/child1.jpg
 *               developmentLevel:
 *                 type: string
 *                 description: Niveau de développement
 *                 example: Intermédiaire
 *               iepGoals:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Objectifs du plan d'intervention personnalisé
 *                 example: ["Améliorer la communication", "Développer l'autonomie"]
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
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
 *                   example: Profil mis à jour avec succès
 *                 data:
 *                   $ref: '#/components/schemas/ChildProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', updateProfile);

/**
 * @openapi
 * /api/profiles/{id}/preferences:
 *   patch:
 *     tags:
 *       - Profiles
 *     summary: Mettre à jour les préférences sensorielles
 *     description: Mise à jour des préférences sensorielles et d'accessibilité d'un enfant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du profil enfant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sensoryPreferences:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [LOW_STIMULATION, MEDIUM_STIMULATION, HIGH_CONTRAST, MONOCHROME]
 *                 description: Préférences sensorielles
 *                 example: ["LOW_STIMULATION", "HIGH_CONTRAST"]
 *               soundEnabled:
 *                 type: boolean
 *                 description: Sons activés
 *                 example: true
 *               animationsEnabled:
 *                 type: boolean
 *                 description: Animations activées
 *                 example: false
 *               dyslexiaMode:
 *                 type: boolean
 *                 description: Mode dyslexie activé
 *                 example: false
 *               highContrastMode:
 *                 type: boolean
 *                 description: Mode contraste élevé
 *                 example: true
 *               fontSize:
 *                 type: string
 *                 enum: [small, medium, large]
 *                 description: Taille de police
 *                 example: large
 *     responses:
 *       200:
 *         description: Préférences mises à jour avec succès
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
 *                   example: Préférences mises à jour avec succès
 *                 data:
 *                   $ref: '#/components/schemas/ChildProfile'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/preferences', updatePreferences);

router.post('/:id/avatar', uploadAvatarMiddleware, uploadAvatar);

export default router;
