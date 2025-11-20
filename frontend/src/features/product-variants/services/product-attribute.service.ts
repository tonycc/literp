import apiClient from '@/shared/services/api';
import type { ApiResponse } from '@zyerp/shared';

export interface ProductAttributeOption {
  id: string;
  name: string;
  values: string[];
}

export class ProductAttributeService {
  static async getAttributes(): Promise<{ success: boolean; data: ProductAttributeOption[] }> {
    const response = await apiClient.get<ApiResponse<{
      data: ProductAttributeOption[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>>('/product-attributes');

    return {
      success: !!response.data.success,
      data: response.data.data?.data || [],
    };
  }
}