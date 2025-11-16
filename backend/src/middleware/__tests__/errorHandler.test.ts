import { Request, Response, NextFunction } from 'express';
import { errorHandler, AppError } from '../errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {};
    responseObject = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockResponse = responseObject;
    mockNext = jest.fn();
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400);

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Test error',
    });
  });

  it('should handle generic errors', () => {
    const error = new Error('Generic error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.any(String),
    });
  });

  it('should create AppError with correct properties', () => {
    const error = new AppError('Custom error', 404);

    expect(error.message).toBe('Custom error');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
  });
});
