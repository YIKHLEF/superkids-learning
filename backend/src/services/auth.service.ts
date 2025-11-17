import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterDTO, LoginDTO, UserWithToken, AppError } from '../types';
import { logger } from '../utils/logger';

export class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  /**
   * Enregistrer un nouvel utilisateur
   */
  async register(userData: RegisterDTO): Promise<UserWithToken> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new AppError('Un utilisateur avec cet email existe déjà', 409);
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Créer l'utilisateur
      const user = await this.prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      // Générer le token JWT
      const token = this.generateToken(user.id);

      logger.info(`Nouvel utilisateur enregistré: ${user.email}`);

      return {
        user,
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de l\'enregistrement:', error);
      throw new AppError('Erreur lors de l\'enregistrement', 500);
    }
  }

  /**
   * Connecter un utilisateur
   */
  async login(credentials: LoginDTO): Promise<UserWithToken> {
    try {
      // Trouver l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new AppError('Email ou mot de passe incorrect', 401);
      }

      // Générer le token JWT
      const token = this.generateToken(user.id);

      logger.info(`Utilisateur connecté: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors de la connexion:', error);
      throw new AppError('Erreur lors de la connexion', 500);
    }
  }

  /**
   * Valider un token JWT
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: string };

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      return user;
    } catch (error) {
      logger.error('Token invalide:', error);
      return null;
    }
  }

  /**
   * Obtenir l'utilisateur actuel depuis le token
   */
  async getCurrentUser(userId: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        },
      });

      return user;
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw new AppError('Utilisateur introuvable', 404);
    }
  }

  /**
   * Déconnecter un utilisateur
   * Note: Avec JWT, la déconnexion est principalement côté client
   * Ici on peut ajouter une liste noire de tokens si nécessaire
   */
  async logout(userId: string): Promise<void> {
    logger.info(`Utilisateur déconnecté: ${userId}`);
    // Implémentation future: ajouter le token à une liste noire Redis
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Pour des raisons de sécurité, on ne révèle pas si l'email existe
        logger.info(`Tentative de reset pour email inexistant: ${email}`);
        return;
      }

      // TODO: Générer un token de reset et envoyer un email
      // Pour l'instant, on log juste l'action
      logger.info(`Reset password demandé pour: ${email}`);

      // Implémentation future:
      // 1. Générer un token de reset avec expiration
      // 2. Envoyer un email avec le lien de reset
      // 3. Stocker le token dans Redis avec TTL
    } catch (error) {
      logger.error('Erreur lors du reset password:', error);
      throw new AppError('Erreur lors du reset password', 500);
    }
  }

  /**
   * Changer le mot de passe d'un utilisateur
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError('Utilisateur introuvable', 404);
      }

      // Vérifier l'ancien mot de passe
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        throw new AppError('Mot de passe actuel incorrect', 401);
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      logger.info(`Mot de passe changé pour l'utilisateur: ${userId}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Erreur lors du changement de mot de passe:', error);
      throw new AppError('Erreur lors du changement de mot de passe', 500);
    }
  }

  /**
   * Générer un token JWT
   */
  private generateToken(userId: string): string {
    return (jwt as any).sign(
      { userId },
      this.jwtSecret as jwt.Secret,
      { expiresIn: this.jwtExpiresIn }
    ) as string;
  }
}
