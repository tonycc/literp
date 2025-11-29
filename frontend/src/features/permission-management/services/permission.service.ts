/**
 * 权限管理 API 服务
 */

import apiClient from '@/shared/services/api';
import { mapPaginatedResponse } from '@/shared/services/pagination';
import type { PaginatedResponse, ApiResponse, Permission } from '@zyerp/shared';

export interface PermissionListParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface CreatePermissionData {
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionData {
  name?: string;
  code?: string;
  resource?: string;
  action?: string;
  description?: string;
}

export interface PermissionListResponse {
  data: Permission[];
  total: number;
  page: number;
  limit: number;
}

class PermissionService {
  /**
   * 获取权限列表 (Standard)
   */
  async getList(params: PermissionListParams = {}): Promise<PaginatedResponse<Permission>> {
    const response = await apiClient.get<ApiResponse<PermissionListResponse>>('/permissions', {
      params: params as Record<string, unknown>,
    });
    return mapPaginatedResponse<Permission>(response.data);
  }

  /**
   * 获取权限列表 (Legacy)
   */
  async getPermissions(params?: PermissionListParams): Promise<PermissionListResponse> {
    const response = await apiClient.get<ApiResponse<PermissionListResponse>>('/permissions', {
      params: params as Record<string, unknown>,
    });
    if (!response.data.data) {
       return { data: [], total: 0, page: 1, limit: 10 };
    }
    return response.data.data;
  }

  /**
   * 根据ID获取权限详情
   */
  async getPermissionById(id: string): Promise<Permission> {
    const response = await apiClient.get<ApiResponse<Permission>>(`/permissions/${id}`);
    if (!response.data.data) {
      throw new Error('Permission not found');
    }
    return response.data.data;
  }

  /**
   * 创建权限
   */
  async createPermission(data: CreatePermissionData): Promise<Permission> {
    const response = await apiClient.post<ApiResponse<Permission>>('/permissions', data);
    if (!response.data.data) {
      throw new Error('Failed to create permission');
    }
    return response.data.data;
  }

  /**
   * 更新权限
   */
  async updatePermission(id: string, data: UpdatePermissionData): Promise<Permission> {
    const response = await apiClient.put<ApiResponse<Permission>>(`/permissions/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update permission');
    }
    return response.data.data;
  }

  /**
   * 删除权限
   */
  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(`/permissions/${id}`);
  }

  /**
   * 获取所有权限（不分页）
   */
  async getAllPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<ApiResponse<Permission[]>>('/permissions/all');
    return response.data.data || [];
  }

  /**
   * 根据资源获取权限
   */
  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    const response = await apiClient.get<ApiResponse<Permission[]>>(`/permissions/resource/${resource}`);
    return response.data.data || [];
  }
}

export const permissionService = new PermissionService();
export default permissionService;