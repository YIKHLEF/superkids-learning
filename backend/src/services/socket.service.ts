import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  SOCKET_EVENTS,
  SendMessageData,
  UserStatusData,
  ProgressUpdateData,
  ActivityCompletedData,
  RewardUnlockedData,
  NotificationData,
} from '../types/socket.types';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export class SocketService {
  private io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
  private prisma: PrismaClient;
  private onlineUsers: Map<string, Set<string>>; // userId -> Set<socketId>
  private typingUsers: Map<string, Set<string>>; // conversationId -> Set<userId>

  constructor(
    io: Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >,
    prisma: PrismaClient
  ) {
    this.io = io;
    this.prisma = prisma;
    this.onlineUsers = new Map();
    this.typingUsers = new Map();
    this.initialize();
  }

  /**
   * Initialiser les gestionnaires d'événements Socket.io
   */
  private initialize() {
    this.io.on('connection', (socket: TypedSocket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // Middleware d'authentification
      this.handleAuthentication(socket);

      // Événements de messagerie
      this.handleMessaging(socket);

      // Événements de présence
      this.handlePresence(socket);

      // Événements de notifications
      this.handleNotifications(socket);

      // Événements de déconnexion
      this.handleDisconnection(socket);
    });

    logger.info('✅ Socket.io service initialized');
  }

  /**
   * Gérer l'authentification du socket
   */
  private handleAuthentication(socket: TypedSocket) {
    socket.on(SOCKET_EVENTS.AUTHENTICATE, async (token: string) => {
      try {
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, jwtSecret) as { userId: string };

        // Récupérer l'utilisateur
        const user = await this.prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, name: true, role: true },
        });

        if (!user) {
          socket.emit(SOCKET_EVENTS.AUTH_ERROR, 'User not found');
          return;
        }

        // Stocker les données utilisateur dans le socket
        socket.data.userId = user.id;
        socket.data.userName = user.name;
        socket.data.userRole = user.role;
        socket.data.authenticated = true;

        // Joindre la room de l'utilisateur
        socket.join(user.id);

        // Marquer l'utilisateur comme en ligne
        this.setUserOnline(user.id, socket.id);

        socket.emit(SOCKET_EVENTS.AUTHENTICATED, user.id);
        logger.info(`User authenticated: ${user.name} (${user.id})`);

        // Notifier les autres utilisateurs
        this.io.emit(SOCKET_EVENTS.USER_ONLINE, user.id);
      } catch (error) {
        logger.error('Authentication error:', error);
        socket.emit(SOCKET_EVENTS.AUTH_ERROR, 'Invalid token');
      }
    });

    socket.on(SOCKET_EVENTS.JOIN_ROOM, (userId: string) => {
      if (!socket.data.authenticated) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Not authenticated',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      socket.join(userId);
      logger.info(`User ${socket.data.userId} joined room: ${userId}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (userId: string) => {
      socket.leave(userId);
      logger.info(`User ${socket.data.userId} left room: ${userId}`);
    });
  }

  /**
   * Gérer les événements de messagerie
   */
  private handleMessaging(socket: TypedSocket) {
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data: SendMessageData) => {
      if (!socket.data.authenticated || !socket.data.userId) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Not authenticated',
          code: 'AUTH_REQUIRED',
        });
        return;
      }

      try {
        // Créer le message dans la base de données
        const message = await this.prisma.message.create({
          data: {
            senderId: socket.data.userId,
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

        // Envoyer le message au destinataire
          this.io.to(data.recipientId).emit(SOCKET_EVENTS.NEW_MESSAGE, {
            id: message.id,
            senderId: message.senderId,
            senderName: message.sender.name,
            recipientId: message.recipientId,
            subject: message.subject,
            content: message.content,
            attachments: Array.isArray(message.attachments)
              ? (message.attachments as string[])
              : [],
            createdAt: message.createdAt.toISOString(),
          });

        // Confirmer l'envoi à l'expéditeur
        socket.emit(SOCKET_EVENTS.MESSAGE_SENT, {
          messageId: message.id,
          recipientId: data.recipientId,
          timestamp: message.createdAt.toISOString(),
        });

        // Créer une notification pour le destinataire
        this.sendNotification(data.recipientId, {
          id: `notif_${message.id}`,
          userId: data.recipientId,
          type: 'message',
          title: `Nouveau message de ${socket.data.userName}`,
          message: data.subject,
          read: false,
          actionUrl: `/messages/${message.id}`,
          createdAt: new Date().toISOString(),
        });

        logger.info(
          `Message sent from ${socket.data.userId} to ${data.recipientId}`
        );
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Failed to send message',
          code: 'MESSAGE_SEND_FAILED',
          details: error,
        });
      }
    });

    socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
      if (!socket.data.authenticated || !socket.data.userId) return;

      const conversationId = data.conversationId;
      if (!this.typingUsers.has(conversationId)) {
        this.typingUsers.set(conversationId, new Set());
      }
      this.typingUsers.get(conversationId)!.add(socket.data.userId);

      // Notifier les autres participants
      socket.to(conversationId).emit(SOCKET_EVENTS.TYPING_INDICATOR, {
        userId: socket.data.userId,
        userName: socket.data.userName || 'Unknown',
        isTyping: true,
      });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      if (!socket.data.authenticated || !socket.data.userId) return;

      const conversationId = data.conversationId;
      this.typingUsers.get(conversationId)?.delete(socket.data.userId);

      socket.to(conversationId).emit(SOCKET_EVENTS.TYPING_INDICATOR, {
        userId: socket.data.userId,
        userName: socket.data.userName || 'Unknown',
        isTyping: false,
      });
    });

    socket.on(SOCKET_EVENTS.MESSAGE_READ, async (messageId: string) => {
      if (!socket.data.authenticated || !socket.data.userId) return;

      try {
        const message = await this.prisma.message.update({
          where: { id: messageId },
          data: { read: true },
          include: { sender: true },
        });

        // Notifier l'expéditeur que le message a été lu
        this.io.to(message.senderId).emit(SOCKET_EVENTS.MESSAGE_READ_EVENT, {
          messageId: message.id,
          readBy: socket.data.userId,
          readAt: new Date().toISOString(),
        });

        logger.info(`Message ${messageId} marked as read by ${socket.data.userId}`);
      } catch (error) {
        logger.error('Error marking message as read:', error);
      }
    });
  }

  /**
   * Gérer les événements de présence
   */
  private handlePresence(socket: TypedSocket) {
    socket.on(
      SOCKET_EVENTS.USER_STATUS,
      (status: 'online' | 'offline' | 'away') => {
        if (!socket.data.authenticated || !socket.data.userId) return;

        const statusData: UserStatusData = {
          userId: socket.data.userId,
          status,
          lastSeen: status === 'offline' ? new Date().toISOString() : undefined,
        };

        // Diffuser le changement de statut
        this.io.emit(SOCKET_EVENTS.USER_STATUS_CHANGE, statusData);

        logger.info(`User ${socket.data.userId} status changed to ${status}`);
      }
    );
  }

  /**
   * Gérer les notifications
   */
  private handleNotifications(socket: TypedSocket) {
    socket.on(SOCKET_EVENTS.MARK_NOTIFICATION_READ, async (notificationId: string) => {
      if (!socket.data.authenticated || !socket.data.userId) return;

      // Logique pour marquer la notification comme lue
      // (À implémenter selon votre schéma de base de données)
      logger.info(`Notification ${notificationId} marked as read`);
    });
  }

  /**
   * Gérer la déconnexion
   */
  private handleDisconnection(socket: TypedSocket) {
    socket.on('disconnect', () => {
      if (socket.data.authenticated && socket.data.userId) {
        this.setUserOffline(socket.data.userId, socket.id);

        // Vérifier si l'utilisateur a d'autres connexions actives
        const userSockets = this.onlineUsers.get(socket.data.userId);
        if (!userSockets || userSockets.size === 0) {
          // L'utilisateur est complètement déconnecté
          this.io.emit(SOCKET_EVENTS.USER_OFFLINE, socket.data.userId);
          logger.info(`User ${socket.data.userId} is now offline`);
        }
      }

      logger.info(`Socket disconnected: ${socket.id}`);
    });
  }

  /**
   * Marquer un utilisateur comme en ligne
   */
  private setUserOnline(userId: string, socketId: string) {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(socketId);
  }

  /**
   * Marquer un utilisateur comme hors ligne
   */
  private setUserOffline(userId: string, socketId: string) {
    const userSockets = this.onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.onlineUsers.delete(userId);
      }
    }
  }

  /**
   * Vérifier si un utilisateur est en ligne
   */
  public isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Obtenir tous les utilisateurs en ligne
   */
  public getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * Envoyer une notification à un utilisateur
   */
  public sendNotification(userId: string, notification: NotificationData) {
    this.io.to(userId).emit(SOCKET_EVENTS.NEW_NOTIFICATION, notification);
    logger.info(`Notification sent to user ${userId}: ${notification.title}`);
  }

  /**
   * Notifier une mise à jour de progrès
   */
  public notifyProgressUpdate(childId: string, data: ProgressUpdateData) {
    // Envoyer aux parents et éducateurs associés
    this.io.to(childId).emit(SOCKET_EVENTS.PROGRESS_UPDATE, data);
    logger.info(`Progress update sent for child ${childId}`);
  }

  /**
   * Notifier la complétion d'une activité
   */
  public notifyActivityCompleted(childId: string, data: ActivityCompletedData) {
    this.io.to(childId).emit(SOCKET_EVENTS.ACTIVITY_COMPLETED, data);
    logger.info(`Activity completed notification sent for child ${childId}`);
  }

  /**
   * Notifier le déblocage d'une récompense
   */
  public notifyRewardUnlocked(childId: string, data: RewardUnlockedData) {
    this.io.to(childId).emit(SOCKET_EVENTS.REWARD_UNLOCKED, data);
    logger.info(`Reward unlocked notification sent for child ${childId}`);
  }

  /**
   * Obtenir le serveur Socket.io
   */
  public getIO() {
    return this.io;
  }
}
