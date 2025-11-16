import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Token d\'authentification requis', 401);
    }

    const secret = process.env.JWT_SECRET || 'secret';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        throw new AppError('Token invalide ou expiré', 403);
      }

      req.user = decoded as { userId: string; role: string };
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Non autorisé', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`,
        403
      );
    }

    next();
  };
};
