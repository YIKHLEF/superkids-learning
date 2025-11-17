import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import { createAppTheme } from './styles/theme';
import { store } from './store';
import { RootState } from './store';

// Pages (lazy loaded to split bundles)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ActivitiesPage = React.lazy(() => import('./pages/ActivitiesPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'));
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'));

// Composants
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const LoadingFallback = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

const AppContent: React.FC = () => {
  const accessibility = useSelector((state: RootState) => state.settings.accessibility);
  const theme = createAppTheme(accessibility);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activities"
                element={
                  <ProtectedRoute>
                    <ActivitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <ProtectedRoute>
                    <ResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
