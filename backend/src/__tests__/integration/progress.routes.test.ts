import request from 'supertest';
import express, { Application } from 'express';
import progressRoutes from '../../routes/progress.routes';
import authRoutes from '../../routes/auth.routes';
import {
  cleanDatabase,
  teardown,
  prisma,
  createTestUser,
  createTestChildProfile,
} from '../../tests/helpers/testSetup';
import { ServiceFactory } from '../../services';

describe('Progress Routes Integration Tests', () => {
  let app: Application;
  let authToken: string;
  let userId: string;
  let childProfileId: string;
  let progressId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/progress', progressRoutes);

    ServiceFactory.initialize(prisma);
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Create test user
    const testUser = await createTestUser(app, {
      email: 'parent@example.com',
      password: 'SecureP@ssw0rd',
      name: 'Parent Test',
      role: 'PARENT',
    });

    authToken = testUser.token;
    userId = testUser.userId;

    // Create test child profile (also creates Progress automatically)
    const profile = await createTestChildProfile(app, authToken, userId);
    childProfileId = profile.id;

    // Get progress ID
    const progress = await prisma.progress.findUnique({
      where: { childId: childProfileId },
    });
    progressId = progress!.id;
  });

  afterAll(async () => {
    await teardown();
  });

  describe('GET /api/progress/:childId', () => {
    it('should get progress for a child', async () => {
      const response = await request(app)
        .get(`/api/progress/${childProfileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.childId).toBe(childProfileId);
      expect(response.body.data).toHaveProperty('totalActivitiesCompleted');
      expect(response.body.data).toHaveProperty('tokensEarned');
      expect(response.body.data).toHaveProperty('currentStreak');
      expect(response.body.data).toHaveProperty('rewardsUnlocked');
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/api/progress/${childProfileId}`).expect(401);
    });

    it('should return 404 for non-existent child', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/progress/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/progress/:childId', () => {
    let adminToken: string;

    beforeEach(async () => {
      // Create admin user
      const admin = await createTestUser(app, {
        email: 'admin@example.com',
        password: 'AdminP@ssw0rd',
        name: 'Admin User',
        role: 'ADMIN',
      });
      adminToken = admin.token;
    });

    it('should update progress (admin only)', async () => {
      const updateData = {
        totalActivitiesCompleted: 50,
        tokensEarned: 500,
        currentStreak: 7,
      };

      const response = await request(app)
        .put(`/api/progress/${childProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Progrès mis à jour avec succès');
      expect(response.body.data.totalActivitiesCompleted).toBe(50);
      expect(response.body.data.tokensEarned).toBe(500);
      expect(response.body.data.currentStreak).toBe(7);
    });

    it('should fail for non-admin users', async () => {
      await request(app)
        .put(`/api/progress/${childProfileId}`)
        .set('Authorization', `Bearer ${authToken}`) // Regular user
        .send({ totalActivitiesCompleted: 50 })
        .expect(403);
    });

    it('should fail with negative values', async () => {
      await request(app)
        .put(`/api/progress/${childProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ tokensEarned: -10 })
        .expect(400);
    });
  });

  describe('GET /api/progress/:childId/rewards', () => {
    beforeEach(async () => {
      // Update progress with some unlocked rewards
      await prisma.progress.update({
        where: { childId: childProfileId },
        data: {
          rewardsUnlocked: ['badge_1', 'badge_5'],
          tokensEarned: 200,
        },
      });
    });

    it('should get rewards for a child', async () => {
      const response = await request(app)
        .get(`/api/progress/${childProfileId}/rewards`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('unlocked');
      expect(response.body.data).toHaveProperty('available');
      expect(response.body.data.unlocked).toContain('badge_1');
      expect(response.body.data.unlocked).toContain('badge_5');
      expect(response.body.data.available).toBeInstanceOf(Array);
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/api/progress/${childProfileId}/rewards`).expect(401);
    });
  });

  describe('POST /api/progress/:childId/rewards/:rewardId/unlock', () => {
    beforeEach(async () => {
      // Give child enough tokens
      await prisma.progress.update({
        where: { childId: childProfileId },
        data: {
          tokensEarned: 200,
          rewardsUnlocked: [],
        },
      });
    });

    it('should unlock a reward', async () => {
      const response = await request(app)
        .post(`/api/progress/${childProfileId}/rewards/badge_10/unlock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Récompense débloquée avec succès');
      expect(response.body.data).toHaveProperty('rewardId');
      expect(response.body.data).toHaveProperty('tokensSpent');
      expect(response.body.data.rewardId).toBe('badge_10');
    });

    it('should fail with insufficient tokens', async () => {
      // Set tokens to 0
      await prisma.progress.update({
        where: { childId: childProfileId },
        data: { tokensEarned: 0 },
      });

      await request(app)
        .post(`/api/progress/${childProfileId}/rewards/badge_10/unlock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail if reward already unlocked', async () => {
      // Unlock reward first
      await request(app)
        .post(`/api/progress/${childProfileId}/rewards/badge_10/unlock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to unlock again
      await request(app)
        .post(`/api/progress/${childProfileId}/rewards/badge_10/unlock`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
