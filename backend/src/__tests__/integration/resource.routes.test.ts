import request from 'supertest';
import express, { Application } from 'express';
import resourceRoutes from '../../routes/resource.routes';
import authRoutes from '../../routes/auth.routes';
import {
  cleanDatabase,
  teardown,
  prisma,
  createTestUser,
  createTestResource,
} from '../../tests/helpers/testSetup';
import { ServiceFactory } from '../../services';

describe('Resource Routes Integration Tests', () => {
  let app: Application;
  let authToken: string;
  let resourceId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/resources', resourceRoutes);

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

    // Create test resource
    const resource = await createTestResource();
    resourceId = resource.id;
  });

  afterAll(async () => {
    await teardown();
  });

  describe('GET /api/resources', () => {
    beforeEach(async () => {
      // Create multiple resources
      for (let i = 0; i < 5; i++) {
        await prisma.resource.create({
          data: {
            title: `Ressource ${i}`,
            description: `Description ${i}`,
            type: i % 2 === 0 ? 'video' : 'pictogram',
            url: `https://example.com/resource${i}`,
            category: 'Test',
            tags: ['test'],
            language: 'fr',
            ageRange: [5, 10],
          },
        });
      }
    });

    it('should get all resources with pagination', async () => {
      const response = await request(app)
        .get('/api/resources?page=1&limit=3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('pages');
    });

    it('should filter resources by type', async () => {
      const response = await request(app)
        .get('/api/resources?type=video')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every((r: any) => r.type === 'video')).toBe(true);
    });

    it('should filter resources by category', async () => {
      const response = await request(app)
        .get('/api/resources?category=Émotions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every((r: any) => r.category === 'Émotions')).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/api/resources').expect(401);
    });
  });

  describe('GET /api/resources/type/:type', () => {
    beforeEach(async () => {
      await prisma.resource.create({
        data: {
          title: 'Pictogramme test',
          description: 'Test',
          type: 'pictogram',
          url: 'https://example.com/pic',
          category: 'Test',
          tags: ['test'],
          language: 'fr',
          ageRange: [5, 10],
        },
      });
    });

    it('should get resources by type', async () => {
      const response = await request(app)
        .get('/api/resources/type/pictogram')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every((r: any) => r.type === 'pictogram')).toBe(true);
    });

    it('should return empty array for type with no resources', async () => {
      const response = await request(app)
        .get('/api/resources/type/guide')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/resources/search', () => {
    beforeEach(async () => {
      await prisma.resource.create({
        data: {
          title: 'Émotions de base',
          description: 'Comprendre la joie et la tristesse',
          type: 'video',
          url: 'https://example.com/emotions',
          category: 'Émotions',
          tags: ['émotions', 'joie', 'tristesse'],
          language: 'fr',
          ageRange: [5, 8],
        },
      });
    });

    it('should search resources by query', async () => {
      const response = await request(app)
        .get('/api/resources/search?q=émotions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('count');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should search with type filter', async () => {
      const response = await request(app)
        .get('/api/resources/search?q=émotions&type=video')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.every((r: any) => r.type === 'video')).toBe(true);
    });

    it('should return empty results for non-matching query', async () => {
      const response = await request(app)
        .get('/api/resources/search?q=nonexistent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should fail without search query', async () => {
      await request(app)
        .get('/api/resources/search')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('GET /api/resources/:id', () => {
    it('should get resource by ID', async () => {
      const response = await request(app)
        .get(`/api/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(resourceId);
      expect(response.body.data.title).toBe('Vidéo sur les émotions');
      expect(response.body.data.type).toBe('video');
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/api/resources/${resourceId}`).expect(401);
    });

    it('should return 404 for non-existent resource', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app)
        .get(`/api/resources/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
