import api from './api';
import { Progress, Reward } from '../types';

interface ProgressResponse {
  status: string;
  data: {
    progress: Progress;
  };
}

interface RewardsResponse {
  status: string;
  data: {
    rewards: Reward[];
  };
}

export const progressService = {
  /**
   * Get progress for a child
   */
  async getProgress(childId: string): Promise<Progress> {
    const response = await api.get<ProgressResponse>(`/progress/${childId}`);
    return response.data.data.progress;
  },

  /**
   * Update progress
   */
  async updateProgress(childId: string, updates: Partial<Progress>): Promise<Progress> {
    const response = await api.put<ProgressResponse>(`/progress/${childId}`, updates);
    return response.data.data.progress;
  },

  /**
   * Get available rewards
   */
  async getRewards(childId: string): Promise<Reward[]> {
    const response = await api.get<RewardsResponse>(`/progress/${childId}/rewards`);
    return response.data.data.rewards;
  },

  /**
   * Unlock a reward
   */
  async unlockReward(childId: string, rewardId: string): Promise<any> {
    const response = await api.post(`/progress/${childId}/rewards/${rewardId}/unlock`);
    return response.data;
  },

  /**
   * Add tokens to progress
   */
  async addTokens(childId: string, amount: number): Promise<Progress> {
    return this.updateProgress(childId, {
      tokensEarned: amount,
    } as any);
  },

  /**
   * Increment streak
   */
  async incrementStreak(childId: string): Promise<Progress> {
    const currentProgress = await this.getProgress(childId);
    return this.updateProgress(childId, {
      currentStreak: currentProgress.currentStreak + 1,
    } as any);
  },
};

export default progressService;
