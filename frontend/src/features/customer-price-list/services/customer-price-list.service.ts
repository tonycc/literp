import apiClient from '@/shared/services/api';
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared';
import type { CustomerPriceList, CustomerPriceListParams, CreateCustomerPriceListData, UpdateCustomerPriceListData } from '../types';

export class CustomerPriceListService {
  private readonly baseUrl = '/customer-price-lists';

  async getList(params?: CustomerPriceListParams): Promise<PaginatedResponse<CustomerPriceList>> {
    const response = await apiClient.get<ApiResponse<{ data: CustomerPriceList[]; pagination: { page: number; pageSize: number; total: number } }>>(
      this.baseUrl,
      { params }
    );
    const backend = response.data.data as unknown as { data: CustomerPriceList[]; pagination: { page: number; pageSize: number; total: number } };
    return {
      success: response.data.success,
      data: backend?.data || [],
      pagination: {
        page: backend?.pagination?.page || 1,
        pageSize: backend?.pagination?.pageSize || 10,
        total: backend?.pagination?.total || 0,
      },
      message: response.data.message,
      timestamp: response.data.timestamp,
    };
  }

  async getById(id: string): Promise<ApiResponse<CustomerPriceList>> {
    const response = await apiClient.get<ApiResponse<CustomerPriceList>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateCustomerPriceListData): Promise<ApiResponse<CustomerPriceList>> {
    const response = await apiClient.post<ApiResponse<CustomerPriceList>>(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateCustomerPriceListData): Promise<ApiResponse<CustomerPriceList>> {
    const response = await apiClient.put<ApiResponse<CustomerPriceList>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const customerPriceListService = new CustomerPriceListService();