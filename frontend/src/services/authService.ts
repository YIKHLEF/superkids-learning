import api, { getApiErrorMessage, logApiError } from './api';
import { UserRole } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface AuthResponse {
  status: string;
  data: {
    userId: string;
    role: UserRole;
    token: string;
    user?: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  };
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      logApiError(error as any, 'auth/login');
      throw new Error(getApiErrorMessage(error, 'connexion'));
    }
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data;
    } catch (error) {
      logApiError(error as any, 'auth/register');
      throw new Error(getApiErrorMessage(error, "création d'utilisateur"));
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      logApiError(error as any, 'auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      logApiError(error as any, 'auth/me');
      throw new Error(getApiErrorMessage(error, 'profil utilisateur'));
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};

export default authService;
