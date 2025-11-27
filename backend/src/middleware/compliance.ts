import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

const shouldAnonymize = () => process.env.DATA_ANONYMIZATION === 'true';

const scrubFields = (payload: any, fields: string[]): any => {
  if (Array.isArray(payload)) {
    return payload.map((item) => scrubFields(item, fields));
  }

  if (payload && typeof payload === 'object') {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(payload)) {
      if (fields.includes(key)) {
        sanitized[key] = '[anonymized]';
      } else {
        sanitized[key] = scrubFields(value, fields);
      }
    }

    return sanitized;
  }

  return payload;
};

export const enforceDataProtectionHeaders = (
  retentionDays = Number(process.env.DATA_RETENTION_DAYS || 365)
) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Data-Retention-Days', retentionDays.toString());
    res.setHeader('X-Consent-Required', 'true');
    res.setHeader('X-Anonymization-Flag', shouldAnonymize() ? 'enabled' : 'disabled');
    next();
  };
};

export const requireParentalConsent = (
  consentHeader: string = 'x-parent-consent'
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    const consentGiven = req.headers[consentHeader] === 'true';
    const coppaAge = Number(process.env.COPPA_AGE_THRESHOLD || 13);
    const userAge = req.headers['x-user-age'] ? Number(req.headers['x-user-age']) : undefined;

    if (userRole === 'CHILD' || (userAge && userAge < coppaAge)) {
      if (!consentGiven) {
        return next(
          new AppError(
            'Consentement parental requis pour traiter ces données (RGPD/COPPA)',
            412
          )
        );
      }
    }

    next();
  };
};

export const anonymizeResponse = (fields: string[]) => {
    return (_req: Request, res: Response, next: NextFunction) => {
      if (!fields.length) return next();

      const originalJson = res.json;
      res.json = function (this: Response, body?: any): Response {
        const payload = shouldAnonymize() ? scrubFields(body, fields) : body;
        return originalJson.call(this, payload);
      } as Response['json'];

    next();
  };
};
