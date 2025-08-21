import apiClient from './client';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenResponse } from '../types/auth';

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    const authResponse = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', authResponse.tokens.access_token);
    localStorage.setItem('refresh_token', authResponse.tokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    
    return authResponse;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    const authResponse = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', authResponse.tokens.access_token);
    localStorage.setItem('refresh_token', authResponse.tokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    
    return authResponse;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken
    });
    
    const newAccessToken = response.data.access_token;
    localStorage.setItem('access_token', newAccessToken);
    
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};