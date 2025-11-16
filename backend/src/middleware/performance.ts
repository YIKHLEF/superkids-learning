import compression from 'compression';
import { Request, Response, NextFunction, Express } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware de Performance
 * Configure la compression et le monitoring des performances
 */

/**
 * Configure la compression gzip pour les réponses
 */
export const compressionMiddleware = compression({
  // Ne compresser que les réponses > 1KB
  threshold: 1024,

  // Fonction de filtrage pour décider quoi compresser
  filter: (req: Request, res: Response) => {
    // Ne pas compresser si le client ne supporte pas
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Utiliser le filtre par défaut de compression
    return compression.filter(req, res);
  },

  // Niveau de compression (0-9, 6 par défaut)
  level: 6,
});

/**
 * Middleware pour mesurer le temps de réponse
 */
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Capturer la fin de la réponse
  res.on('finish', () => {
    const duration = Date.now() - start;

    // Logger les requêtes lentes (> 1s)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }

    // Ajouter le header X-Response-Time
    res.setHeader('X-Response-Time', `${duration}ms`);
  });

  next();
};

/**
 * Middleware pour ajouter des headers de cache
 */
export const cacheControlMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Par défaut, pas de cache pour les API
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  // Pour certains endpoints, permettre le cache
  if (req.method === 'GET') {
    // Ressources statiques peuvent être cachées
    if (req.path.startsWith('/api/resources') && req.path.match(/\.(jpg|jpeg|png|gif|svg|pdf)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h
    }

    // Activities peuvent être cachées brièvement
    if (req.path.startsWith('/api/activities') && !req.path.includes('/session')) {
      res.setHeader('Cache-Control', 'private, max-age=300'); // 5 min
    }
  }

  next();
};

/**
 * Middleware pour limiter la taille des payloads
 */
export const payloadSizeLimit = (maxSizeInMB: number = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (contentLength > maxSizeInBytes) {
      logger.warn('Payload too large', {
        contentLength,
        maxSize: maxSizeInBytes,
        path: req.path,
      });

      return res.status(413).json({
        message: `Payload trop volumineux. Maximum: ${maxSizeInMB}MB`,
        statusCode: 413,
      });
    }

    next();
  };
};

/**
 * Middleware pour détecter et logger les fuites mémoire potentielles
 */
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  const memBefore = process.memoryUsage();

  res.on('finish', () => {
    const memAfter = process.memoryUsage();
    const heapDelta = memAfter.heapUsed - memBefore.heapUsed;

    // Logger si augmentation significative (> 50MB)
    if (heapDelta > 50 * 1024 * 1024) {
      logger.warn('Significant memory increase detected', {
        heapDelta: `${(heapDelta / 1024 / 1024).toFixed(2)}MB`,
        path: req.path,
        method: req.method,
      });
    }
  });

  next();
};

/**
 * Statistiques de performance
 */
interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  slowRequests: number;
  errorCount: number;
}

const stats: PerformanceStats = {
  totalRequests: 0,
  averageResponseTime: 0,
  slowRequests: 0,
  errorCount: 0,
};

/**
 * Middleware pour collecter des statistiques
 */
export const statsCollector = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    stats.totalRequests++;
    stats.averageResponseTime =
      (stats.averageResponseTime * (stats.totalRequests - 1) + duration) / stats.totalRequests;

    if (duration > 1000) {
      stats.slowRequests++;
    }

    if (res.statusCode >= 400) {
      stats.errorCount++;
    }
  });

  next();
};

/**
 * Récupère les statistiques de performance
 */
export const getPerformanceStats = (): PerformanceStats => {
  return { ...stats };
};

/**
 * Réinitialise les statistiques
 */
export const resetPerformanceStats = (): void => {
  stats.totalRequests = 0;
  stats.averageResponseTime = 0;
  stats.slowRequests = 0;
  stats.errorCount = 0;
};

/**
 * Configure tous les middlewares de performance sur l'app
 */
export const configurePerformance = (app: Express): void => {
  // Compression gzip
  app.use(compressionMiddleware);

  // Mesure du temps de réponse
  app.use(responseTimeMiddleware);

  // Cache control
  app.use(cacheControlMiddleware);

  // Limite de taille de payload (10MB par défaut)
  app.use(payloadSizeLimit(10));

  // Monitoring mémoire (seulement en développement)
  if (process.env.NODE_ENV === 'development') {
    app.use(memoryMonitor);
  }

  // Collecte de stats
  app.use(statsCollector);

  logger.info('Performance middlewares configured');
};
