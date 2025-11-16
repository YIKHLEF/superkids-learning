import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Simulé - à remplacer par Prisma Client
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      throw new AppError('Tous les champs sont requis', 400);
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur (à implémenter avec Prisma)
    const user = {
      id: 'generated-id',
      email,
      name,
      role,
      password: hashedPassword,
    };

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email et mot de passe requis', 400);
    }

    // Recherche de l'utilisateur (à implémenter avec Prisma)
    // const user = await prisma.user.findUnique({ where: { email } });

    const user = {
      id: 'user-id',
      email,
      password: await bcrypt.hash('password', 10),
      role: 'CHILD',
    };

    if (!user) {
      throw new AppError('Identifiants incorrects', 401);
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Identifiants incorrects', 401);
    }

    // Génération du token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      status: 'success',
      data: {
        userId: user.id,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Déconnexion réussie',
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  // À implémenter avec middleware d'authentification
  res.json({
    status: 'success',
    data: {
      user: {
        id: 'user-id',
        email: 'user@example.com',
        name: 'User Name',
        role: 'CHILD',
      },
    },
  });
};
