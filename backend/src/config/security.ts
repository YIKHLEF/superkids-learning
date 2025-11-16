import helmet from 'helmet';
import { Express } from 'express';

/**
 * Configuration Avancée des Headers de Sécurité HTTP
 * Protège l'application contre les vulnérabilités courantes
 */

export const configureSecurityHeaders = (app: Express) => {
  // Configuration Helmet avec options personnalisées
  app.use(
    helmet({
      // Content Security Policy (CSP)
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },

      // DNS Prefetch Control - Désactive le DNS prefetching
      dnsPrefetchControl: {
        allow: false,
      },

      // Expect-CT - Certificate Transparency
      expectCt: {
        maxAge: 86400, // 24 heures
        enforce: true,
      },

      // Frameguard - Protège contre le clickjacking
      frameguard: {
        action: 'deny',
      },

      // Hide Powered By - Cache l'en-tête X-Powered-By
      hidePoweredBy: true,

      // HSTS - HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 an
        includeSubDomains: true,
        preload: true,
      },

      // IE No Open - Force le téléchargement de fichiers non-exécutables
      ieNoOpen: true,

      // No Sniff - Empêche le browser de deviner le MIME type
      noSniff: true,

      // Origin Agent Cluster - Isole les origines
      originAgentCluster: true,

      // Permitted Cross-Domain Policies
      permittedCrossDomainPolicies: {
        permittedPolicies: 'none',
      },

      // Referrer Policy - Contrôle les informations de référence
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },

      // XSS Filter - Protection XSS pour les anciens navigateurs
      xssFilter: true,
    })
  );

  // Headers de sécurité additionnels personnalisés
  app.use((req, res, next) => {
    // Désactiver la mise en cache pour les endpoints sensibles
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }

    // Feature Policy / Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );

    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options (backup pour Helmet)
    res.setHeader('X-Frame-Options', 'DENY');

    // X-XSS-Protection (backup pour Helmet)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Cross-Origin-Embedder-Policy
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    // Cross-Origin-Opener-Policy
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    // Cross-Origin-Resource-Policy
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    next();
  });
};

/**
 * Configuration CORS Sécurisée
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Liste blanche des origines autorisées
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
    ];

    // Autoriser les requêtes sans origine (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 heures
};

/**
 * Middleware de protection contre l'injection SQL
 * Note: Prisma ORM fournit déjà une protection, ceci est une couche additionnelle
 */
export const sqlInjectionProtection = (req: any, res: any, next: any) => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL meta-characters
    /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|SCRIPT)\b)/i, // SQL keywords
  ];

  const checkForSqlInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return sqlInjectionPatterns.some((pattern) => pattern.test(obj));
    }
    if (Array.isArray(obj)) {
      return obj.some(checkForSqlInjection);
    }
    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(checkForSqlInjection);
    }
    return false;
  };

  if (
    checkForSqlInjection(req.body) ||
    checkForSqlInjection(req.query) ||
    checkForSqlInjection(req.params)
  ) {
    return res.status(400).json({
      message: 'Requête invalide détectée',
      statusCode: 400,
    });
  }

  next();
};

/**
 * Middleware de protection contre NoSQL injection
 */
export const noSqlInjectionProtection = (req: any, res: any, next: any) => {
  const checkForNoSqlInjection = (obj: any): boolean => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        // Bloquer les opérateurs MongoDB/NoSQL
        if (key.startsWith('$')) {
          return true;
        }
        if (checkForNoSqlInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (
    checkForNoSqlInjection(req.body) ||
    checkForNoSqlInjection(req.query) ||
    checkForNoSqlInjection(req.params)
  ) {
    return res.status(400).json({
      message: 'Requête invalide détectée',
      statusCode: 400,
    });
  }

  next();
};

/**
 * Middleware de protection contre XSS
 * Nettoie les inputs des scripts malveillants
 */
export const xssProtection = (req: any, res: any, next: any) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers comme onclick=
  ];

  const cleanXss = (obj: any): any => {
    if (typeof obj === 'string') {
      let cleaned = obj;
      xssPatterns.forEach((pattern) => {
        cleaned = cleaned.replace(pattern, '');
      });
      return cleaned;
    }
    if (Array.isArray(obj)) {
      return obj.map(cleanXss);
    }
    if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        cleaned[key] = cleanXss(obj[key]);
      }
      return cleaned;
    }
    return obj;
  };

  req.body = cleanXss(req.body);
  req.query = cleanXss(req.query);
  req.params = cleanXss(req.params);

  next();
};
