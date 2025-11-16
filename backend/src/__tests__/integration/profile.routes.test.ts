import request from 'supertest';
import express, { Application } from 'express';
import profileRoutes from '../../routes/profile.routes';
import authRoutes from '../../routes/auth.routes';
import {
  cleanDatabase,
  teardown,
  prisma,
  createTestUser,
  createTestChildProfile,
} from '../../tests/helpers/testSetup';
import { ServiceFactory } from '../../services';

describe('Profile Routes Integration Tests', () => {
  let app: Application;
  let authToken: string;
  let userId: string;
  let childProfileId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/profiles', profileRoutes);

    ServiceFactory.initialize(prisma);
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Create test user and get token
    const testUser = await createTestUser(app, {
      email: 'parent@example.com',
      password: 'SecureP@ssw0rd',
      name: 'Parent Test',
      role: 'PARENT',
    });

    authToken = testUser.token;
    userId = testUser.userId;

    // Create test child profile
    const profile = await createTestChildProfile(app, authToken, userId);
    childProfileId = profile.id;
  });

  afterAll(async () => {
    await teardown();
  });

  describe('GET /api/profiles/:id', () => {
    it('should get a child profile by ID', async () => {
      const response = await request(app)
        .get(`/api/profiles/${childProfileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(childProfileId);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.sensoryPreferences).toContain('LOW_STIMULATION');
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/api/profiles/${childProfileId}`).expect(401);
    });

    it('should return 404 for non-existent profile', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/profiles/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/profiles/:id', () => {
    it('should update a child profile', async () => {
      const updateData = {
        developmentLevel: 'Avancé',
        iepGoals: ['Autonomie complète', 'Communication fluide'],
      };

      const response = await request(app)
        .put(`/api/profiles/${childProfileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Profil mis à jour avec succès');
      expect(response.body.data.developmentLevel).toBe('Avancé');
      expect(response.body.data.iepGoals).toEqual(updateData.iepGoals);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .put(`/api/profiles/${childProfileId}`)
        .send({ developmentLevel: 'Avancé' })
        .expect(401);
    });

    it('should return 404 for non-existent profile', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .put(`/api/profiles/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ developmentLevel: 'Avancé' })
        .expect(404);
    });
  });

  describe('PATCH /api/profiles/:id/preferences', () => {
    it('should update sensory preferences', async () => {
      const preferences = {
        sensoryPreferences: ['HIGH_CONTRAST', 'MONOCHROME'],
        soundEnabled: true,
        dyslexiaMode: true,
        fontSize: 'large',
      };

      const response = await request(app)
        .patch(`/api/profiles/${childProfileId}/preferences`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferences)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Préférences mises à jour avec succès');
      expect(response.body.data.sensoryPreferences).toEqual(['HIGH_CONTRAST', 'MONOCHROME']);
      expect(response.body.data.soundEnabled).toBe(true);
      expect(response.body.data.dyslexiaMode).toBe(true);
      expect(response.body.data.fontSize).toBe('large');
    });

    it('should update partial preferences', async () => {
      const response = await request(app)
        .patch(`/api/profiles/${childProfileId}/preferences`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ highContrastMode: false })
        .expect(200);

      expect(response.body.data.highContrastMode).toBe(false);
      // Other preferences should remain unchanged
      expect(response.body.data.sensoryPreferences).toContain('LOW_STIMULATION');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .patch(`/api/profiles/${childProfileId}/preferences`)
        .send({ soundEnabled: false })
        .expect(401);
    });
  });

  describe('GET /api/profiles/children/all', () => {
    it('should get all child profiles for authenticated user', async () => {
      // Create additional child profile
      await createTestChildProfile(app, authToken, userId);

      const response = await request(app)
        .get('/api/profiles/children/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('userId');
    });

    it('should return empty array if user has no child profiles', async () => {
      // Create new user with no profiles
      const newUser = await createTestUser(app, {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
        role: 'PARENT',
      });

      const response = await request(app)
        .get('/api/profiles/children/all')
        .set('Authorization', `Bearer ${newUser.token}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/api/profiles/children/all').expect(401);
    });
  });
});
