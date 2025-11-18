// Types et DTOs pour SuperKids Learning Backend

import {
  UserRole,
  ActivityCategory,
  DifficultyLevel,
  SensoryPreference,
  RewardType,
} from '@prisma/client';
import {
  IepGoal,
  PreferencesDTO,
  UiPreferences,
  UpdateProfileDTO,
  parsePreferencesDTO,
  parseUpdateProfileDTO,
  updatePreferencesSchema,
  updateProfileSchema,
} from './profile';

// ============ Auth Types ============
export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserWithToken {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  token: string;
}

// ============ Activity Types ============
export interface ActivityFilters {
  category?: ActivityCategory;
  difficulty?: DifficultyLevel;
  search?: string;
  ebpTag?: string;
}

export interface CreateActivityDTO {
  title: string;
  description: string;
  category: ActivityCategory;
  difficulty: DifficultyLevel;
  duration: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  instructions: string[];
  targetSkills: string[];
  ebpTags?: string[];
}

export interface SessionResults {
  completed: boolean;
  successRate?: number;
  attemptsCount: number;
  supportLevel: string;
  emotionalState?: string;
  notes?: string;
  correctAnswers?: number;
  totalQuestions?: number;
  hintsUsed?: number;
  timeSpentSeconds?: number;
}

export interface StartSessionDTO {
  childId: string;
  activityId: string;
}

// ============ Progress Types ============
export interface ProgressUpdate {
  tokensEarned?: number;
  skillsAcquired?: Record<string, any>;
}

export interface ActivityRewardPayload {
  childId: string;
  activityId: string;
  tokens?: number;
  badgeId?: string;
  themeId?: string;
  avatarId?: string;
  rewardType?: RewardType;
}

export interface ActivityEventPayload {
  activityId: string;
  childId: string;
  type: 'activity_start' | 'activity_end' | 'attempt' | 'success' | 'emotion';
  timestamp: string;
  difficulty: DifficultyLevel;
  attempts?: number;
  successRate?: number;
  emotionalState?: string;
  dominantEmotion?: string;
  supportLevel?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsData {
  totalActivities: number;
  successRate: number;
  favoriteCategories: { category: string; count: number }[];
  skillProgress: Record<string, number>;
  emotionalStates: Record<string, number>;
  timeSpent: number;
  streak: number;
}

// ============ Adaptive Engine Types ============
export interface PerformanceSignal {
  successRate: number;
  attemptsCount: number;
  averageTimePerQuestion?: number;
  emotionalState?: string;
  supportLevel?: 'none' | 'minimal' | 'moderate' | 'full';
}

export interface AdaptiveContext {
  childId: string;
  targetCategory: ActivityCategory;
  currentDifficulty: DifficultyLevel;
  recentPerformance: PerformanceSignal[];
  currentActivityId?: string;
  personalization?: {
    prefersLowStimuli?: boolean;
    shortSessionsPreferred?: boolean;
    regulationNeeded?: boolean;
  };
  sensoryPreferences?: SensoryPreference[];
}

export interface ActivityRecommendation {
  category: ActivityCategory;
  difficulty: DifficultyLevel;
  weight: number;
  reason: string;
  suggestedActivityId?: string;
}

export interface AdaptiveRecommendation {
  childId: string;
  nextDifficulty: DifficultyLevel;
  recommendations: ActivityRecommendation[];
  rationale: string[];
  escalationWarnings?: string[];
}

export interface MlAdaptiveResponse {
  nextDifficulty: DifficultyLevel;
  recommendations: ActivityRecommendation[];
  explanation?: string[];
  confidence?: number;
}

export type RecommendationSource = 'ml' | 'heuristic';

export interface AdaptiveEngineResult {
  recommendation: AdaptiveRecommendation;
  source: RecommendationSource;
}

// ============ Reporting Types ============
export { ReportAlert, ReportSummary } from './reporting';

// ============ Resource Types ============
export interface ResourceFilters {
  type?: string;
  category?: string;
  tags?: string[];
  search?: string;
  language?: string;
}

export interface CreateResourceDTO {
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  assetUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  isFavorite?: boolean;
  language?: string;
  ageRange?: number[];
}

export interface UpdateResourceDTO {
  title?: string;
  description?: string;
  category?: string;
  url?: string;
  assetUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  isFavorite?: boolean;
  language?: string;
  ageRange?: number[];
}

export interface UploadMetadata {
  url: string;
  key: string;
  size: number;
  contentType: string;
  width?: number;
  height?: number;
  provider: string;
}

// ============ Message Types ============
export interface SendMessageDTO {
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  attachments?: (UploadMetadata | string)[];
}

// ============ Error Types ============
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

// ============ Common Types ============
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type { IepGoal, UiPreferences, UpdateProfileDTO, PreferencesDTO };
export {
  parseUpdateProfileDTO,
  parsePreferencesDTO,
  updatePreferencesSchema,
  updateProfileSchema,
};
