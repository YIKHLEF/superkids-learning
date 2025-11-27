import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const extractedErrors = errors.array().map((err) => ({
      field: (err as any).param,
      message: err.msg,
    }));

    throw new AppError(
      `Erreurs de validation: ${JSON.stringify(extractedErrors)}`,
      400
    );
  };
};
