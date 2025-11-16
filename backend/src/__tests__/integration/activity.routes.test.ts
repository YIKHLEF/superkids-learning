import request from 'supertest';
import express, { Application } from 'express';
import activityRoutes from '../../routes/activity.routes';
import authRoutes from '../../routes/auth.routes';
import {
  cleanDatabase,
  teardown,
  prisma,
  createTestUser,
  createTestChildProfile,
  createTestActivity,
} from '../../tests/helpers/testSetup';
import { ServiceFactory } from '../../services';

describe('Activity Routes Integration Tests', () => {
  let app: Application;
  let authToken: string;
  let userId: string;
  let childProfileId: string;
  let activityId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/activities', activityRoutes);

    ServiceFactory.initialize(prisma);
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Create test user
    const testUser = await createTestUser(app, {
      email: 'educator@example.com',
      password: 'SecureP@ssw0rd',
      name: 'Educator Test',
      role: 'EDUCATOR',
    });

    authToken = testUser.token;
    userId = testUser.userId;

    // Create test child profile
    const profile = await createTestChildProfile(app, authToken, userId);
    childProfileId = profile.id;

    // Create test activity
    const activity = await createTestActivity();
    activityId = activity.id;
  });

  afterAll(async () => {
    await teardown();
  });

  describe('GET /api/activities', () => {
    beforeEach(async () => {
      // Create multiple activities
      await prisma.activity.create({
        data: {
          title: 'Mathématiques adaptées',
          description: 'Compter jusqu\'à 10',
          category: 'ACADEMIC',
          difficulty: 'BEGINNER',
          estimatedDuration: 20,
          targetAge: [5, 6],
          targetSkills: ['Comptage'],
          instructions: 'Compter les objets',
          materials: ['Blocs'],
        },
      });
    });

    it('should get all activities', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter activities by category', async () => {
      const response = await request(app)
        .get('/api/activities?category=ACADEMIC')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every((a: any) => a.category === 'ACADEMIC')).toBe(true);
    });

    it('should filter activities by difficulty', async () => {
      const response = await request(app)
        .get('/api/activities?difficulty=BEGINNER')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every((a: any) => a.difficulty === 'BEGINNER')).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/api/activities').expect(401);
    });
  });

  describe('GET /api/activities/:id', () => {
    it('should get activity by ID', async () => {
      const response = await request(app)
        .get(`/api/activities/${activityId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(activityId);
      expect(response.body.data.title).toBe('Reconnaissance des émotions');
      expect(response.body.data.category).toBe('SOCIAL_SKILLS');
    });

    it('should return 404 for non-existent activity', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/activities/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/activities/category/:category', () => {
    it('should get activities by category', async () => {
      const response = await request(app)
        .get('/api/activities/category/SOCIAL_SKILLS')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every((a: any) => a.category === 'SOCIAL_SKILLS')).toBe(true);
    });
  });

  describe('POST /api/activities/session/start', () => {
    it('should start an activity session', async () => {
      const response = await request(app)
        .post('/api/activities/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          childId: childProfileId,
          activityId: activityId,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Session démarrée avec succès');
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('startedAt');
    });

    it('should fail with invalid child ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .post('/api/activities/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          childId: fakeId,
          activityId: activityId,
        })
        .expect(404);
    });

    it('should fail with missing fields', async () => {
      await request(app)
        .post('/api/activities/session/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          childId: childProfileId,
          // Missing activityId
        })
        .expect(400);
    });
  });

  describe('POST /api/activities/session/:sessionId/complete', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Start a session first
      const session = await prisma.activitySession.create({
        data: {
          childId: childProfileId,
          activityId: activityId,
          startTime: new Date(),
          completed: false,
        },
      });
      sessionId = session.id;
    });

    it('should complete an activity session', async () => {
      const response = await request(app)
        .post(`/api/activities/session/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          successRate: 85,
          responses: { question1: 'correct', question2: 'correct' },
          notes: 'Excellente participation',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Session terminée avec succès');
      expect(response.body.data).toHaveProperty('tokensEarned');
    });

    it('should fail with invalid success rate', async () => {
      await request(app)
        .post(`/api/activities/session/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          successRate: 150, // Invalid: > 100
        })
        .expect(400);
    });

    it('should return 404 for non-existent session', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .post(`/api/activities/session/${fakeId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          successRate: 85,
        })
        .expect(404);
    });
  });

  describe('PATCH /api/activities/session/:sessionId', () => {
    let sessionId: string;

    beforeEach(async () => {
      const session = await prisma.activitySession.create({
        data: {
          childId: childProfileId,
          activityId: activityId,
          startTime: new Date(),
          completed: false,
        },
      });
      sessionId = session.id;
    });

    it('should update an activity session', async () => {
      const response = await request(app)
        .patch(`/api/activities/session/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          responses: { question1: 'partial' },
          notes: 'En cours...',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Session mise à jour');
    });
  });
});
