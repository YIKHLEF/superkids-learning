import reducer, { applyReward, resetRewards, setInventory } from '../rewardSlice';
import { Reward } from '../../../types';

const rewards: Reward[] = [
  {
    id: 'badge_empathie',
    name: 'Empathie',
    description: 'Associer toutes les émotions',
    iconUrl: '/badge.png',
    tokensRequired: 0,
    type: 'badge',
    unlocked: false,
  },
  {
    id: 'avatar_zen',
    name: 'Zen',
    description: '3 cycles de respiration',
    iconUrl: '/avatar.png',
    tokensRequired: 0,
    type: 'avatar',
    unlocked: false,
  },
];

describe('rewardSlice', () => {
  it('should hydrate rewards inventory', () => {
    const nextState = reducer(undefined, setInventory({ tokens: 10, rewards }));
    expect(nextState.tokens).toBe(10);
    expect(nextState.badges).toHaveLength(1);
    expect(nextState.avatars[0].id).toBe('avatar_zen');
  });

  it('should apply reward grant', () => {
    const state = reducer(undefined, setInventory({ tokens: 5, rewards }));
    const updated = reducer(
      state,
      applyReward({ activityId: 'emotions-dnd', tokens: 15, badgeId: 'badge_empathie' })
    );

    expect(updated.tokens).toBe(20);
    expect(updated.badges[0].unlocked).toBe(true);
    expect(updated.lastAward?.activityId).toBe('emotions-dnd');
  });

  it('should reset rewards', () => {
    const hydrated = reducer(undefined, setInventory({ tokens: 10, rewards }));
    const reset = reducer(hydrated, resetRewards());

    expect(reset.tokens).toBe(0);
    expect(reset.badges).toHaveLength(0);
  });
});
