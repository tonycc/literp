import apiClient from '@/shared/services/api';
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared';
import type { SalesOrder, SalesOrderQueryParams } from '../types';

export class SalesOrderService {
  private readonly baseUrl = '/sales-orders';

  async getSalesOrders(params?: SalesOrderQueryParams): Promise<PaginatedResponse<SalesOrder>> {
    const response = await apiClient.get<ApiResponse<any>>(this.baseUrl, { params });

    const backendData = response.data.data;
    if (!backendData) {
      throw new Error('后端返回的数据结构异常：缺少data字段');
    }

    // 数据格式转换（兼容扁平与嵌套分页结构）
    const list: SalesOrder[] = backendData?.data || [];
    const total: number = backendData?.total ?? backendData?.pagination?.total ?? 0;
    const page: number = backendData?.page ?? backendData?.pagination?.page ?? 1;
    const pageSize: number = backendData?.pageSize ?? backendData?.pagination?.pageSize ?? 10;

    return {
      success: response.data.success,
      data: list,
      pagination: { total, page, pageSize },
      message: response.data.message,
      timestamp: response.data.timestamp,
    };
  }

  async getById(id: string): Promise<ApiResponse<SalesOrder>> {
    const response = await apiClient.get<ApiResponse<SalesOrder>>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const salesOrderService = new SalesOrderService();