import apiClient from '@/shared/services/api';
import type { ApiResponse, PaginatedResponse, Customer, CustomerListParams, CreateCustomerData, UpdateCustomerData } from '@zyerp/shared';

export class CustomerService {
  private readonly baseUrl = '/customers';

  async getCustomerOptions(params?: { keyword?: string; activeOnly?: boolean }): Promise<ApiResponse<Array<{ id: string; code?: string; name: string }>>> {
    const response = await apiClient.get<ApiResponse<Array<{ id: string; code?: string; name: string }>>>(`${this.baseUrl}/options`, { params });
    return response.data;
  }

  async getCustomerList(params?: CustomerListParams): Promise<PaginatedResponse<Customer>> {
    const response = await apiClient.get<ApiResponse<{ data: Customer[]; pagination: { page: number; pageSize: number; total: number } }>>(
      this.baseUrl,
      { params }
    );
    const backend = response.data.data;
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

  async getById(id: string): Promise<ApiResponse<Customer>> {
    const response = await apiClient.get<ApiResponse<Customer>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreateCustomerData): Promise<ApiResponse<Customer>> {
    const response = await apiClient.post<ApiResponse<Customer>>(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdateCustomerData): Promise<ApiResponse<Customer>> {
    const response = await apiClient.put<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    return response.data;
  }
}

export const customerService = new CustomerService();