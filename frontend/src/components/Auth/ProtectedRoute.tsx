import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { RootState } from '../../store';
import { loginSuccess } from '../../store/slices/authSlice';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  const hasStoredSession = useMemo(() => {
    try {
      return Boolean(localStorage.getItem('token'));
    } catch (error) {
      return false;
    }
  }, []);

  React.useEffect(() => {
    if (hasStoredSession && !isAuthenticated && !loading) {
      dispatch(
        loginSuccess({
          userId: 'local-session',
          role: UserRole.PARENT,
          token: localStorage.getItem('token') || '',
        })
      );
    }
  }, [dispatch, hasStoredSession, isAuthenticated, loading]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="50vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement de votre session…</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
