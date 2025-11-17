import React, { useMemo } from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { createAppTheme } from '../theme';
import settingsReducer, { setPalette, setContrastLevel } from '../../store/slices/settingsSlice';
import authReducer from '../../store/slices/authSlice';
import profileReducer from '../../store/slices/profileSlice';
import activityReducer from '../../store/slices/activitySlice';
import progressReducer from '../../store/slices/progressSlice';
import rewardReducer from '../../store/slices/rewardSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      profile: profileReducer,
      activity: activityReducer,
      progress: progressReducer,
      settings: settingsReducer,
      rewards: rewardReducer,
    },
  });

type TestState = ReturnType<ReturnType<typeof createTestStore>['getState']>;

const ThemeProbe = () => {
  const accessibility = useSelector((state: TestState) => state.settings.accessibility);
  const theme = useMemo(() => createAppTheme(accessibility), [accessibility]);

  return (
    <ThemeProvider theme={theme}>
      <span data-testid="primary-color" style={{ color: theme.palette.primary.main }}>
        {theme.palette.primary.main}
      </span>
    </ThemeProvider>
  );
};

const renderWithStore = () => {
  const store = createTestStore();

  const view = render(
    <Provider store={store}>
      <ThemeProbe />
    </Provider>
  );

  return { store, ...view };
};

describe('Thème dynamique', () => {
  it('met à jour la palette primaire en temps réel', () => {
    const { store } = renderWithStore();
    const colorNode = screen.getByTestId('primary-color');
    const initialColor = colorNode.textContent;

    store.dispatch(setPalette('vibrant'));
    store.dispatch(setContrastLevel('maximum'));

    expect(colorNode.textContent).not.toBe(initialColor);
    expect(colorNode).toHaveStyle({ color: '#325FCC' });
  });
});
