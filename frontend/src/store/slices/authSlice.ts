import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '../../types';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  role: UserRole | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  role: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ userId: string; role: UserRole; token: string }>) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.role = null;
      state.token = null;
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
