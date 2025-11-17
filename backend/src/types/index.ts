// Types et DTOs pour SuperKids Learning Backend

import { UserRole, ActivityCategory, DifficultyLevel } from '@prisma/client';

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

// ============ Profile Types ============
export interface UpdateProfileDTO {
  dateOfBirth?: Date;
  avatarUrl?: string;
  developmentLevel?: string;
  iepGoals?: string[];
  parentIds?: string[];
  educatorIds?: string[];
}

export interface PreferencesDTO {
  soundEnabled?: boolean;
  animationsEnabled?: boolean;
  dyslexiaMode?: boolean;
  highContrastMode?: boolean;
  fontSize?: string;
}

// ============ Activity Types ============
export interface ActivityFilters {
  category?: ActivityCategory;
  difficulty?: DifficultyLevel;
  search?: string;
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
}

export interface SessionResults {
  completed: boolean;
  successRate: number;
  attemptsCount: number;
  supportLevel: string;
  emotionalState?: string;
  notes?: string;
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

// ============ Resource Types ============
export interface ResourceFilters {
  type?: string;
  category?: string;
  tags?: string[];
  search?: string;
}

export interface CreateResourceDTO {
  title: string;
  description: string;
  type: string;
  category: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
}

export interface UpdateResourceDTO {
  title?: string;
  description?: string;
  category?: string;
  url?: string;
  thumbnailUrl?: string;
  tags?: string[];
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
  attachments?: string[];
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
