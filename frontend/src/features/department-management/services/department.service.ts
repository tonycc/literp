/**
 * 部门管理服务
 */

import apiClient from '@/shared/services/api';
import type {
  Department,
  DepartmentTreeNode,
  CreateDepartmentData,
  UpdateDepartmentData,
  DepartmentListParams,
  DepartmentListResponse,
  DepartmentStats,
  DepartmentMember,
  DepartmentMemberListParams,
  DepartmentMemberListResponse,
  AssignUserToDepartmentData,
  UpdateUserDepartmentData,
  ApiResponse,
  ID
} from '@zyerp/shared';

export class DepartmentService {
  private readonly baseUrl = '/departments';

  /**
   * 获取部门列表
   */
  async getDepartments(params?: DepartmentListParams): Promise<DepartmentListResponse> {
    const response = await apiClient.get<ApiResponse<DepartmentListResponse>>(
      this.baseUrl,
      { params }
    );
    return response.data.data!;
  }

  /**
   * 获取部门树形结构
   */
  async getDepartmentTree(): Promise<DepartmentTreeNode[]> {
    const response = await apiClient.get<ApiResponse<DepartmentTreeNode[]>>(
      `${this.baseUrl}/tree`
    );
    return response.data.data!;
  }

  /**
   * 获取部门详情
   */
  async getDepartmentById(id: string): Promise<Department> {
    const response = await apiClient.get<ApiResponse<Department>>(
      `${this.baseUrl}/${id}`
    );
    return response.data.data!;
  }

  /**
   * 创建部门
   */
  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const response = await apiClient.post<ApiResponse<Department>>(
      this.baseUrl,
      data
    );
    return response.data.data!;
  }

  /**
   * 更新部门
   */
  async updateDepartment(id: string, data: UpdateDepartmentData): Promise<Department> {
    const response = await apiClient.put<ApiResponse<Department>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data!;
  }

  /**
   * 删除部门
   */
  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * 获取部门统计信息
   */
  async getDepartmentStats(): Promise<DepartmentStats> {
    const response = await apiClient.get<ApiResponse<DepartmentStats>>(
      `${this.baseUrl}/stats`
    );
    return response.data.data!;
  }

  /**
   * 获取部门成员列表
   */
  async getDepartmentMembers(params: DepartmentMemberListParams): Promise<DepartmentMemberListResponse> {
    const response = await apiClient.get<ApiResponse<DepartmentMemberListResponse>>(
      `${this.baseUrl}/${params.departmentId}/members`,
      { params: { ...params, departmentId: undefined } }
    );
    return response.data.data!;
  }

  /**
   * 分配用户到部门
   */
  async assignUserToDepartment(data: AssignUserToDepartmentData): Promise<DepartmentMember> {
    const response = await apiClient.post<ApiResponse<DepartmentMember>>(
      `${this.baseUrl}/${data.departmentId}/members`,
      data
    );
    return response.data.data!;
  }

  /**
   * 更新用户部门信息
   */
  async updateUserDepartment(userId: ID, departmentId: ID, data: UpdateUserDepartmentData): Promise<DepartmentMember> {
    const response = await apiClient.put<ApiResponse<DepartmentMember>>(
      `${this.baseUrl}/${departmentId}/members/${userId}`,
      data
    );
    return response.data.data!;
  }

  /**
   * 从部门移除用户
   */
  async removeUserFromDepartment(userId: ID, departmentId: ID): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${departmentId}/members/${userId}`);
  }
}

export const departmentService = new DepartmentService();