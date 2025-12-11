/**
 * 认证服务
 */

import apiClient from '@/shared/services/api';
import type { LoginRequest, LoginResponse, User, ApiResponse } from '@zyerp/shared';

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    
    // 后端返回的是 ApiResponse<LoginResponse> 格式
    const loginData = response.data.data;

    if (!loginData) {
      throw new Error('Login failed: No data received');
    }
    
    // 保存 token 到本地存储
    if (loginData.accessToken) {
      localStorage.setItem('access_token', loginData.accessToken);
      localStorage.setItem('refresh_token', loginData.refreshToken);
    }
    
    return loginData;
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // 清除本地存储
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  /**
   * 刷新 token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });

    // 更新本地存储
    localStorage.setItem('access_token', response.data.accessToken);
    localStorage.setItem('refresh_token', response.data.refreshToken);

    return response.data;
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    // 后端返回的是 ApiResponse<User> 格式，取 data 字段
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    if (!response.data.data) {
      throw new Error('Failed to get current user');
    }
    return response.data.data;
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * 获取访问 token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * 获取刷新 token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }
}

export default new AuthService();