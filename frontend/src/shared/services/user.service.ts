import type { User, PaginationParams, PaginatedResponse, ApiResponse } from '@zyerp/shared';
import apiClient from './api';

/**
 * 获取用户列表
 * @param params - 查询参数
 * @returns 用户列表
 */
export const getUsers = async (
  params: PaginationParams,
): Promise<PaginatedResponse<User>> => {
  // 将前端分页参数转换为后端所需格式（users接口使用 limit 而非 pageSize）
  const backendParams: { page?: number; limit?: number } = {};
  if (params?.page !== undefined) backendParams.page = params.page;
  if (params?.pageSize !== undefined) backendParams.limit = params.pageSize;

  // 后端返回：{ success, data: { data: User[], total, page, limit, totalPages }, ... }
  const response = await apiClient.get<ApiResponse<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>>('/users', { params: backendParams });

  const backendData = response.data.data;

  return {
    success: response.data.success,
    data: backendData?.data ?? [],
    message: response.data.message,
    timestamp: response.data.timestamp,
    pagination: {
      page: backendData?.page ?? backendParams.page ?? 1,
      pageSize: backendData?.limit ?? backendParams.limit ?? 10,
      total: backendData?.total ?? 0,
    },
  };
};