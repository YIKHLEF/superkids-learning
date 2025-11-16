import { Request, Response } from 'express';
import { register, login } from '../auth.controller';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock bcrypt and jwt
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'CHILD',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.any(Object),
            token: expect.any(String),
          }),
        })
      );
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        // Missing password, name, role
      };

      try {
        await register(mockRequest as Request, mockResponse as Response);
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Tous les champs sont requis');
      }
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            token: expect.any(String),
          }),
        })
      );
    });

    it('should return 400 if email or password is missing', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        // Missing password
      };

      try {
        await login(mockRequest as Request, mockResponse as Response);
      } catch (error: any) {
        expect(error.statusCode).toBe(400);
      }
    });
  });
});
