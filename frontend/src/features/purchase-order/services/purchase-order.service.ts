import apiClient from '@/shared/services/api';
import type { ApiResponse, PaginatedResponse, PurchaseOrder, PurchaseOrderDetail, PurchaseOrderFormData, PurchaseOrderListParams } from '@zyerp/shared';

export class PurchaseOrderService {
  private readonly baseUrl = '/purchase-orders';

  async getList(params?: PurchaseOrderListParams): Promise<PaginatedResponse<PurchaseOrder>> {
    const response = await apiClient.get<
      ApiResponse<{
        data: PurchaseOrder[];
        total: number;
        page: number;
        pageSize: number;
        totalPages?: number;
      }>
    >(this.baseUrl, { params });

    const backendData = response.data.data;
    if (!backendData) {
      throw new Error('后端返回的数据结构异常：缺少data字段');
    }

    const list: PurchaseOrder[] = backendData.data || [];
    const total: number = backendData.total ?? 0;
    const page: number = backendData.page ?? 1;
    const pageSize: number = backendData.pageSize ?? 10;

    return {
      success: response.data.success,
      data: list,
      pagination: { total, page, pageSize },
      message: response.data.message,
      timestamp: response.data.timestamp,
    };
  }

  async getById(id: string): Promise<ApiResponse<PurchaseOrderDetail>> {
    const response = await apiClient.get<ApiResponse<PurchaseOrderDetail>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: PurchaseOrderFormData): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiClient.post<ApiResponse<PurchaseOrder>>(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: PurchaseOrderFormData): Promise<ApiResponse<PurchaseOrder>> {
    const response = await apiClient.put<ApiResponse<PurchaseOrder>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const purchaseOrderService = new PurchaseOrderService();