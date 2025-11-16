import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from '../authSlice';
import { UserRole } from '../../../types';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should have initial state', () => {
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.userId).toBeNull();
    expect(state.role).toBeNull();
    expect(state.token).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle loginStart', () => {
    store.dispatch(loginStart());
    const state = store.getState().auth;
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle loginSuccess', () => {
    const payload = {
      userId: 'test-user-id',
      role: UserRole.CHILD,
      token: 'test-token',
    };
    store.dispatch(loginSuccess(payload));
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.userId).toBe(payload.userId);
    expect(state.role).toBe(payload.role);
    expect(state.token).toBe(payload.token);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle loginFailure', () => {
    const errorMessage = 'Invalid credentials';
    store.dispatch(loginFailure(errorMessage));
    const state = store.getState().auth;
    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle logout', () => {
    // First login
    store.dispatch(
      loginSuccess({
        userId: 'test-user-id',
        role: UserRole.CHILD,
        token: 'test-token',
      })
    );
    // Then logout
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.userId).toBeNull();
    expect(state.role).toBeNull();
    expect(state.token).toBeNull();
    expect(state.error).toBeNull();
  });
});
