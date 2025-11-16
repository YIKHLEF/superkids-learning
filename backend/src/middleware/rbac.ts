import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { auditService } from './audit';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Gère les permissions basées sur les rôles utilisateur
 */

export enum UserRole {
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  EDUCATOR = 'EDUCATOR',
  THERAPIST = 'THERAPIST',
  ADMIN = 'ADMIN',
}

export enum Permission {
  // Profils
  CREATE_PROFILE = 'CREATE_PROFILE',
  READ_PROFILE = 'READ_PROFILE',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  DELETE_PROFILE = 'DELETE_PROFILE',
  READ_ALL_PROFILES = 'READ_ALL_PROFILES',

  // Activités
  START_ACTIVITY = 'START_ACTIVITY',
  COMPLETE_ACTIVITY = 'COMPLETE_ACTIVITY',
  CREATE_ACTIVITY = 'CREATE_ACTIVITY',
  UPDATE_ACTIVITY = 'UPDATE_ACTIVITY',
  DELETE_ACTIVITY = 'DELETE_ACTIVITY',

  // Progrès
  READ_PROGRESS = 'READ_PROGRESS',
  UPDATE_PROGRESS = 'UPDATE_PROGRESS',
  UNLOCK_REWARD = 'UNLOCK_REWARD',

  // Messages
  SEND_MESSAGE = 'SEND_MESSAGE',
  READ_MESSAGE = 'READ_MESSAGE',
  DELETE_MESSAGE = 'DELETE_MESSAGE',

  // Ressources
  READ_RESOURCE = 'READ_RESOURCE',
  CREATE_RESOURCE = 'CREATE_RESOURCE',
  UPDATE_RESOURCE = 'UPDATE_RESOURCE',
  DELETE_RESOURCE = 'DELETE_RESOURCE',
  DOWNLOAD_RESOURCE = 'DOWNLOAD_RESOURCE',

  // Utilisateurs
  CREATE_USER = 'CREATE_USER',
  READ_USER = 'READ_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  ASSIGN_ROLE = 'ASSIGN_ROLE',

  // Admin
  ACCESS_ADMIN_PANEL = 'ACCESS_ADMIN_PANEL',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  MANAGE_PERMISSIONS = 'MANAGE_PERMISSIONS',
}

/**
 * Matrice de permissions par rôle
 */
const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.CHILD]: [
    Permission.READ_PROFILE,
    Permission.START_ACTIVITY,
    Permission.COMPLETE_ACTIVITY,
    Permission.READ_PROGRESS,
    Permission.UNLOCK_REWARD,
    Permission.READ_RESOURCE,
  ],

  [UserRole.PARENT]: [
    Permission.CREATE_PROFILE,
    Permission.READ_PROFILE,
    Permission.UPDATE_PROFILE,
    Permission.READ_ALL_PROFILES,
    Permission.START_ACTIVITY,
    Permission.COMPLETE_ACTIVITY,
    Permission.READ_PROGRESS,
    Permission.UPDATE_PROGRESS,
    Permission.UNLOCK_REWARD,
    Permission.SEND_MESSAGE,
    Permission.READ_MESSAGE,
    Permission.DELETE_MESSAGE,
    Permission.READ_RESOURCE,
    Permission.DOWNLOAD_RESOURCE,
  ],

  [UserRole.EDUCATOR]: [
    Permission.CREATE_PROFILE,
    Permission.READ_PROFILE,
    Permission.UPDATE_PROFILE,
    Permission.READ_ALL_PROFILES,
    Permission.START_ACTIVITY,
    Permission.COMPLETE_ACTIVITY,
    Permission.CREATE_ACTIVITY,
    Permission.UPDATE_ACTIVITY,
    Permission.READ_PROGRESS,
    Permission.UPDATE_PROGRESS,
    Permission.SEND_MESSAGE,
    Permission.READ_MESSAGE,
    Permission.DELETE_MESSAGE,
    Permission.READ_RESOURCE,
    Permission.CREATE_RESOURCE,
    Permission.UPDATE_RESOURCE,
    Permission.DOWNLOAD_RESOURCE,
  ],

  [UserRole.THERAPIST]: [
    Permission.CREATE_PROFILE,
    Permission.READ_PROFILE,
    Permission.UPDATE_PROFILE,
    Permission.READ_ALL_PROFILES,
    Permission.START_ACTIVITY,
    Permission.COMPLETE_ACTIVITY,
    Permission.CREATE_ACTIVITY,
    Permission.UPDATE_ACTIVITY,
    Permission.READ_PROGRESS,
    Permission.UPDATE_PROGRESS,
    Permission.SEND_MESSAGE,
    Permission.READ_MESSAGE,
    Permission.DELETE_MESSAGE,
    Permission.READ_RESOURCE,
    Permission.CREATE_RESOURCE,
    Permission.UPDATE_RESOURCE,
    Permission.DOWNLOAD_RESOURCE,
  ],

  [UserRole.ADMIN]: [
    // Admins ont toutes les permissions
    ...Object.values(Permission),
  ],
};

/**
 * Vérifie si un rôle a une permission spécifique
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return RolePermissions[role]?.includes(permission) || false;
};

/**
 * Middleware pour vérifier les permissions
 * @param permissions - Une ou plusieurs permissions requises
 * @param requireAll - Si true, toutes les permissions doivent être présentes. Si false, au moins une suffit
 */
