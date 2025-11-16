import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import swaggerUi from 'swagger-ui-express';

// Routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import activityRoutes from './routes/activity.routes';
import progressRoutes from './routes/progress.routes';
import resourceRoutes from './routes/resource.routes';
import messageRoutes from './routes/message.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Services
import { SocketService } from './services/socket.service';
import { ServiceFactory } from './services';

// Types Socket.io
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './types/socket.types';

// Swagger configuration
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// Initialiser Prisma
const prisma = new PrismaClient();

// Configurer Socket.io avec types
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialiser le service Socket.io
const socketService = new SocketService(io, prisma);

// Initialiser ServiceFactory avec Prisma
ServiceFactory.initialize(prisma);

// Configuration des middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Documentation Swagger
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SuperKids Learning API Documentation',
  })
);

// Endpoint pour obtenir le JSON OpenAPI
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes de santé
/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Vérifier l'état de l'API
 *     description: Retourne l'état de santé de l'API
 *     responses:
 *       200:
 *         description: API opérationnelle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: SuperKids Learning API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SuperKids Learning API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @openapi
 * /health/socket:
 *   get:
 *     tags:
 *       - Health
 *     summary: Vérifier l'état de Socket.io
 *     description: Retourne le nombre d'utilisateurs connectés via WebSocket
 *     responses:
 *       200:
 *         description: Informations sur les connexions Socket.io
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 onlineUsers:
 *                   type: integer
 *                   example: 12
 *                 users:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["user_123", "user_456"]
 */
app.get('/health/socket', (req, res) => {
  res.json({
    status: 'OK',
    onlineUsers: socketService.getOnlineUsers().length,
    users: socketService.getOnlineUsers(),
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);

// Gestion des erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`📄 OpenAPI Spec: http://localhost:${PORT}/api-docs.json`);
  logger.info(`🔌 Socket.io initialized and ready`);
  logger.info(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server...');
  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing server...');
  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
});

export { io, socketService, prisma };
