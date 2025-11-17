import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Rate Limiter Granulaire par Type d'Endpoint
 * Applique des limites différentes selon le niveau de sensibilité
 */

// Rate limiter général - endpoints publics
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: 'Trop de requêtes de cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter strict pour authentification
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion par 15 minutes
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les opérations d'écriture sensibles
export const writeOperationsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 opérations d'écriture par 10 minutes
  message: 'Trop d\'opérations d\'écriture, veuillez ralentir.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Utiliser l'userId si disponible, sinon l'IP
    return (req as any).user?.id || req.ip || 'unknown';
  },
});

// Rate limiter pour les uploads de fichiers
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 uploads par heure
  message: 'Trop d\'uploads de fichiers, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.id || req.ip || 'unknown';
  },
});

// Rate limiter pour les endpoints de recherche
export const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 recherches par 5 minutes
  message: 'Trop de recherches, veuillez ralentir.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter pour les endpoints de messagerie
export const messagingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 40, // 40 messages par 10 minutes
  message: 'Trop de messages envoyés, veuillez ralentir.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.id || req.ip || 'unknown';
  },
});

// Rate limiter pour les endpoints d'API admin
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requêtes par 15 minutes pour les admins
  message: 'Limite de requêtes admin atteinte.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip pour les super admins si nécessaire
    return (req as any).user?.role === 'SUPER_ADMIN';
  },
});

// Rate limiter pour les opérations de suppression
export const deleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 suppressions par heure maximum
  message: 'Trop d\'opérations de suppression, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.id || req.ip || 'unknown';
  },
});

// Rate limiter pour les endpoints de progrès/analytics
export const analyticsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // 60 requêtes d'analytics par 10 minutes
  message: 'Trop de requêtes d\'analytics, veuillez ralentir.',
  standardHeaders: true,
  legacyHeaders: false,
});
