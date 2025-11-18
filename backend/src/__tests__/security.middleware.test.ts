import request from 'supertest';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { authLimiter } from '../middleware/rateLimiter';

const buildApp = (): Application => {
  const app = express();
  app.use(express.json());
  return app;
};

describe('Security middleware hardening', () => {
  it('applies Helmet security headers by default', async () => {
    const app = buildApp();
    app.use(helmet());
    app.get('/secure', (_req, res) => res.send('ok'));

    const response = await request(app).get('/secure');

    expect(response.headers['x-dns-prefetch-control']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  it('allows only whitelisted CORS origins', async () => {
    const app = buildApp();
    app.use(
      cors({
        origin: 'http://localhost:3000',
        credentials: true,
      })
    );
    app.get('/cors', (_req, res) => res.send('ok'));

    const allowed = await request(app)
      .get('/cors')
      .set('Origin', 'http://localhost:3000')
      .expect(200);

    const denied = await request(app)
      .get('/cors')
      .set('Origin', 'http://evil.com')
      .expect(200);

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('throttles repeated authentication attempts with the rate limiter', async () => {
    const app = buildApp();
    app.post('/login', authLimiter, (_req, res) =>
      res.status(401).json({ message: 'Échec de connexion simulé' })
    );

    const agent = request(app);

    for (let i = 0; i < 5; i++) {
      await agent.post('/login').send({}).expect(401);
    }

    const blocked = await agent.post('/login').send({}).expect(429);
    expect(blocked.text).toContain('Trop de tentatives de connexion');
  });
});
