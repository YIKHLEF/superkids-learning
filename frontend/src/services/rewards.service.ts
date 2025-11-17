import api from './api';
import { ActivityReward, Reward } from '../types';

interface RewardSummaryResponse {
  status: string;
  data: {
    tokensEarned: number;
    rewards: Reward[];
  };
}

interface AwardResponse {
  status: string;
  data: {
    balance: number;
    unlocked: string[];
    rewards: Reward[];
  };
}

export const rewardsService = {
  async getRewards(childId: string): Promise<{ tokens: number; rewards: Reward[] }> {
    const response = await api.get<RewardSummaryResponse>(`/rewards/${childId}`);
    return { tokens: response.data.data.tokensEarned, rewards: response.data.data.rewards };
  },

  async awardForActivity(childId: string, reward: ActivityReward): Promise<AwardResponse['data']> {
    const response = await api.post<AwardResponse>(`/rewards/activity`, {
      childId,
      ...reward,
    });
    return response.data.data;
  },
};

export default rewardsService;
