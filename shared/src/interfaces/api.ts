/**
 * API 接口定义
 */

import { ApiResponse, PaginatedResponse, QueryParams, ID } from '../types/common';
import { User, LoginRequest, LoginResponse, RefreshTokenRequest } from '../types/auth';

// 认证相关接口
export interface AuthApi {
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>>;
  logout(): Promise<ApiResponse<void>>;
  refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>>;
  getCurrentUser(): Promise<ApiResponse<User>>;
}

// 用户管理接口
export interface UserApi {
  getUsers(params?: QueryParams): Promise<PaginatedResponse<User>>;
  getUserById(id: ID): Promise<ApiResponse<User>>;
  createUser(data: Partial<User>): Promise<ApiResponse<User>>;
  updateUser(id: ID, data: Partial<User>): Promise<ApiResponse<User>>;
  deleteUser(id: ID): Promise<ApiResponse<void>>;
}

// 基础 CRUD 接口
export interface BaseApi<T> {
  getList(params?: QueryParams): Promise<PaginatedResponse<T>>;
  getById(id: ID): Promise<ApiResponse<T>>;
  create(data: Partial<T>): Promise<ApiResponse<T>>;
  update(id: ID, data: Partial<T>): Promise<ApiResponse<T>>;
  delete(id: ID): Promise<ApiResponse<void>>;
}