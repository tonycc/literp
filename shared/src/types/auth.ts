/**
 * 认证相关类型定义
 */

import { ID, Timestamp } from './common';
import { Department, UserDepartment } from './department';

// 用户角色
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// 权限类型
export interface Permission {
  id: ID;
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
}

// 角色类型
export interface Role {
  id: ID;
  name: string;
  code: string;
  description?: string;
  permissions: Permission[];
  userCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 用户类型
export interface User {
  id: ID;
  username: string;
  email: string;
  avatar?: string;
  roles: Role[];
  isActive: boolean;
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // 部门相关字段
  departments?: UserDepartment[];
  mainDepartment?: Department;
  departmentId?: ID; // 主部门ID，用于向后兼容
}

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
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Auth Actions for useReducer
export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOGOUT' };
