import reducer, { setProgress, addTokens, recordFeedback, updateProgression } from '../progressSlice';
import { Progress } from '../../../types';

const baseProgress: Progress = {
  childId: 'child_1',
  totalActivitiesCompleted: 2,
  tokensEarned: 20,
  skillsAcquired: {},
  currentStreak: 1,
  longestStreak: 1,
  rewardsUnlocked: [],
};

describe('progressSlice', () => {
  it('should set progress', () => {
    const nextState = reducer(undefined, setProgress(baseProgress));
    expect(nextState.progress?.tokensEarned).toBe(20);
  });

  it('should add tokens and unlock reward with feedback', () => {
    const initial = reducer(undefined, setProgress(baseProgress));
    const withTokens = reducer(initial, addTokens(5));
    const finalState = reducer(
      withTokens,
      recordFeedback({ message: 'Bravo !', tokens: 10, badgeUnlocked: 'Empathie', recommendedDifficulty: 'BEGINNER' })
    );
    expect(finalState.progress?.tokensEarned).toBe(35);
    expect(finalState.progress?.rewardsUnlocked).toContain('Empathie');
    expect(finalState.lastFeedback?.message).toBe('Bravo !');
    expect(finalState.lastFeedback?.recommendedDifficulty).toBe('BEGINNER');
  });

  it('should update progression metrics', () => {
    const nextState = reducer(
      undefined,
      updateProgression({ daily: 3, weekly: 6, mastery: { Communication: 80 } })
    );
    expect(nextState.progression?.weekly).toBe(6);
    expect(nextState.progression?.mastery.Communication).toBe(80);
  });
});
