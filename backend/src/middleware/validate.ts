import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Middleware de Validation avec Zod
 * Valide les requêtes entrantes contre un schéma Zod
 */

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Formatte les erreurs Zod en un format lisible
 */
const formatZodErrors = (error: ZodError): ValidationError[] => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

/**
 * Middleware de validation générique
 * @param schema - Le schéma Zod à valider
 * @param source - La source des données à valider ('body', 'query', 'params')
 */
export const validate = (
  schema: AnyZodObject,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valider les données selon la source
      const dataToValidate = req[source];

      // Parser et valider avec Zod
      const validatedData = await schema.parseAsync(dataToValidate);

      // Remplacer les données de la requête par les données validées
      req[source] = validatedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = formatZodErrors(error);

        logger.warn('Validation failed', {
          source,
          errors: formattedErrors,
          userId: (req as any).user?.id,
          path: req.path,
        });

        return res.status(400).json({
          message: 'Validation échouée',
          errors: formattedErrors,
          statusCode: 400,
        });
      }

      // Erreur inattendue
      logger.error('Unexpected validation error', { error });
      return res.status(500).json({
        message: 'Erreur de validation inattendue',
        statusCode: 500,
      });
    }
  };
};

/**
 * Middleware de validation combinée (body + query + params)
 */
export const validateAll = (schemas: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: ValidationError[] = [];

      // Valider le body
      if (schemas.body) {
        try {
          req.body = await schemas.body.parseAsync(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodErrors(error));
          }
        }
      }

      // Valider la query
      if (schemas.query) {
        try {
          req.query = await schemas.query.parseAsync(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodErrors(error));
          }
        }
      }

      // Valider les params
      if (schemas.params) {
        try {
          req.params = await schemas.params.parseAsync(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...formatZodErrors(error));
          }
        }
      }

      // Si des erreurs sont présentes, les retourner
      if (errors.length > 0) {
        logger.warn('Combined validation failed', {
          errors,
          userId: (req as any).user?.id,
          path: req.path,
        });

        return res.status(400).json({
          message: 'Validation échouée',
          errors,
          statusCode: 400,
        });
      }

      next();
    } catch (error) {
      logger.error('Unexpected combined validation error', { error });
      return res.status(500).json({
        message: 'Erreur de validation inattendue',
        statusCode: 500,
      });
    }
  };
};

/**
 * Sanitize les données pour prévenir les injections
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Fonction récursive de sanitization
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Échapper les caractères spéciaux HTML
      return obj
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize body, query, et params
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
};
