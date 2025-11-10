/**
 * 用户服务
 */

import apiClient from '../../../shared/services/api';
import type { User, ApiResponse } from '@zyerp/shared';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class UserService {
  /**
   * 获取用户列表
   */
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const response = await apiClient.get<ApiResponse<UserListResponse>>('/users', { params });
    return response.data.data!;
  }

  /**
   * 根据 ID 获取用户
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  }

  /**
   * 创建用户
   */
  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    roleIds?: string[];
    departmentId?: string;
  }): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', userData);
    return response.data.data!;
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, userData: {
    username?: string;
    email?: string;
    password?: string;
    isActive?: boolean;
    departmentId?: string;
  }): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data!;
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/status`, { isActive });
    return response.data.data!;
  }
}

export default new UserService();