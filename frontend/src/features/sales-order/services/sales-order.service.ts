import apiClient from '@/shared/services/api';
import { mapPaginatedResponse } from '@/shared/services/pagination';
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared';
import type { SalesOrder, SalesOrderListParams, SalesOrderItem } from '@zyerp/shared';

export class SalesOrderService {
  private readonly baseUrl = '/sales-orders';

  async getSalesOrders(params?: SalesOrderListParams): Promise<PaginatedResponse<SalesOrder>> {
    const response = await apiClient.get<ApiResponse<unknown>>(this.baseUrl, { params });
    return mapPaginatedResponse<SalesOrder>(response.data);
  }

  async getById(id: string): Promise<ApiResponse<SalesOrder>> {
    const response = await apiClient.get<ApiResponse<SalesOrder>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async getItems(id: string): Promise<ApiResponse<SalesOrderItem[]>> {
    const response = await apiClient.get<ApiResponse<SalesOrderItem[]>>(`${this.baseUrl}/${id}/items`);
    return response.data;
  }

  async createSalesOrder(data: Partial<SalesOrder>): Promise<ApiResponse<SalesOrder>> {
    const response = await apiClient.post<ApiResponse<SalesOrder>>(this.baseUrl, data);
    return response.data;
  }

  async updateSalesOrder(id: string, data: Partial<SalesOrder>): Promise<ApiResponse<SalesOrder>> {
    const response = await apiClient.put<ApiResponse<SalesOrder>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteSalesOrder(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const salesOrderService = new SalesOrderService();