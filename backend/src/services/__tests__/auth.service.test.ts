import { AuthService } from '../auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../types';

// Mock Prisma Client
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'PARENT' as any,
      };

      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: '123',
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      mockedJwt.sign.mockReturnValue('mock_token' as never);

      const result = await authService.register(registerData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(registerData.email);
    });

    it('devrait échouer si l\'email existe déjà', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'PARENT' as any,
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        email: registerData.email,
      });

      await expect(authService.register(registerData)).rejects.toThrow(
        AppError
      );
      await expect(authService.register(registerData)).rejects.toThrow(
        'Un utilisateur avec cet email existe déjà'
      );
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '123',
        email: loginData.email,
        password: 'hashed_password',
        name: 'Test User',
        role: 'PARENT',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue('mock_token' as never);

      const result = await authService.login(loginData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        mockUser.password
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(loginData.email);
    });

    it('devrait échouer avec un email invalide', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow(
        'Email ou mot de passe incorrect'
      );
    });

    it('devrait échouer avec un mot de passe incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: '123',
        email: loginData.email,
        password: 'hashed_password',
        name: 'Test User',
        role: 'PARENT',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow(
        'Email ou mot de passe incorrect'
      );
    });
  });

  describe('validateToken', () => {
    it('devrait valider un token valide', async () => {
      const token = 'valid_token';
      const decoded = { userId: '123' };
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARENT',
      };

      mockedJwt.verify.mockReturnValue(decoded as never);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.validateToken(token);

      expect(mockedJwt.verify).toHaveBeenCalled();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: decoded.userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('devrait retourner null pour un token invalide', async () => {
      const token = 'invalid_token';

      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authService.validateToken(token);

      expect(result).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('devrait changer le mot de passe avec succès', async () => {
      const userId = '123';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        id: userId,
        password: 'hashed_old_password',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARENT',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('hashed_new_password' as never);
      (mockPrisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'hashed_new_password',
      });

      await authService.changePassword(userId, oldPassword, newPassword);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        oldPassword,
        mockUser.password
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: 'hashed_new_password' },
      });
    });

    it('devrait échouer si l\'ancien mot de passe est incorrect', async () => {
      const userId = '123';
      const oldPassword = 'wrongpassword';
      const newPassword = 'newpassword';

      const mockUser = {
        id: userId,
        password: 'hashed_old_password',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARENT',
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        authService.changePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow(AppError);
      await expect(
        authService.changePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow('Mot de passe actuel incorrect');
    });

    it('devrait échouer si l\'utilisateur n\'existe pas', async () => {
      const userId = '123';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword';

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.changePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow(AppError);
      await expect(
        authService.changePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow('Utilisateur introuvable');
    });
  });

  describe('getCurrentUser', () => {
    it('devrait récupérer l\'utilisateur actuel', async () => {
      const userId = '123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        role: 'PARENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser(userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockUser);
    });

    it('devrait échouer si l\'utilisateur n\'existe pas', async () => {
      const userId = '123';

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.getCurrentUser(userId)).rejects.toThrow(
        AppError
      );
      await expect(authService.getCurrentUser(userId)).rejects.toThrow(
        'Utilisateur introuvable'
      );
    });
  });
});
