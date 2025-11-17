import request from 'supertest';
import express, { Express } from 'express';
import profileRoutes from '../../routes/profile.routes';
import resourceRoutes from '../../routes/resource.routes';
import authRoutes from '../../routes/auth.routes';
import { prisma, cleanDatabase, createTestUser, teardown } from '../../tests/helpers/testSetup';
import { ServiceFactory } from '../../services';

jest.mock('../../utils/storageClient', () => ({
  storageClient: {
    upload: jest.fn(async () => ({
      url: 'https://storage.example.com/mock-file',
      key: 'mock-key',
      size: 1000,
      contentType: 'image/png',
      provider: 'local',
    })),
  },
}));

describe('Upload Routes', () => {
  let app: Express;
  let authToken: string;
  let userId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/profiles', profileRoutes);
    app.use('/api/resources', resourceRoutes);
    ServiceFactory.initialize(prisma);
  });

  beforeEach(async () => {
    await cleanDatabase();
    const testUser = await createTestUser(app, {
      email: 'upload@example.com',
      password: 'StrongP@ssw0rd',
      name: 'Uploader',
      role: 'PARENT',
    });
    authToken = testUser.token;
    userId = testUser.userId;
    await prisma.childProfile.create({
      data: {
        userId,
        dateOfBirth: new Date('2018-05-15'),
        age: 6,
        avatarUrl: null,
        sensoryPreferences: ['LOW_STIMULATION'],
        developmentLevel: 'Débutant',
        iepGoals: [],
        soundEnabled: true,
        animationsEnabled: true,
        dyslexiaMode: false,
        highContrastMode: false,
        fontSize: 'medium',
      },
    });
  });

  afterAll(async () => {
    await teardown();
  });

  it('uploads an avatar and returns metadata', async () => {
    const response = await request(app)
      .post(`/api/profiles/${userId}/avatar`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('avatar', Buffer.from('fake-avatar'), { filename: 'avatar.png', contentType: 'image/png' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.metadata.url).toContain('storage');
  });

  it('uploads a resource asset', async () => {
    const response = await request(app)
      .post('/api/resources/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .field('title', 'Test resource')
      .attach('resource', Buffer.from('file-contents'), {
        filename: 'resource.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.url).toBeDefined();
  });
});
