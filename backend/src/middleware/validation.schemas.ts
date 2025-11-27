import { z } from 'zod';
import {
  iepGoalSchema,
  updatePreferencesSchema as profileUpdatePreferencesSchema,
  updateProfileSchema as profileUpdateProfileSchema,
} from '../types/profile';

/**
 * Schémas de Validation Zod pour l'API SuperKids Learning
 * Fournit une validation stricte et sécurisée des entrées utilisateur
 */

// ============================================================================
// Schémas de Base et Helpers
// ============================================================================

// Validation d'UUID
const uuidSchema = z.string().uuid('ID invalide');

// Validation d'email
const emailSchema = z.string().email('Format d\'email invalide');

// Validation de mot de passe fort
const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(/[@$!%*?&#]/, 'Le mot de passe doit contenir au moins un caractère spécial');

// Validation de date de naissance (enfants 3-12 ans)
const dateOfBirthSchema = z.string().refine(
  (date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 3 && age <= 12;
  },
  { message: 'L\'enfant doit avoir entre 3 et 12 ans' }
);

// ============================================================================
// Schémas d'Authentification
// ============================================================================

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  role: z.enum(['CHILD', 'PARENT', 'EDUCATOR', 'THERAPIST', 'ADMIN']),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// ============================================================================
// Schémas de Profil
// ============================================================================

export const createProfileSchema = z.object({
  userId: uuidSchema,
  dateOfBirth: dateOfBirthSchema,
  avatarUrl: z.string().url('URL d\'avatar invalide').optional(),
  developmentLevel: z.enum(['EARLY_INTERVENTION', 'PRESCHOOL', 'ELEMENTARY']).optional(),
  sensoryPreferences: z.array(
    z.enum(['LOW_STIMULATION', 'MEDIUM_STIMULATION', 'HIGH_CONTRAST', 'MONOCHROME'])
  ).optional(),
  iepGoals: z.array(iepGoalSchema).optional(),
});

export const updateProfileSchema = profileUpdateProfileSchema;

export const updatePreferencesSchema = profileUpdatePreferencesSchema.merge(
  z.object({
    sensoryPreferences: z.array(
      z.enum(['LOW_STIMULATION', 'MEDIUM_STIMULATION', 'HIGH_CONTRAST', 'MONOCHROME'])
    ).optional(),
    autoReadText: z.boolean().optional(),
  })
);

// ============================================================================
// Schémas d'Activités
// ============================================================================

export const activityFiltersSchema = z.object({
  category: z.enum([
    'SOCIAL_SKILLS',
    'COMMUNICATION',
    'ACADEMIC',
    'AUTONOMY',
    'EMOTIONAL_REGULATION'
  ]).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  minAge: z.number().int().min(3).max(12).optional(),
  maxAge: z.number().int().min(3).max(12).optional(),
});

export const startSessionSchema = z.object({
  childId: uuidSchema,
  activityId: uuidSchema,
});

export const completeSessionSchema = z.object({
  completed: z.boolean(),
  successRate: z
    .number()
    .min(0)
    .max(1)
    .refine((val) => val >= 0 && val <= 1, { message: 'Le taux de réussite doit être entre 0 et 1' })
    .optional(),
  correctAnswers: z.number().int().nonnegative().optional(),
  totalQuestions: z.number().int().positive().optional(),
  attemptsCount: z.number().int().positive().optional(),
  supportLevel: z.enum(['none', 'minimal', 'moderate', 'substantial']).optional(),
  emotionalState: z.string().optional(),
  notes: z.string().max(1000).optional(),
  hintsUsed: z.number().int().nonnegative().optional(),
  timeSpentSeconds: z.number().int().nonnegative().optional(),
  responses: z.array(z.any()).optional(),
});

// ============================================================================
// Schémas de Progrès
// ============================================================================

export const updateProgressSchema = z.object({
  totalActivitiesCompleted: z.number().int().nonnegative().optional(),
  tokensEarned: z.number().int().nonnegative().optional(),
  currentStreak: z.number().int().nonnegative().optional(),
});

export const unlockRewardSchema = z.object({
  rewardId: uuidSchema,
});

// ============================================================================
// Schémas Adaptive Engine
// ============================================================================

const performanceSignalSchema = z.object({
  successRate: z.number().min(0).max(1),
  attemptsCount: z.number().int().nonnegative(),
  averageTimePerQuestion: z.number().positive().optional(),
  emotionalState: z.enum(['calm', 'engaged', 'frustrated', 'anxious', 'neutral']).optional(),
  supportLevel: z.enum(['none', 'minimal', 'moderate', 'full']).optional(),
});

export const adaptiveContextSchema = z.object({
  childId: uuidSchema,
  targetCategory: z.enum([
    'SOCIAL_SKILLS',
    'COMMUNICATION',
    'ACADEMIC',
    'AUTONOMY',
    'EMOTIONAL_REGULATION',
  ]),
  currentDifficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  recentPerformance: z.array(performanceSignalSchema).min(1),
  currentActivityId: uuidSchema.optional(),
  personalization: z
    .object({
      prefersLowStimuli: z.boolean().optional(),
      shortSessionsPreferred: z.boolean().optional(),
      regulationNeeded: z.boolean().optional(),
    })
    .optional(),
  sensoryPreferences: z
    .array(z.enum(['LOW_STIMULATION', 'MEDIUM_STIMULATION', 'HIGH_CONTRAST', 'MONOCHROME']))
    .optional(),
});

// ============================================================================
// Schémas de Ressources
// ============================================================================

export const resourceFiltersSchema = z.object({
  type: z.enum(['video', 'pictogram', 'social_story', 'guide', 'tutorial']).optional(),
  category: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

export const searchResourcesSchema = z.object({
  query: z.string().min(1, 'Requête de recherche requise').max(200),
  type: z.enum(['video', 'pictogram', 'social_story', 'guide', 'tutorial']).optional(),
  category: z.string().optional(),
});

export const createResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['video', 'pictogram', 'social_story', 'guide', 'tutorial']),
  category: z.string().optional(),
  url: z.string().url('URL invalide'),
  thumbnailUrl: z.string().url('URL de miniature invalide').optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// ============================================================================
// Schémas de Messages
// ============================================================================

export const sendMessageSchema = z.object({
  recipientId: uuidSchema,
  subject: z.string().min(1, 'Sujet requis').max(200),
  content: z.string().min(1, 'Contenu requis').max(5000),
  attachments: z.array(z.string().url('URL de pièce jointe invalide')).optional(),
});

export const messageFiltersSchema = z.object({
  unreadOnly: z.boolean().optional().default(false),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});

// ============================================================================
// Schémas de Paramètres de Requête (Query Params)
// ============================================================================

export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

export const idParamSchema = z.object({
  id: uuidSchema,
});

// ============================================================================
// Export des types TypeScript depuis les schémas Zod
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type ActivityFilters = z.infer<typeof activityFiltersSchema>;
export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type ResourceFilters = z.infer<typeof resourceFiltersSchema>;
export type SearchResourcesInput = z.infer<typeof searchResourcesSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessageFilters = z.infer<typeof messageFiltersSchema>;
