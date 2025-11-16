import { PrismaClient, Message } from '@prisma/client';
import { SendMessageDTO, AppError } from '../types';
import { logger } from '../utils/logger';

export class MessageService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtenir tous les messages d'un utilisateur (envoyés et reçus)
   */
  async getUserMessages(userId: string): Promise<{
    sent: Message[];
    received: Message[];
  }> {
    try {
      const [sentMessages, receivedMessages] = await Promise.all([
        this.prisma.message.findMany({
          where: { senderId: userId },
          include: {
            recipient: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.message.findMany({
          where: { recipientId: userId },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      logger.info(
        `Messages récupérés pour l'utilisateur ${userId}: ${sentMessages.length} envoyés, ${receivedMessages.length} reçus`
      );

      return {
        sent: sentMessages,
        received: receivedMessages,
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des messages:', error);
      throw new AppError('Erreur lors de la récupération des messages', 500);
    }
  }

  /**
   * Obtenir tous les messages reçus par un utilisateur
   */
  async getReceivedMessages(userId: string): Promise<Message[]> {
    try {
      const messages = await this.prisma.message.findMany({
        where: { recipientId: userId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.info(`${messages.length} messages reçus récupérés pour: ${userId}`);
      return messages;
    } catch (error) {
      logger.error('Erreur lors de la récupération des messages reçus:', error);
      throw new AppError(
        'Erreur lors de la récupération des messages reçus',
        500
      );
    }
  }

  /**
   * Obtenir les messages non lus d'un utilisateur
   */
  async getUnreadMessages(userId: string): Promise<Message[]> {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          recipientId: userId,
          read: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      logger.info(`${messages.length} messages non lus pour: ${userId}`);
      return messages;
    } catch (error) {
      logger.error('Erreur lors de la récupération des messages non lus:', error);
      throw new AppError(
        'Erreur lors de la récupération des messages non lus',
        500
      );
    }
  }

  /**
   * Envoyer un message
   */
  async sendMessage(data: SendMessageDTO): Promise<Message> {
    try {
      // Vérifier que l'expéditeur existe
      const sender = await this.prisma.user.findUnique({
        where: { id: data.senderId },
      });

      if (!sender) {
        throw new AppError('Expéditeur introuvable', 404);
      }

      // Vérifier que le destinataire existe
      const recipient = await this.prisma.user.findUnique({
        where: { id: data.recipientId },
      });

      if (!recipient) {
        throw new AppError('Destinataire introuvable', 404);
      }

      // Créer le message
      const message = await this.prisma.message.create({
        data: {
          senderId: data.senderId,
          recipientId: data.recipientId,
          subject: data.subject,
          content: data.content,
          attachments: data.attachments || [],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      logger.info(
        `Message envoyé de ${data.senderId} à ${data.recipientId}`
      );

      // TODO: Émettre un événement Socket.io pour notifier le destinataire
      // this.socketService.emit('new_message', message);

      return message;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de l\'envoi du message:', error);
      throw new AppError('Erreur lors de l\'envoi du message', 500);
    }
  }

  /**
   * Marquer un message comme lu
   */
  async markAsRead(messageId: string, userId: string): Promise<Message> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new AppError('Message introuvable', 404);
      }

      // Vérifier que l'utilisateur est bien le destinataire
      if (message.recipientId !== userId) {
        throw new AppError(
          'Vous n\'êtes pas autorisé à marquer ce message comme lu',
          403
        );
      }

      const updatedMessage = await this.prisma.message.update({
        where: { id: messageId },
        data: { read: true },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      logger.info(`Message ${messageId} marqué comme lu par ${userId}`);
      return updatedMessage;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors du marquage du message comme lu:', error);
      throw new AppError(
        'Erreur lors du marquage du message comme lu',
        500
      );
    }
  }

  /**
   * Marquer tous les messages comme lus
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.prisma.message.updateMany({
        where: {
          recipientId: userId,
          read: false,
        },
        data: { read: true },
      });

      logger.info(`${result.count} messages marqués comme lus pour: ${userId}`);
      return result.count;
    } catch (error) {
      logger.error(
        'Erreur lors du marquage de tous les messages comme lus:',
        error
      );
      throw new AppError(
        'Erreur lors du marquage de tous les messages comme lus',
        500
      );
    }
  }

  /**
   * Supprimer un message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new AppError('Message introuvable', 404);
      }

      // Vérifier que l'utilisateur est l'expéditeur ou le destinataire
      if (message.senderId !== userId && message.recipientId !== userId) {
        throw new AppError(
          'Vous n\'êtes pas autorisé à supprimer ce message',
          403
        );
      }

      await this.prisma.message.delete({
        where: { id: messageId },
      });

      logger.info(`Message ${messageId} supprimé par ${userId}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la suppression du message:', error);
      throw new AppError('Erreur lors de la suppression du message', 500);
    }
  }

  /**
   * Obtenir une conversation entre deux utilisateurs
   */
  async getConversation(
    userId1: string,
    userId2: string
  ): Promise<Message[]> {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId1, recipientId: userId2 },
            { senderId: userId2, recipientId: userId1 },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      logger.info(
        `${messages.length} messages récupérés pour la conversation entre ${userId1} et ${userId2}`
      );
      return messages;
    } catch (error) {
      logger.error('Erreur lors de la récupération de la conversation:', error);
      throw new AppError(
        'Erreur lors de la récupération de la conversation',
        500
      );
    }
  }

  /**
   * Obtenir le nombre de messages non lus
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.prisma.message.count({
        where: {
          recipientId: userId,
          read: false,
        },
      });

      logger.info(`${count} messages non lus pour: ${userId}`);
      return count;
    } catch (error) {
      logger.error(
        'Erreur lors du comptage des messages non lus:',
        error
      );
      throw new AppError(
        'Erreur lors du comptage des messages non lus',
        500
      );
    }
  }

  /**
   * Obtenir la liste des conversations (utilisateurs avec qui on a échangé)
   */
  async getConversationsList(userId: string) {
    try {
      // Récupérer tous les utilisateurs avec qui on a échangé
      const sentTo = await this.prisma.message.findMany({
        where: { senderId: userId },
        select: { recipientId: true },
        distinct: ['recipientId'],
      });

      const receivedFrom = await this.prisma.message.findMany({
        where: { recipientId: userId },
        select: { senderId: true },
        distinct: ['senderId'],
      });

      // Combiner et dédupliquer les IDs
      const userIds = new Set([
        ...sentTo.map((m) => m.recipientId),
        ...receivedFrom.map((m) => m.senderId),
      ]);

      // Récupérer les détails des utilisateurs
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: Array.from(userIds) },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      // Pour chaque utilisateur, récupérer le dernier message et le nombre de non lus
      const conversations = await Promise.all(
        users.map(async (user) => {
          const lastMessage = await this.prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, recipientId: user.id },
                { senderId: user.id, recipientId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });

          const unreadCount = await this.prisma.message.count({
            where: {
              senderId: user.id,
              recipientId: userId,
              read: false,
            },
          });

          return {
            user,
            lastMessage,
            unreadCount,
          };
        })
      );

      // Trier par dernier message
      conversations.sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
      });

      logger.info(`${conversations.length} conversations récupérées pour: ${userId}`);
      return conversations;
    } catch (error) {
      logger.error('Erreur lors de la récupération des conversations:', error);
      throw new AppError(
        'Erreur lors de la récupération des conversations',
        500
      );
    }
  }
}
