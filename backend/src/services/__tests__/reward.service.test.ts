import { RewardService } from '../reward.service';
import { PrismaClient } from '@prisma/client';

const mockPrisma = {
  progress: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  reward: {
    findMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('RewardService', () => {
  let rewardService: RewardService;

  beforeEach(() => {
    rewardService = new RewardService(mockPrisma);
    jest.clearAllMocks();
  });

  it('should return reward summary with unlocked statuses', async () => {
    (mockPrisma.progress.findUnique as jest.Mock).mockResolvedValue({
      childId: 'child_1',
      tokensEarned: 30,
      rewardsUnlocked: ['badge_1'],
    });

    (mockPrisma.reward.findMany as jest.Mock).mockResolvedValue([
      { id: 'badge_1', tokensRequired: 0 },
      { id: 'badge_2', tokensRequired: 10 },
    ]);

    const summary = await rewardService.getRewardSummary('child_1');
    expect(summary.tokensEarned).toBe(30);
    expect(summary.rewards[0]).toHaveProperty('unlocked', true);
    expect(summary.rewards[1]).toHaveProperty('unlocked', false);
  });

  it('should award rewards for activity completion', async () => {
    (mockPrisma.progress.findUnique as jest.Mock)
      .mockResolvedValueOnce({
        childId: 'child_1',
        tokensEarned: 10,
        totalActivitiesCompleted: 2,
        rewardsUnlocked: [],
      })
      .mockResolvedValueOnce({
        childId: 'child_1',
        tokensEarned: 10,
        totalActivitiesCompleted: 2,
        rewardsUnlocked: [],
      });

    (mockPrisma.progress.update as jest.Mock).mockResolvedValue({
      tokensEarned: 20,
      totalActivitiesCompleted: 3,
      rewardsUnlocked: ['badge_hero'],
    });

    (mockPrisma.reward.findMany as jest.Mock).mockResolvedValue([
      { id: 'badge_hero', tokensRequired: 0 },
    ]);

    const result = await rewardService.awardForActivity({
      childId: 'child_1',
      activityId: 'act_1',
      tokens: 10,
      badgeId: 'badge_hero',
    });

    expect(mockPrisma.progress.update).toHaveBeenCalled();
    expect(result.balance).toBe(20);
    expect(result.unlocked).toContain('badge_hero');
    expect(result.rewards[0].unlocked).toBe(true);
  });
});
