import { Request, Response, NextFunction } from 'express';
import { AuditService, AuditAction, AuditSeverity } from '../services/audit.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const auditService = new AuditService(prisma);

/**
 * Middleware d'Audit pour tracer les actions sensibles
 */

/**
 * Extrait l'adresse IP de la requête
 */
const getIpAddress = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

/**
 * Extrait le User-Agent de la requête
 */
const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Middleware générique d'audit
 */
export const auditLog = (
  action: AuditAction,
  severity: AuditSeverity = AuditSeverity.INFO,
  metadataBuilder?: (req: Request, res: Response) => Record<string, any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();

    res.on('finish', () => {
      const userId = (req as any).user?.id || (req as any).user?.userId;
      const ipAddress = getIpAddress(req);
      const userAgent = getUserAgent(req);
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const resolvedSeverity = success ? severity : AuditSeverity.WARNING;

      const baseMetadata = {
        path: req.originalUrl || req.path,
        method: req.method,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      };

      const extraMetadata = metadataBuilder ? metadataBuilder(req, res) : {};

      auditService
        .log({
          action,
          userId,
          severity: resolvedSeverity,
          ipAddress,
          userAgent,
          success,
          metadata: { ...baseMetadata, ...extraMetadata },
        })
        .catch((error) => {
          // Ne pas bloquer la requête en cas d'erreur d'audit
          console.error('Audit log error:', error);
        });
    });

    next();
  };
};

/**
 * Middleware pour logger les accès non autorisés
 */
export const logUnauthorizedAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const userId = (req as any).user?.id;
  const ipAddress = getIpAddress(req);
  const userAgent = getUserAgent(req);

  await auditService.logUnauthorizedAccess(userId, req.path, ipAddress, userAgent);

  next();
};

/**
 * Middleware pour logger les tentatives de connexion échouées
 */
export const logFailedLoginAttempt = (email: string, reason: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    await auditService.logFailedLogin(email, ipAddress, userAgent, reason);

    next();
  };
};

/**
 * Export du service d'audit pour utilisation directe
 */
export { auditService };
