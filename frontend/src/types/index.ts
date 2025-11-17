// Types pour l'application SuperKids Learning

export enum UserRole {
  CHILD = 'CHILD',
  PARENT = 'PARENT',
  EDUCATOR = 'EDUCATOR',
  THERAPIST = 'THERAPIST',
  ADMIN = 'ADMIN',
}

export enum SensoryPreference {
  LOW_STIMULATION = 'LOW_STIMULATION',
  MEDIUM_STIMULATION = 'MEDIUM_STIMULATION',
  HIGH_CONTRAST = 'HIGH_CONTRAST',
  MONOCHROME = 'MONOCHROME',
}

export interface IEPGoal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'not_started' | 'in_progress' | 'achieved';
}

export enum ActivityCategory {
  SOCIAL_SKILLS = 'SOCIAL_SKILLS',
  COMMUNICATION = 'COMMUNICATION',
  ACADEMIC = 'ACADEMIC',
  AUTONOMY = 'AUTONOMY',
  EMOTIONAL_REGULATION = 'EMOTIONAL_REGULATION',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildProfile extends UserProfile {
  dateOfBirth: Date;
  sensoryPreferences: SensoryPreference[];
  developmentLevel: string;
  iepGoals: IEPGoal[];
  parentIds: string[];
  educatorIds: string[];
  roles: UserRole[];
  preferences: {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    dyslexiaMode: boolean;
    highContrastMode: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  };
  uiPreferences?: Partial<AccessibilitySettings>;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  difficulty: DifficultyLevel;
  duration: number; // en minutes
  thumbnailUrl?: string;
  videoUrl?: string;
  instructions: string[];
  targetSkills: string[];
  ebpTags: string[];
  createdAt: Date;
}

export interface ActivitySession {
  id: string;
  childId: string;
  activityId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  successRate: number;
  attemptsCount: number;
  supportLevel: 'none' | 'minimal' | 'moderate' | 'full';
  emotionalState?: 'happy' | 'neutral' | 'frustrated' | 'anxious';
  notes?: string;
  durationSeconds?: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  tokensRequired: number;
  type: 'badge' | 'avatar' | 'theme' | 'celebration';
  unlocked: boolean;
}

export interface ActivityReward {
  activityId: string;
  tokens: number;
  badgeId?: string;
  themeId?: string;
  avatarId?: string;
  message?: string;
}

export interface Progress {
  childId: string;
  totalActivitiesCompleted: number;
  tokensEarned: number;
  skillsAcquired: Record<string, number>; // skill -> proficiency level
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  rewardsUnlocked: string[];
  totalDurationSeconds?: number;
  totalAttempts?: number;
  averageSuccessRate?: number;
  dominantEmotionalState?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: Date;
  attachments?: string[];
}

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  activitiesCompleted: number;
  averageSuccessRate: number;
  timeSpent: number; // en minutes
  skillProgress: Record<ActivityCategory, number>;
  emotionalStates: Record<string, number>;
  recommendations: string[];
}

// Adaptation et recommandations
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

export type RecommendationSource = 'ml' | 'heuristic' | 'fallback';

export interface AdaptiveEngineResult {
  recommendation: AdaptiveRecommendation;
  source: RecommendationSource;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'pictogram' | 'social_story' | 'guide' | 'tutorial';
  category: string;
  url: string;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: Date;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  audioCuesEnabled: boolean;
  animationsEnabled: boolean;
  contrastLevel: 'standard' | 'high' | 'maximum';
  palette: 'calm' | 'vibrant' | 'monochrome';
  globalVolume: number;
  dyslexiaFont: boolean;
  autoRead: boolean;
}
