import { SensoryPreference, UserRole } from '@prisma/client';
import { z } from 'zod';

export const iepGoalSchema = z
  .object({
    id: z.string().uuid().optional(),
    title: z.string().min(1, "Le titre de l'objectif est requis").trim(),
    description: z.string().max(1000, 'Description trop longue').optional(),
    targetDate: z.coerce.date().optional(),
    status: z.enum(['not_started', 'in_progress', 'achieved']),
  })
  .strict();

export const uiPreferencesSchema = z.object({
  palette: z.enum(['calm', 'vibrant', 'monochrome']).default('calm'),
  contrastLevel: z.enum(['standard', 'high', 'maximum']).default('standard'),
  colorScheme: z.enum(['light', 'dark', 'auto']).default('light'),
  fontSize: z.enum(['small', 'medium', 'large', 'extra-large']).default('medium'),
  globalVolume: z
    .number()
    .int()
    .min(0, 'Le volume ne peut pas être négatif')
    .max(100, 'Le volume maximal est 100')
    .default(80),
  soundEnabled: z.boolean().default(true),
  animationsEnabled: z.boolean().default(true),
  dyslexiaFont: z.boolean().default(false),
  autoRead: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  audioCuesEnabled: z.boolean().default(true),
  screenReader: z.boolean().default(false),
  highContrast: z.boolean().default(false),
});

export const updateProfileSchema = z.object({
  dateOfBirth: z.coerce.date().optional(),
  avatarUrl: z.string().url("URL d'avatar invalide").optional(),
  developmentLevel: z.string().optional(),
  iepGoals: z.array(iepGoalSchema).optional(),
  parentIds: z.array(z.string()).optional(),
  educatorIds: z.array(z.string()).optional(),
  roles: z.array(z.nativeEnum(UserRole)).optional(),
  sensoryPreferences: z.array(z.nativeEnum(SensoryPreference)).optional(),
  uiPreferences: uiPreferencesSchema.partial().optional(),
});

export const updatePreferencesSchema = z.object({
  soundEnabled: z.boolean().optional(),
  animationsEnabled: z.boolean().optional(),
  dyslexiaMode: z.boolean().optional(),
  highContrastMode: z.boolean().optional(),
  fontSize: z.enum(['small', 'medium', 'large', 'extra-large']).optional(),
  uiPreferences: uiPreferencesSchema.partial().optional(),
});

export type IepGoal = z.infer<typeof iepGoalSchema>;
export type UiPreferences = z.infer<typeof uiPreferencesSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
export type PreferencesDTO = z.infer<typeof updatePreferencesSchema>;

export const parseUpdateProfileDTO = (payload: unknown): UpdateProfileDTO =>
  updateProfileSchema.parse(payload);

export const parsePreferencesDTO = (payload: unknown): PreferencesDTO =>
  updatePreferencesSchema.parse(payload);
