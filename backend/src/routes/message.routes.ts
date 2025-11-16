import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
} from '../controllers/message.controller';

const router = Router();

/**
 * @openapi
 * /api/messages/user/{userId}:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Obtenir les messages d'un utilisateur
 *     description: Récupère tous les messages envoyés et reçus par un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
 *         example: 123e4567-e89b-12d3-a456-426614174000
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Afficher uniquement les messages non lus
 *     responses:
 *       200:
 *         description: Messages de l'utilisateur
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
 *                     sent:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *                       description: Messages envoyés
 *                     received:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *                       description: Messages reçus
 *                     unreadCount:
 *                       type: integer
 *                       description: Nombre de messages non lus
 *                       example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/user/:userId', getMessages);

/**
 * @openapi
 * /api/messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Envoyer un message
 *     description: Envoie un nouveau message à un utilisateur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - subject
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *                 format: uuid
 *                 description: ID du destinataire
 *                 example: 456e4567-e89b-12d3-a456-426614174000
 *               subject:
 *                 type: string
 *                 description: Sujet du message
 *                 example: Question sur l'activité
 *               content:
 *                 type: string
 *                 description: Contenu du message
 *                 example: Bonjour, j'aimerais avoir des précisions...
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: URLs des pièces jointes
 *                 example: ["https://example.com/file1.pdf"]
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
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
 *                   example: Message envoyé avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Destinataire introuvable
 */
router.post('/', sendMessage);

/**
 * @openapi
 * /api/messages/{messageId}/read:
 *   patch:
 *     tags:
 *       - Messages
 *     summary: Marquer un message comme lu
 *     description: Marque un message spécifique comme lu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du message
 *         example: 789e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Message marqué comme lu
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
 *                   example: Message marqué comme lu
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Non autorisé à modifier ce message
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:messageId/read', markAsRead);

/**
 * @openapi
 * /api/messages/{messageId}:
 *   delete:
 *     tags:
 *       - Messages
 *     summary: Supprimer un message
 *     description: Supprime un message (expéditeur ou destinataire uniquement)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du message
 *         example: 789e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
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
 *                   example: Message supprimé avec succès
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Non autorisé à supprimer ce message
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:messageId', deleteMessage);

export default router;
