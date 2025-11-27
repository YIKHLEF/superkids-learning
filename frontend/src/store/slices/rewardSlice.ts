import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reward, ActivityReward } from '../../types';

interface RewardState {
  tokens: number;
  badges: Reward[];
  themes: Reward[];
  avatars: Reward[];
  loading: boolean;
  error: string | null;
  lastAward?: ActivityReward;
}

const initialState: RewardState = {
  tokens: 0,
  badges: [],
  themes: [],
  avatars: [],
  loading: false,
  error: null,
};

const rewardSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    setInventory: (
      state,
      action: PayloadAction<{ tokens: number; rewards: Reward[] }>
    ) => {
      state.tokens = action.payload.tokens;
      const normalizeType = (type: Reward['type']) => String(type).toLowerCase();
      state.badges = action.payload.rewards.filter(
        (reward) => normalizeType(reward.type) === 'badge'
      );
      state.themes = action.payload.rewards.filter(
        (reward) => normalizeType(reward.type) === 'theme'
      );
      state.avatars = action.payload.rewards.filter(
        (reward) => normalizeType(reward.type) === 'avatar'
      );
      state.error = null;
    },
    applyReward: (state, action: PayloadAction<ActivityReward>) => {
      state.tokens += action.payload.tokens;
      const unlockReward = (collection: Reward[], id?: string) => {
        if (!id) return;
        const reward = collection.find((item) => item.id === id);
        if (reward) {
          reward.unlocked = true;
        } else {
          collection.push({
            id,
            name: id,
            description: 'Récompense débloquée',
            iconUrl: '/rewards/placeholder.png',
            tokensRequired: 0,
            type: collection === state.badges
              ? 'badge'
              : collection === state.themes
              ? 'theme'
              : 'avatar',
            unlocked: true,
          });
        }
      };

      unlockReward(state.badges, action.payload.badgeId);
      unlockReward(state.themes, action.payload.themeId);
      unlockReward(state.avatars, action.payload.avatarId);
      state.lastAward = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetRewards: () => initialState,
  },
});

export const { setInventory, applyReward, setLoading, setError, resetRewards } =
  rewardSlice.actions;
export default rewardSlice.reducer;
