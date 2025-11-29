/**
 * 角色管理 API 服务
 */

import apiClient from '@/shared/services/api';
import { mapPaginatedResponse } from '@/shared/services/pagination';
import type { PaginatedResponse, ApiResponse, Role, Permission, RoleListParams, CreateRoleData, UpdateRoleData, AssignPermissionsData, RoleListResponse } from '@zyerp/shared';

 

class RoleService {
  /**
   * 获取角色列表
   */
  async getRoles(params?: RoleListParams): Promise<RoleListResponse> {
    const response = await apiClient.get<ApiResponse<RoleListResponse>>('/roles', {
      params: params as Record<string, unknown>,
    });
    if (!response.data.data) {
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
    return response.data.data;
  }

  async getList(params: RoleListParams = {}): Promise<PaginatedResponse<Role>> {
    const response = await apiClient.get<ApiResponse<RoleListResponse>>('/roles', {
      params: params as Record<string, unknown>,
    });
    return mapPaginatedResponse<Role>(response.data);
  }

  /**
   * 根据ID获取角色详情
   */
  async getRoleById(id: string): Promise<Role> {
    const response = await apiClient.get<ApiResponse<Role>>(`/roles/${id}`);
    if (!response.data.data) {
      throw new Error('Role not found');
    }
    return response.data.data;
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>('/roles', data);
    if (!response.data.data) {
      throw new Error('Failed to create role');
    }
    return response.data.data;
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    const response = await apiClient.put<ApiResponse<Role>>(`/roles/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update role');
    }
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
    if (!response.data.data) {
      throw new Error('Failed to assign permissions');
    }
    return response.data.data;
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(id: string): Promise<Permission[]> {
    const response = await apiClient.get<ApiResponse<Permission[]>>(`/roles/${id}/permissions`);
    return response.data.data || [];
  }
}

export const roleService = new RoleService();
export default roleService;
