/**
 * 角色管理 API 服务
 */

import apiClient from '@/shared/services/api';
import type { Role, Permission } from '@zyerp/shared';

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface AssignPermissionsData {
  permissionIds: string[];
}

export interface RoleListResponse {
  data: Role[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class RoleService {
  /**
   * 获取角色列表
   */
  async getRoles(params?: RoleListParams): Promise<RoleListResponse> {
    const response = await apiClient.get<ApiResponse<RoleListResponse>>('/roles', {
      params,
    });
    return response.data.data;
  }

  /**
   * 根据ID获取角色详情
   */
  async getRoleById(id: string): Promise<Role> {
    const response = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>('/roles', data);
    return response.data.data;
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    const response = await apiClient.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data;
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  }

  /**
   * 为角色分配权限
   */
  async assignPermissions(id: string, data: AssignPermissionsData): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>(`/roles/${id}/permissions`, data);
    return response.data.data;
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(id: string): Promise<Permission[]> {
    const response = await apiClient.get<ApiResponse<Permission[]>>(`/roles/${id}/permissions`);
    return response.data.data;
  }
}

export const roleService = new RoleService();
export default roleService;