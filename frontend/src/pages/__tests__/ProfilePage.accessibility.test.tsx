import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProfilePage from '../ProfilePage';
import profileReducer from '../../store/slices/profileSlice';
import settingsReducer from '../../store/slices/settingsSlice';
import activityReducer from '../../store/slices/activitySlice';
import authReducer from '../../store/slices/authSlice';
import progressReducer from '../../store/slices/progressSlice';

beforeAll(() => {
  Object.defineProperty(global, 'crypto', {
    value: { randomUUID: () => 'test-id' },
  });
});

describe('ProfilePage accessibility preferences', () => {
  const renderWithStore = () => {
    const store = configureStore({
      reducer: {
        profile: profileReducer,
        settings: settingsReducer,
        activity: activityReducer,
        auth: authReducer,
        progress: progressReducer,
      },
    });

    return render(
      <Provider store={store}>
        <ProfilePage />
      </Provider>
    );
  };

  it('affiche la section préférences sensorielles et la prévisualisation', () => {
    renderWithStore();

    expect(screen.getByText(/Préférences sensorielles & UI/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Intensité du contraste/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prévisualisation du thème/i)).toBeInTheDocument();
  });
});
