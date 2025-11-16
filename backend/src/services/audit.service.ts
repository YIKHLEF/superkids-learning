import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Service d'Audit Logging
 * Enregistre toutes les actions sensibles pour la conformité et la sécurité
 */

export enum AuditAction {
  // Authentification
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  FAILED_LOGIN = 'FAILED_LOGIN',

  // Profils
  PROFILE_CREATE = 'PROFILE_CREATE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  PROFILE_DELETE = 'PROFILE_DELETE',
  PROFILE_VIEW = 'PROFILE_VIEW',

  // Activités
  ACTIVITY_START = 'ACTIVITY_START',
  ACTIVITY_COMPLETE = 'ACTIVITY_COMPLETE',
  ACTIVITY_CREATE = 'ACTIVITY_CREATE',
  ACTIVITY_UPDATE = 'ACTIVITY_UPDATE',
  ACTIVITY_DELETE = 'ACTIVITY_DELETE',

  // Progrès
  PROGRESS_UPDATE = 'PROGRESS_UPDATE',
  REWARD_UNLOCK = 'REWARD_UNLOCK',

  // Messages
  MESSAGE_SEND = 'MESSAGE_SEND',
  MESSAGE_READ = 'MESSAGE_READ',
  MESSAGE_DELETE = 'MESSAGE_DELETE',

  // Ressources
  RESOURCE_CREATE = 'RESOURCE_CREATE',
  RESOURCE_UPDATE = 'RESOURCE_UPDATE',
  RESOURCE_DELETE = 'RESOURCE_DELETE',
  RESOURCE_DOWNLOAD = 'RESOURCE_DOWNLOAD',

  // Upload
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DELETE = 'FILE_DELETE',

  // Admin
  ADMIN_ACTION = 'ADMIN_ACTION',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',

  // Sécurité
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  targetId?: string;
  targetType?: string;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export class AuditService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Enregistre une action dans le log d'audit
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Log dans Winston pour monitoring immédiat
      const logLevel =
        entry.severity === AuditSeverity.CRITICAL || entry.severity === AuditSeverity.ERROR
          ? 'error'
          : entry.severity === AuditSeverity.WARNING
          ? 'warn'
          : 'info';

      logger[logLevel]('Audit Log', {
        action: entry.action,
        userId: entry.userId,
        targetId: entry.targetId,
        severity: entry.severity,
        success: entry.success,
        ...entry.metadata,
      });

      // Enregistrer dans la base de données pour historique
      // Note: Nécessite une table AuditLog dans Prisma schema
      // await this.prisma.auditLog.create({
      //   data: {
      //     action: entry.action,
      //     userId: entry.userId,
      //     targetId: entry.targetId,
      //     targetType: entry.targetType,
      //     severity: entry.severity,
      //     ipAddress: entry.ipAddress,
      //     userAgent: entry.userAgent,
      //     metadata: entry.metadata || {},
      //     success: entry.success,
      //     errorMessage: entry.errorMessage,
      //     timestamp: new Date(),
      //   },
      // });
    } catch (error) {
      // Ne pas faire échouer la requête si l'audit logging échoue
      logger.error('Failed to write audit log', { error, entry });
    }
  }

  /**
   * Log une tentative de connexion réussie
   */
  async logSuccessfulLogin(userId: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.log({
      action: AuditAction.USER_LOGIN,
      userId,
      severity: AuditSeverity.INFO,
      ipAddress,
      userAgent,
      success: true,
    });
  }

  /**
   * Log une tentative de connexion échouée
   */
  async logFailedLogin(email: string, ipAddress: string, userAgent: string, reason: string): Promise<void> {
    await this.log({
      action: AuditAction.FAILED_LOGIN,
      severity: AuditSeverity.WARNING,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: reason,
      metadata: { email },
    });
  }

  /**
   * Log un changement de mot de passe
   */
  async logPasswordChange(userId: string, ipAddress: string): Promise<void> {
    await this.log({
      action: AuditAction.PASSWORD_CHANGE,
      userId,
      severity: AuditSeverity.INFO,
      ipAddress,
      success: true,
    });
  }

  /**
   * Log un accès non autorisé
   */
  async logUnauthorizedAccess(
    userId: string | undefined,
    resource: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.UNAUTHORIZED_ACCESS,
      userId,
      severity: AuditSeverity.WARNING,
      ipAddress,
      userAgent,
      success: false,
      metadata: { resource },
    });
  }

  /**
   * Log une action admin
   */
  async logAdminAction(
    userId: string,
    action: string,
    targetId: string,
    metadata: Record<string, any>,
    ipAddress: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.ADMIN_ACTION,
      userId,
      targetId,
      severity: AuditSeverity.INFO,
      ipAddress,
      success: true,
      metadata: { action, ...metadata },
    });
  }

  /**
   * Log une suppression de données
   */
  async logDataDeletion(
    userId: string,
    targetType: string,
    targetId: string,
    ipAddress: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.PROFILE_DELETE,
      userId,
      targetId,
      targetType,
      severity: AuditSeverity.WARNING,
      ipAddress,
      success: true,
    });
  }

  /**
   * Log une activité suspecte
   */
  async logSuspiciousActivity(
    userId: string | undefined,
    description: string,
    ipAddress: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      userId,
      severity: AuditSeverity.CRITICAL,
      ipAddress,
      success: false,
      errorMessage: description,
      metadata,
    });
  }

  /**
   * Log un dépassement de rate limit
   */
  async logRateLimitExceeded(
    userId: string | undefined,
    endpoint: string,
    ipAddress: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.RATE_LIMIT_EXCEEDED,
      userId,
      severity: AuditSeverity.WARNING,
      ipAddress,
      success: false,
      metadata: { endpoint },
    });
  }

  /**
   * Récupère les logs d'audit pour un utilisateur
   */
  async getUserAuditLogs(userId: string, limit = 100): Promise<any[]> {
    try {
      // Note: Nécessite une table AuditLog dans Prisma schema
      // return await this.prisma.auditLog.findMany({
      //   where: { userId },
      //   orderBy: { timestamp: 'desc' },
      //   take: limit,
      // });
      return [];
    } catch (error) {
      logger.error('Failed to retrieve audit logs', { error, userId });
      return [];
    }
  }

  /**
   * Récupère les activités suspectes récentes
   */
  async getSuspiciousActivities(limit = 50): Promise<any[]> {
    try {
      // Note: Nécessite une table AuditLog dans Prisma schema
      // return await this.prisma.auditLog.findMany({
      //   where: {
      //     OR: [
      //       { action: AuditAction.SUSPICIOUS_ACTIVITY },
      //       { action: AuditAction.UNAUTHORIZED_ACCESS },
      //       { severity: AuditSeverity.CRITICAL },
      //     ],
      //   },
      //   orderBy: { timestamp: 'desc' },
      //   take: limit,
      // });
      return [];
    } catch (error) {
      logger.error('Failed to retrieve suspicious activities', { error });
      return [];
    }
  }

  /**
   * Nettoie les anciens logs (GDPR compliance)
   */
  async cleanOldLogs(daysToKeep = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // Note: Nécessite une table AuditLog dans Prisma schema
      // const result = await this.prisma.auditLog.deleteMany({
      //   where: {
      //     timestamp: {
      //       lt: cutoffDate,
      //     },
      //   },
      // });

      // logger.info(`Cleaned ${result.count} old audit logs`);
      // return result.count;
      return 0;
    } catch (error) {
      logger.error('Failed to clean old audit logs', { error });
      return 0;
    }
  }
}
