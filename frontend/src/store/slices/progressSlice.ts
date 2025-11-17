import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Progress, Reward } from '../../types';

interface ProgressState {
  progress: Progress | null;
  rewards: Reward[];
  loading: boolean;
  error: string | null;
  lastFeedback?: {
    message: string;
    tokensAwarded: number;
    badgeUnlocked?: string;
    recommendedDifficulty?: string;
  };
  progression?: {
    daily: number;
    weekly: number;
    mastery: Record<string, number>;
  };
}

const initialState: ProgressState = {
  progress: null,
  rewards: [],
  loading: false,
  error: null,
  progression: {
    daily: 0,
    weekly: 0,
    mastery: {},
  },
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
    recordFeedback: (
      state,
      action: PayloadAction<{
        message: string;
        tokens: number;
        badgeUnlocked?: string;
        recommendedDifficulty?: string;
      }>
    ) => {
      if (state.progress) {
        state.progress.tokensEarned += action.payload.tokens;
        if (action.payload.badgeUnlocked) {
          state.progress.rewardsUnlocked.push(action.payload.badgeUnlocked);
        }
      }
      state.lastFeedback = {
        message: action.payload.message,
        tokensAwarded: action.payload.tokens,
        badgeUnlocked: action.payload.badgeUnlocked,
        recommendedDifficulty: action.payload.recommendedDifficulty,
      };
    },
    updateProgression: (
      state,
      action: PayloadAction<{ daily: number; weekly: number; mastery?: Record<string, number> }>
    ) => {
      state.progression = {
        daily: action.payload.daily,
        weekly: action.payload.weekly,
        mastery: action.payload.mastery || {},
      };
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
  recordFeedback,
  updateProgression,
  setLoading,
  setError,
} = progressSlice.actions;
export default progressSlice.reducer;
