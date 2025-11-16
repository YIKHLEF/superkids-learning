import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      stack: err.stack,
    });

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Erreur inattendue
  logger.error(`Unexpected Error: ${err.message}`, {
    stack: err.stack,
  });

  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Une erreur inattendue s\'est produite'
      : err.message,
  });
};
