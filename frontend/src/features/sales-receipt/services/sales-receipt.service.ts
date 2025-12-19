import apiClient from '@/shared/services/api';
import { mapPaginatedResponse } from '@/shared/services/pagination';
import type { 
  SalesReceiptInfo, 
  CreateSalesReceiptDto, 
  UpdateSalesReceiptDto, 
  SalesReceiptQueryParams,
  ApiResponse,
  PaginatedResponse
} from '@zyerp/shared';

class SalesReceiptService {
  private readonly baseUrl = '/sales-receipts';

  async getList(params: SalesReceiptQueryParams): Promise<PaginatedResponse<SalesReceiptInfo>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = await apiClient.get<unknown>(this.baseUrl, { params });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return mapPaginatedResponse<SalesReceiptInfo>(response.data);
  }

  async getById(id: string): Promise<ApiResponse<SalesReceiptInfo>> {
    const response = await apiClient.get<ApiResponse<SalesReceiptInfo>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateSalesReceiptDto): Promise<ApiResponse<SalesReceiptInfo>> {
    const response = await apiClient.post<ApiResponse<SalesReceiptInfo>>(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateSalesReceiptDto): Promise<ApiResponse<SalesReceiptInfo>> {
    const response = await apiClient.put<ApiResponse<SalesReceiptInfo>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async confirm(id: string): Promise<ApiResponse<SalesReceiptInfo>> {
    const response = await apiClient.post<ApiResponse<SalesReceiptInfo>>(`${this.baseUrl}/${id}/confirm`);
    return response.data;
  }

  async cancel(id: string): Promise<ApiResponse<SalesReceiptInfo>> {
    const response = await apiClient.post<ApiResponse<SalesReceiptInfo>>(`${this.baseUrl}/${id}/cancel`);
    return response.data;
  }
}

export const salesReceiptService = new SalesReceiptService();
