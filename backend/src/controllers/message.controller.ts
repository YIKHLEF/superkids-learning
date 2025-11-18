import { Request, Response } from 'express';
import { ServiceFactory } from '../services';
import { AppError, SendMessageDTO, UploadMetadata } from '../types';
import { storageClient } from '../utils/storageClient';
import { logger } from '../utils/logger';

const messageService = () => ServiceFactory.getMessageService();

export const getMessages = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page, limit, unreadOnly } = req.query;

  if (!req.user) {
    throw new AppError('Non autorisé', 401);
  }

  if (req.user.userId !== userId) {
    throw new AppError('Vous ne pouvez consulter que vos propres messages', 403);
  }

  const data = await messageService().getUserMessages(userId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  const received = unreadOnly === 'true'
    ? data.received.filter((message) => !message.read)
    : data.received;

  res.status(200).json({
    success: true,
    data: {
      sent: data.sent,
      received,
      unreadCount: data.unreadCount,
      pagination: {
        totalSent: data.totalSent,
        totalReceived: data.totalReceived,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      },
    },
  });
};

export const sendMessage = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Non autorisé', 401);
  }

  const payload = req.body as Omit<SendMessageDTO, 'senderId'>;
  if (!payload.recipientId || !payload.subject || !payload.content) {
    throw new AppError('Champs requis manquants', 400);
  }

  const message = await messageService().sendMessage({
    ...payload,
    senderId: req.user.userId,
    attachments: (payload.attachments as UploadMetadata[]) || [],
  });

  res.status(201).json({
    success: true,
    message: 'Message envoyé avec succès',
    data: message,
  });
};

export const markAsRead = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Non autorisé', 401);
  }

  const { messageId } = req.params;
  const message = await messageService().markAsRead(messageId, req.user.userId);

  res.status(200).json({
    success: true,
    message: 'Message marqué comme lu',
    data: message,
  });
};

export const deleteMessage = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Non autorisé', 401);
  }

  const { messageId } = req.params;
  await messageService().deleteMessage(messageId, req.user.userId);

  res.status(200).json({
    success: true,
    message: 'Message supprimé avec succès',
  });
};

export const uploadAttachments = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Non autorisé', 401);
  }

  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) {
    throw new AppError('Aucun fichier fourni', 400);
  }

  const metadata: UploadMetadata[] = [];
  for (const file of files) {
    const stored = await storageClient.upload(file, 'message-attachments');
    metadata.push(stored);
  }

  logger.info(`Uploaded ${metadata.length} attachments for user ${req.user.userId}`);

  res.status(201).json({
    success: true,
    message: 'Pièces jointes envoyées',
    data: metadata,
  });
};
