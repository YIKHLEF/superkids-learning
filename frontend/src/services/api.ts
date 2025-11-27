import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const logApiError = (error: AxiosError, context: string) => {
  console.error('[API] Échec de requête', {
    context,
    message: error.message,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    code: error.code,
  });
};

export const getApiErrorMessage = (error: unknown, context: string) => {
  const axiosError = error as AxiosError;
  const isNetworkIssue = !axiosError.response;
  return isNetworkIssue
    ? "Impossible de joindre l'API. Mode dégradé activé pour " + context
    : `Requête ${context} échouée (code ${axiosError.response?.status ?? 'inconnu'}).`;
};

export default api;
