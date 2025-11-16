import request from 'supertest';
import express, { Application } from 'express';
import authRoutes from '../../routes/auth.routes';
import { cleanDatabase, teardown, prisma } from '../../tests/helpers/testSetup';
import { ServiceFactory } from '../../services';

describe('Authentication Routes Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Initialize ServiceFactory
    ServiceFactory.initialize(prisma);
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await teardown();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd',
        name: 'Test User',
        role: 'PARENT',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Utilisateur créé avec succès');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail to register with existing email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecureP@ssw0rd',
        name: 'Test User',
        role: 'PARENT',
      };

      // First registration
      await request(app).post('/api/auth/register').send(userData).expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail to register with missing fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd',
        // Missing name and role
      };

      await request(app).post('/api/auth/register').send(incompleteData).expect(400);
    });

    it('should fail to register with invalid email', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecureP@ssw0rd',
        name: 'Test User',
        role: 'PARENT',
      };

      await request(app).post('/api/auth/register').send(invalidData).expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'SecureP@ssw0rd',
        name: 'Login Test',
        role: 'PARENT',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecureP@ssw0rd',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connexion réussie');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('login@example.com');
    });

    it('should fail to login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecureP@ssw0rd',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail to login with missing fields', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          // Missing password
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app).post('/api/auth/logout').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Déconnexion réussie');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile with valid token', async () => {
      // Register and login
      const registerResponse = await request(app).post('/api/auth/register').send({
        email: 'me@example.com',
        password: 'SecureP@ssw0rd',
        name: 'Me Test',
        role: 'EDUCATOR',
      });

      const token = registerResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('me@example.com');
      expect(response.body.data.name).toBe('Me Test');
      expect(response.body.data.role).toBe('EDUCATOR');
    });

    it('should fail without authorization token', async () => {
      await request(app).get('/api/auth/me').expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
