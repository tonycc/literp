/**
 * 认证相关类型定义
 */

import type { ID } from './common';
import type { User } from './user';
export type { User, Role, Permission } from './user';

// 用户相关类型已迁移至 ./user

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
  captcha?: string;
}

// 登录响应
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// JWT 载荷
export interface JwtPayload {
  sub?: ID;
  userId: ID;
  username: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

// 刷新令牌请求
export interface RefreshTokenRequest {
  refreshToken: string;
}
// 前端状态管理相关类型
// Auth State for React Context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth Context Type
export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Auth Actions for useReducer
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOGOUT' };
