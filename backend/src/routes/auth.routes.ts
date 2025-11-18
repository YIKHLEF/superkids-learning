import { Router } from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimiter';
import { auditLog } from '../middleware/audit';
import { AuditAction } from '../services/audit.service';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Créer un nouveau compte utilisateur
 *     description: Inscription d'un nouvel utilisateur dans le système
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email unique
 *                 example: parent@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: Mot de passe (min 8 caractères)
 *                 example: SecureP@ssw0rd
 *               name:
 *                 type: string
 *                 description: Nom complet de l'utilisateur
 *                 example: Marie Dupont
 *               role:
 *                 type: string
 *                 enum: [CHILD, PARENT, EDUCATOR, THERAPIST, ADMIN]
 *                 description: Rôle de l'utilisateur
 *                 example: PARENT
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
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
 *                   example: Utilisateur créé avec succès
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: Token JWT pour authentification
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', authLimiter, register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Se connecter au système
 *     description: Authentification d'un utilisateur existant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email du compte
 *                 example: parent@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe du compte
 *                 example: SecureP@ssw0rd
 *     responses:
 *       200:
 *         description: Connexion réussie
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
 *                   example: Connexion réussie
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: Token JWT pour authentification
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  authLimiter,
  auditLog(AuditAction.USER_LOGIN, undefined, (req) => ({ email: req.body?.email })),
  login
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Se déconnecter du système
 *     description: Déconnexion de l'utilisateur (invalide le token côté client)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
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
 *                   example: Déconnexion réussie
 */
router.post('/logout', logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     description: Récupère les informations de l'utilisateur actuellement authentifié
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', getCurrentUser);

export default router;
