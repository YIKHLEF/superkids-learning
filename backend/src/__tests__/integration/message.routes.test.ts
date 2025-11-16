import request from 'supertest';
import express, { Application } from 'express';
import messageRoutes from '../../routes/message.routes';
import authRoutes from '../../routes/auth.routes';
import { cleanDatabase, teardown, prisma, createTestUser } from '../../tests/helpers/testSetup';
import { ServiceFactory } from '../../services';

describe('Message Routes Integration Tests', () => {
  let app: Application;
  let senderToken: string;
  let senderId: string;
  let recipientToken: string;
  let recipientId: string;
  let messageId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/messages', messageRoutes);

    ServiceFactory.initialize(prisma);
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Create sender
    const sender = await createTestUser(app, {
      email: 'sender@example.com',
      password: 'SecureP@ssw0rd',
      name: 'Sender User',
      role: 'PARENT',
    });

    senderToken = sender.token;
    senderId = sender.userId;

    // Create recipient
    const recipient = await createTestUser(app, {
      email: 'recipient@example.com',
      password: 'SecureP@ssw0rd',
      name: 'Recipient User',
      role: 'EDUCATOR',
    });

    recipientToken = recipient.token;
    recipientId = recipient.userId;
  });

  afterAll(async () => {
    await teardown();
  });

  describe('POST /api/messages', () => {
    it('should send a message successfully', async () => {
      const messageData = {
        recipientId: recipientId,
        subject: 'Question sur l\'activité',
        content: 'Bonjour, j\'aimerais avoir des précisions...',
        attachments: ['https://example.com/file.pdf'],
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Message envoyé avec succès');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.senderId).toBe(senderId);
      expect(response.body.data.recipientId).toBe(recipientId);
      expect(response.body.data.subject).toBe(messageData.subject);
      expect(response.body.data.content).toBe(messageData.content);
      expect(response.body.data.read).toBe(false);

      messageId = response.body.data.id;
    });

    it('should send message without attachments', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientId: recipientId,
          subject: 'Simple message',
          content: 'Hello!',
        })
        .expect(201);

      expect(response.body.data.attachments).toEqual([]);
    });

    it('should fail with missing required fields', async () => {
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientId: recipientId,
          // Missing subject and content
        })
        .expect(400);
    });

    it('should fail with non-existent recipient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientId: fakeId,
          subject: 'Test',
          content: 'Test content',
        })
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post('/api/messages')
        .send({
          recipientId: recipientId,
          subject: 'Test',
          content: 'Test',
        })
        .expect(401);
    });
  });

  describe('GET /api/messages/user/:userId', () => {
    beforeEach(async () => {
      // Create some messages
      await prisma.message.create({
        data: {
          senderId: senderId,
          recipientId: recipientId,
          subject: 'Message 1',
          content: 'Content 1',
          read: false,
        },
      });

      await prisma.message.create({
        data: {
          senderId: recipientId,
          recipientId: senderId,
          subject: 'Message 2',
          content: 'Content 2',
          read: true,
        },
      });
    });

    it('should get messages for a user', async () => {
      const response = await request(app)
        .get(`/api/messages/user/${senderId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sent');
      expect(response.body.data).toHaveProperty('received');
      expect(response.body.data).toHaveProperty('unreadCount');
      expect(response.body.data.sent).toBeInstanceOf(Array);
      expect(response.body.data.received).toBeInstanceOf(Array);
      expect(response.body.data.sent.length).toBeGreaterThan(0);
      expect(response.body.data.received.length).toBeGreaterThan(0);
    });

    it('should filter unread messages only', async () => {
      const response = await request(app)
        .get(`/api/messages/user/${recipientId}?unreadOnly=true`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .expect(200);

      expect(response.body.data.received.every((m: any) => m.read === false)).toBe(true);
    });

    it('should return empty arrays for user with no messages', async () => {
      const newUser = await createTestUser(app, {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
        role: 'PARENT',
      });

      const response = await request(app)
        .get(`/api/messages/user/${newUser.userId}`)
        .set('Authorization', `Bearer ${newUser.token}`)
        .expect(200);

      expect(response.body.data.sent).toEqual([]);
      expect(response.body.data.received).toEqual([]);
      expect(response.body.data.unreadCount).toBe(0);
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/api/messages/user/${senderId}`).expect(401);
    });
  });

  describe('PATCH /api/messages/:messageId/read', () => {
    beforeEach(async () => {
      const message = await prisma.message.create({
        data: {
          senderId: senderId,
          recipientId: recipientId,
          subject: 'Unread message',
          content: 'This is unread',
          read: false,
        },
      });
      messageId = message.id;
    });

    it('should mark message as read', async () => {
      const response = await request(app)
        .patch(`/api/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Message marqué comme lu');
      expect(response.body.data.read).toBe(true);
    });

    it('should fail if not the recipient', async () => {
      // Sender trying to mark as read
      await request(app)
        .patch(`/api/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .patch(`/api/messages/${fakeId}/read`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .expect(404);
    });
  });

  describe('DELETE /api/messages/:messageId', () => {
    beforeEach(async () => {
      const message = await prisma.message.create({
        data: {
          senderId: senderId,
          recipientId: recipientId,
          subject: 'Message to delete',
          content: 'This will be deleted',
          read: false,
        },
      });
      messageId = message.id;
    });

    it('should delete message (sender)', async () => {
      const response = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Message supprimé avec succès');

      // Verify deletion
      const deleted = await prisma.message.findUnique({
        where: { id: messageId },
      });
      expect(deleted).toBeNull();
    });

    it('should delete message (recipient)', async () => {
      const response = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail if neither sender nor recipient', async () => {
      const otherUser = await createTestUser(app, {
        email: 'other@example.com',
        password: 'Password123',
        name: 'Other User',
        role: 'PARENT',
      });

      await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${otherUser.token}`)
        .expect(403);
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .delete(`/api/messages/${fakeId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .expect(404);
    });
  });
});
