import { ZodError } from 'zod';
import {
  parsePreferencesDTO,
  parseUpdateProfileDTO,
  uiPreferencesSchema,
} from '../types/profile';

describe('Profile DTO validation', () => {
  it('valide un objectif IEP structuré et convertit la date', () => {
    const result = parseUpdateProfileDTO({
      iepGoals: [
        {
          title: 'Comprendre les émotions',
          description: 'Identifier trois émotions de base',
          targetDate: '2025-03-01',
          status: 'in_progress',
        },
      ],
    });

    expect(result.iepGoals?.[0].targetDate).toBeInstanceOf(Date);
    expect(result.iepGoals?.[0].status).toBe('in_progress');
  });

  it('rejette un statut IEP invalide', () => {
    expect(() =>
      parseUpdateProfileDTO({
        iepGoals: [
          {
            title: 'Test',
            status: 'invalid_status' as any,
          },
        ],
      })
    ).toThrow(ZodError);
  });

  it('borne les préférences UI et détecte les volumes hors plage', () => {
    const defaults = uiPreferencesSchema.parse({});
    expect(defaults.globalVolume).toBe(80);

    expect(() =>
      parsePreferencesDTO({
        uiPreferences: {
          globalVolume: 120,
        },
      })
    ).toThrow(ZodError);
  });
});
