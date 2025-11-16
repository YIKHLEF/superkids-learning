import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Progress, Reward } from '../../types';

interface ProgressState {
  progress: Progress | null;
  rewards: Reward[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  progress: null,
  rewards: [],
  loading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgress: (state, action: PayloadAction<Progress>) => {
      state.progress = action.payload;
    },
    addTokens: (state, action: PayloadAction<number>) => {
      if (state.progress) {
        state.progress.tokensEarned += action.payload;
      }
    },
    unlockReward: (state, action: PayloadAction<string>) => {
      if (state.progress) {
        state.progress.rewardsUnlocked.push(action.payload);
      }
      const reward = state.rewards.find((r) => r.id === action.payload);
      if (reward) {
        reward.unlocked = true;
      }
    },
    setRewards: (state, action: PayloadAction<Reward[]>) => {
      state.rewards = action.payload;
    },
    incrementStreak: (state) => {
      if (state.progress) {
        state.progress.currentStreak += 1;
        if (state.progress.currentStreak > state.progress.longestStreak) {
          state.progress.longestStreak = state.progress.currentStreak;
        }
      }
    },
    updateSkillProficiency: (state, action: PayloadAction<{ skill: string; level: number }>) => {
      if (state.progress) {
        state.progress.skillsAcquired[action.payload.skill] = action.payload.level;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProgress,
  addTokens,
  unlockReward,
  setRewards,
  incrementStreak,
  updateSkillProficiency,
  setLoading,
  setError,
} = progressSlice.actions;
export default progressSlice.reducer;
