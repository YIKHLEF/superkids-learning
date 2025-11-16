import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par fenêtre
  message: 'Trop de requêtes de cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives de connexion par 15 minutes
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
  skipSuccessfulRequests: true,
});
