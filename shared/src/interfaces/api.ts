/**
 * API 接口定义
 */
/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */

import type { ApiResponse, PaginatedResponse, QueryParams, ID } from '../types/common';
import type { LoginRequest, LoginResponse, RefreshTokenRequest } from '../types/auth';
import type { User } from '../types/user';

// 认证相关接口
export interface AuthApi {
  login(_data: LoginRequest): Promise<ApiResponse<LoginResponse>>;
  logout(): Promise<ApiResponse<void>>;
  refreshToken(_data: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>>;
  getCurrentUser(): Promise<ApiResponse<User>>;
}

// 用户管理接口
export interface UserApi {
  getUsers(_params?: QueryParams): Promise<PaginatedResponse<User>>;
  getUserById(_id: ID): Promise<ApiResponse<User>>;
  createUser(_data: Partial<User>): Promise<ApiResponse<User>>;
  updateUser(_id: ID, _data: Partial<User>): Promise<ApiResponse<User>>;
  deleteUser(_id: ID): Promise<ApiResponse<void>>;
}

// 基础 CRUD 接口
export interface BaseApi<T> {
  getList(_params?: QueryParams): Promise<PaginatedResponse<T>>;
  getById(_id: ID): Promise<ApiResponse<T>>;
  create(_data: Partial<T>): Promise<ApiResponse<T>>;
  update(_id: ID, _data: Partial<T>): Promise<ApiResponse<T>>;
  delete(_id: ID): Promise<ApiResponse<void>>;
}
