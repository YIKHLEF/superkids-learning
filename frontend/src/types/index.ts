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
  iepGoals: string[];
  parentIds: string[];
  educatorIds: string[];
  preferences: {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    dyslexiaMode: boolean;
    highContrastMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
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

export interface Progress {
  childId: string;
  totalActivitiesCompleted: number;
  tokensEarned: number;
  skillsAcquired: Record<string, number>; // skill -> proficiency level
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  rewardsUnlocked: string[];
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
  dyslexiaFont: boolean;
  autoRead: boolean;
}