export const requirePermission = (
  permissions: Permission | Permission[],
  requireAll = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        logger.warn('Unauthorized access attempt - No user in request', {
          path: req.path,
          method: req.method,
        });

        await auditService.logUnauthorizedAccess(
          undefined,
          req.path,
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown'
        );

        return res.status(401).json({
          message: 'Non authentifié',
          statusCode: 401,
        });
      }

      const userRole = user.role as UserRole;
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

      // Vérifier les permissions
      const hasRequiredPermissions = requireAll
        ? requiredPermissions.every((perm) => hasPermission(userRole, perm))
        : requiredPermissions.some((perm) => hasPermission(userRole, perm));

      if (!hasRequiredPermissions) {
        logger.warn('Forbidden access attempt - Insufficient permissions', {
          userId: user.id,
          role: userRole,
          requiredPermissions,
          path: req.path,
        });

        await auditService.logUnauthorizedAccess(
          user.id,
          req.path,
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown'
        );

        return res.status(403).json({
          message: 'Accès refusé - Permissions insuffisantes',
          statusCode: 403,
        });
      }

      next();
    } catch (error) {
      logger.error('Error in permission check', { error });
      return res.status(500).json({
        message: 'Erreur lors de la vérification des permissions',
        statusCode: 500,
      });
    }
  };
};

/**
 * Middleware pour vérifier le rôle
 * @param roles - Un ou plusieurs rôles autorisés
 */
export const requireRole = (roles: UserRole | UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      if (!user) {
        logger.warn('Unauthorized access attempt - No user in request', {
          path: req.path,
        });

        return res.status(401).json({
          message: 'Non authentifié',
          statusCode: 401,
        });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const userRole = user.role as UserRole;

      if (!allowedRoles.includes(userRole)) {
        logger.warn('Forbidden access attempt - Invalid role', {
          userId: user.id,
          role: userRole,
          requiredRoles: allowedRoles,
          path: req.path,
        });

        await auditService.logUnauthorizedAccess(
          user.id,
          req.path,
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown'
        );

        return res.status(403).json({
          message: 'Accès refusé - Rôle insuffisant',
          statusCode: 403,
        });
      }

      next();
    } catch (error) {
      logger.error('Error in role check', { error });
      return res.status(500).json({
        message: 'Erreur lors de la vérification du rôle',
        statusCode: 500,
      });
    }
  };
};

/**
 * Middleware pour vérifier l'ownership des ressources
 * Vérifie si l'utilisateur est le propriétaire de la ressource
 */
export const requireOwnership = (resourceIdParam = 'id', ownerField = 'userId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const resourceId = req.params[resourceIdParam];

      if (!user) {
        return res.status(401).json({
          message: 'Non authentifié',
          statusCode: 401,
        });
      }

      // Les admins peuvent accéder à toutes les ressources
      if (user.role === UserRole.ADMIN) {
        return next();
      }

      // Vérifier l'ownership
      // Note: Cette logique dépend du modèle de données
      // Elle devrait être adaptée selon le contexte
      const isOwner = resourceId === user.id;

      if (!isOwner) {
        logger.warn('Forbidden access attempt - Not resource owner', {
          userId: user.id,
          resourceId,
          path: req.path,
        });

        await auditService.logUnauthorizedAccess(
          user.id,
          req.path,
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown'
        );

        return res.status(403).json({
          message: 'Accès refusé - Vous n\'êtes pas propriétaire de cette ressource',
          statusCode: 403,
        });
      }

      next();
    } catch (error) {
      logger.error('Error in ownership check', { error });
      return res.status(500).json({
        message: 'Erreur lors de la vérification de propriété',
        statusCode: 500,
      });
    }
  };
};

/**
 * Middleware pour vérifier l'accès aux profils enfants
 * Parents, éducateurs et thérapeutes peuvent accéder aux profils qui leur sont associés
 */
export const requireChildAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as any).user;
    const childId = req.params.childId || req.params.id;

    if (!user) {
      return res.status(401).json({
        message: 'Non authentifié',
        statusCode: 401,
      });
    }

    // Les admins ont accès à tous les profils
    if (user.role === UserRole.ADMIN) {
      return next();
    }

    // L'enfant peut accéder à son propre profil
    if (user.id === childId) {
      return next();
    }

    // Note: La logique ci-dessous nécessite une relation dans la DB
    // entre users et child profiles (ex: ChildProfile.authorizedUsers)
    // Pour l'instant, on autorise parents, éducateurs et thérapeutes

    const authorizedRoles = [UserRole.PARENT, UserRole.EDUCATOR, UserRole.THERAPIST];
    if (!authorizedRoles.includes(user.role as UserRole)) {
      logger.warn('Forbidden access to child profile', {
        userId: user.id,
        childId,
        role: user.role,
      });

      return res.status(403).json({
        message: 'Accès refusé au profil enfant',
        statusCode: 403,
      });
    }

    next();
  } catch (error) {
    logger.error('Error in child access check', { error });
    return res.status(500).json({
      message: 'Erreur lors de la vérification d\'accès',
      statusCode: 500,
    });
  }
};
