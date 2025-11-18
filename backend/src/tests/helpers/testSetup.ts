import { PrismaClient } from '@prisma/client';
import { Express } from 'express';
import request from 'supertest';

export const prisma = new PrismaClient();

// Clean database before each test
export async function cleanDatabase() {
  // Delete in correct order due to foreign key constraints
  await prisma.activitySession.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.childProfile.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.user.deleteMany({});
}

// Create a test user and return auth token
export async function createTestUser(
  app: Express,
  userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }
): Promise<{ userId: string; token: string; user: any }> {
  const response = await request(app).post('/api/auth/register').send(userData).expect(201);

  return {
    userId: response.body.data.user.id,
    token: response.body.data.token,
    user: response.body.data.user,
  };
}

// Create a test child profile
export async function createTestChildProfile(
  _app: Express,
  _token: string,
  userId: string
): Promise<any> {
  const profile = await prisma.childProfile.create({
    data: {
      userId,
      dateOfBirth: new Date('2018-05-15'),
      age: 6,
      avatarUrl: 'https://example.com/avatar.jpg',
      sensoryPreferences: ['LOW_STIMULATION'],
      developmentLevel: 'Intermédiaire',
      iepGoals: ['Améliorer la communication'],
      soundEnabled: false,
      animationsEnabled: false,
      dyslexiaMode: false,
      highContrastMode: true,
      fontSize: 'medium',
    },
  });

  // Create Progress for this child
  await prisma.progress.create({
    data: {
      childId: profile.id,
      totalActivitiesCompleted: 0,
      tokensEarned: 0,
      skillsAcquired: {},
      currentStreak: 0,
      longestStreak: 0,
      rewardsUnlocked: [],
    },
  });

  return profile;
}

// Create a test activity
export async function createTestActivity(): Promise<any> {
  return prisma.activity.create({
    data: {
      title: 'Reconnaissance des émotions',
      description: 'Identifier les émotions de base',
      category: 'SOCIAL_SKILLS',
      difficulty: 'BEGINNER',
      duration: 15,
      thumbnailUrl: null,
      videoUrl: null,
      instructions: ['Observer les visages et identifier les émotions'],
      targetSkills: ['Reconnaissance émotionnelle', 'Empathie'],
      ebpTags: ['Visual Supports'],
    },
  });
}

// Create a test resource
export async function createTestResource(): Promise<any> {
  return prisma.resource.create({
    data: {
      title: 'Vidéo sur les émotions',
      description: 'Comprendre les émotions de base',
      type: 'video',
      url: 'https://example.com/video.mp4',
      category: 'Émotions',
      tags: ['émotions', 'vidéo', 'enfants'],
      language: 'fr',
      ageRange: [6, 9],
    },
  });
}

// Teardown after all tests
export async function teardown() {
  await cleanDatabase();
  await prisma.$disconnect();
}
