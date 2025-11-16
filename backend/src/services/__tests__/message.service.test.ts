import { MessageService } from '../message.service';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../types';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as unknown as PrismaClient;

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    messageService = new MessageService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('getUserMessages', () => {
    it('devrait récupérer tous les messages d\'un utilisateur', async () => {
      const userId = 'user_123';
      const mockSentMessages = [
        {
          id: 'msg_1',
          senderId: userId,
          recipientId: 'user_456',
          subject: 'Test',
          content: 'Message envoyé',
          recipient: { name: 'User 2' },
        },
      ];

      const mockReceivedMessages = [
        {
          id: 'msg_2',
          senderId: 'user_456',
          recipientId: userId,
          subject: 'Réponse',
          content: 'Message reçu',
          sender: { name: 'User 2' },
        },
      ];

      (mockPrisma.message.findMany as jest.Mock)
        .mockResolvedValueOnce(mockSentMessages)
        .mockResolvedValueOnce(mockReceivedMessages);

      const result = await messageService.getUserMessages(userId);

      expect(result).toHaveProperty('sent');
      expect(result).toHaveProperty('received');
      expect(result.sent).toEqual(mockSentMessages);
      expect(result.received).toEqual(mockReceivedMessages);
    });
  });

  describe('getUnreadMessages', () => {
    it('devrait récupérer les messages non lus', async () => {
      const userId = 'user_123';
      const mockUnreadMessages = [
        {
          id: 'msg_1',
          senderId: 'user_456',
          recipientId: userId,
          read: false,
          sender: { name: 'User 2' },
        },
        {
          id: 'msg_2',
          senderId: 'user_789',
          recipientId: userId,
          read: false,
          sender: { name: 'User 3' },
        },
      ];

      (mockPrisma.message.findMany as jest.Mock).mockResolvedValue(
        mockUnreadMessages
      );

      const result = await messageService.getUnreadMessages(userId);

      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: {
          recipientId: userId,
          read: false,
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockUnreadMessages);
      expect(result).toHaveLength(2);
    });
  });

  describe('sendMessage', () => {
    it('devrait envoyer un message avec succès', async () => {
      const messageData = {
        senderId: 'user_123',
        recipientId: 'user_456',
        subject: 'Test',
        content: 'Contenu du message',
        attachments: [],
      };

      const mockSender = {
        id: messageData.senderId,
        name: 'Sender',
        email: 'sender@example.com',
      };

      const mockRecipient = {
        id: messageData.recipientId,
        name: 'Recipient',
        email: 'recipient@example.com',
      };

      const mockMessage = {
        id: 'msg_new',
        ...messageData,
        read: false,
        sender: mockSender,
        recipient: mockRecipient,
      };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(mockRecipient);
      (mockPrisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await messageService.sendMessage(messageData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          senderId: messageData.senderId,
          recipientId: messageData.recipientId,
          subject: messageData.subject,
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(mockMessage);
    });

    it('devrait échouer si l\'expéditeur n\'existe pas', async () => {
      const messageData = {
        senderId: 'nonexistent',
        recipientId: 'user_456',
        subject: 'Test',
        content: 'Message',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(messageService.sendMessage(messageData)).rejects.toThrow(
        AppError
      );
      await expect(messageService.sendMessage(messageData)).rejects.toThrow(
        'Expéditeur introuvable'
      );
    });

    it('devrait échouer si le destinataire n\'existe pas', async () => {
      const messageData = {
        senderId: 'user_123',
        recipientId: 'nonexistent',
        subject: 'Test',
        content: 'Message',
      };

      const mockSender = { id: messageData.senderId };

      (mockPrisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockSender)
        .mockResolvedValueOnce(null);

      await expect(messageService.sendMessage(messageData)).rejects.toThrow(
        AppError
      );
      await expect(messageService.sendMessage(messageData)).rejects.toThrow(
        'Destinataire introuvable'
      );
    });
  });

  describe('markAsRead', () => {
    it('devrait marquer un message comme lu', async () => {
      const messageId = 'msg_123';
      const userId = 'user_123';

      const mockMessage = {
        id: messageId,
        senderId: 'user_456',
        recipientId: userId,
        read: false,
      };

      const mockUpdatedMessage = {
        ...mockMessage,
        read: true,
        sender: { name: 'Sender' },
      };

      (mockPrisma.message.findUnique as jest.Mock).mockResolvedValue(
        mockMessage
      );
      (mockPrisma.message.update as jest.Mock).mockResolvedValue(
        mockUpdatedMessage
      );

      const result = await messageService.markAsRead(messageId, userId);

      expect(mockPrisma.message.update).toHaveBeenCalledWith({
        where: { id: messageId },
        data: { read: true },
        include: expect.any(Object),
      });
      expect(result.read).toBe(true);
    });

    it('devrait échouer si l\'utilisateur n\'est pas le destinataire', async () => {
      const messageId = 'msg_123';
      const userId = 'user_123';

      const mockMessage = {
        id: messageId,
        senderId: 'user_456',
        recipientId: 'user_789', // Différent de userId
        read: false,
      };

      (mockPrisma.message.findUnique as jest.Mock).mockResolvedValue(
        mockMessage
      );

      await expect(
        messageService.markAsRead(messageId, userId)
      ).rejects.toThrow(AppError);
      await expect(
        messageService.markAsRead(messageId, userId)
      ).rejects.toThrow('pas autorisé');
    });
  });

  describe('markAllAsRead', () => {
    it('devrait marquer tous les messages comme lus', async () => {
      const userId = 'user_123';

      (mockPrisma.message.updateMany as jest.Mock).mockResolvedValue({
        count: 5,
      });

      const result = await messageService.markAllAsRead(userId);

      expect(mockPrisma.message.updateMany).toHaveBeenCalledWith({
        where: {
          recipientId: userId,
          read: false,
        },
        data: { read: true },
      });
      expect(result).toBe(5);
    });
  });

  describe('deleteMessage', () => {
    it('devrait supprimer un message si l\'utilisateur est l\'expéditeur', async () => {
      const messageId = 'msg_123';
      const userId = 'user_123';

      const mockMessage = {
        id: messageId,
        senderId: userId,
        recipientId: 'user_456',
      };

      (mockPrisma.message.findUnique as jest.Mock).mockResolvedValue(
        mockMessage
      );
      (mockPrisma.message.delete as jest.Mock).mockResolvedValue(mockMessage);

      await messageService.deleteMessage(messageId, userId);

      expect(mockPrisma.message.delete).toHaveBeenCalledWith({
        where: { id: messageId },
      });
    });

    it('devrait supprimer un message si l\'utilisateur est le destinataire', async () => {
      const messageId = 'msg_123';
      const userId = 'user_456';

      const mockMessage = {
        id: messageId,
        senderId: 'user_123',
        recipientId: userId,
      };

      (mockPrisma.message.findUnique as jest.Mock).mockResolvedValue(
        mockMessage
      );
      (mockPrisma.message.delete as jest.Mock).mockResolvedValue(mockMessage);

      await messageService.deleteMessage(messageId, userId);

      expect(mockPrisma.message.delete).toHaveBeenCalledWith({
        where: { id: messageId },
      });
    });

    it('devrait échouer si l\'utilisateur n\'est ni expéditeur ni destinataire', async () => {
      const messageId = 'msg_123';
      const userId = 'user_789';

      const mockMessage = {
        id: messageId,
        senderId: 'user_123',
        recipientId: 'user_456',
      };

      (mockPrisma.message.findUnique as jest.Mock).mockResolvedValue(
        mockMessage
      );

      await expect(
        messageService.deleteMessage(messageId, userId)
      ).rejects.toThrow(AppError);
      await expect(
        messageService.deleteMessage(messageId, userId)
      ).rejects.toThrow('pas autorisé');
    });
  });

  describe('getConversation', () => {
    it('devrait récupérer la conversation entre deux utilisateurs', async () => {
      const userId1 = 'user_123';
      const userId2 = 'user_456';

      const mockMessages = [
        {
          id: 'msg_1',
          senderId: userId1,
          recipientId: userId2,
          content: 'Bonjour',
          sender: { name: 'User 1' },
          recipient: { name: 'User 2' },
        },
        {
          id: 'msg_2',
          senderId: userId2,
          recipientId: userId1,
          content: 'Salut',
          sender: { name: 'User 2' },
          recipient: { name: 'User 1' },
        },
      ];

      (mockPrisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messageService.getConversation(userId1, userId2);

      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { senderId: userId1, recipientId: userId2 },
            { senderId: userId2, recipientId: userId1 },
          ],
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockMessages);
      expect(result).toHaveLength(2);
    });
  });

  describe('getUnreadCount', () => {
    it('devrait compter les messages non lus', async () => {
      const userId = 'user_123';

      (mockPrisma.message.count as jest.Mock).mockResolvedValue(3);

      const result = await messageService.getUnreadCount(userId);

      expect(mockPrisma.message.count).toHaveBeenCalledWith({
        where: {
          recipientId: userId,
          read: false,
        },
      });
      expect(result).toBe(3);
    });
  });

  describe('getConversationsList', () => {
    it('devrait récupérer la liste des conversations', async () => {
      const userId = 'user_123';

      const mockSentTo = [{ recipientId: 'user_456' }];
      const mockReceivedFrom = [{ senderId: 'user_789' }];

      const mockUsers = [
        { id: 'user_456', name: 'User 2', email: 'user2@example.com' },
        { id: 'user_789', name: 'User 3', email: 'user3@example.com' },
      ];

      const mockLastMessage = {
        id: 'msg_1',
        content: 'Dernier message',
        createdAt: new Date(),
      };

      (mockPrisma.message.findMany as jest.Mock)
        .mockResolvedValueOnce(mockSentTo)
        .mockResolvedValueOnce(mockReceivedFrom);
      (mockPrisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (mockPrisma.message.findFirst as jest.Mock).mockResolvedValue(
        mockLastMessage
      );
      (mockPrisma.message.count as jest.Mock).mockResolvedValue(2);

      const result = await messageService.getConversationsList(userId);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('user');
      expect(result[0]).toHaveProperty('lastMessage');
      expect(result[0]).toHaveProperty('unreadCount');
    });
  });
});
