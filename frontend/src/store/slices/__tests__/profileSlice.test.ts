import { configureStore } from '@reduxjs/toolkit';
import profileReducer, {
  setCurrentProfile,
  updateProfile,
  togglePreference,
} from '../profileSlice';
import { ChildProfile, UserRole, SensoryPreference } from '../../../types';

describe('profileSlice', () => {
  let store: ReturnType<typeof configureStore>;

  const mockProfile: ChildProfile = {
    id: 'profile-1',
    name: 'Test Child',
    age: 8,
    role: UserRole.CHILD,
    avatarUrl: '/avatar.png',
    dateOfBirth: new Date('2015-06-15'),
    sensoryPreferences: [SensoryPreference.LOW_STIMULATION],
    developmentLevel: 'intermediate',
    iepGoals: ['Goal 1', 'Goal 2'],
    parentIds: ['parent-1'],
    educatorIds: ['educator-1'],
    preferences: {
      soundEnabled: true,
      animationsEnabled: true,
      dyslexiaMode: false,
      highContrastMode: false,
      fontSize: 'medium',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        profile: profileReducer,
      },
    });
  });

  it('should have initial state', () => {
    const state = store.getState().profile;
    expect(state.currentProfile).toBeNull();
    expect(state.profiles).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle setCurrentProfile', () => {
    store.dispatch(setCurrentProfile(mockProfile));
    const state = store.getState().profile;
    expect(state.currentProfile).toEqual(mockProfile);
  });

  it('should handle updateProfile', () => {
    store.dispatch(setCurrentProfile(mockProfile));
    store.dispatch(updateProfile({ name: 'Updated Name', age: 9 }));
    const state = store.getState().profile;
    expect(state.currentProfile?.name).toBe('Updated Name');
    expect(state.currentProfile?.age).toBe(9);
  });

  it('should handle togglePreference', () => {
    store.dispatch(setCurrentProfile(mockProfile));
    store.dispatch(togglePreference('soundEnabled'));
    const state = store.getState().profile;
    expect(state.currentProfile?.preferences.soundEnabled).toBe(false);
  });
});
