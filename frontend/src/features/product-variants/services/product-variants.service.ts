import apiClient from '@/shared/services/api';
import type { VariantInfo, ApiResponse, PaginationParams } from '@zyerp/shared';

export class ProductVariantsService {
  static async generateVariants(
    productId: string,
    attributes: { attributeName: string; values: string[] }[],
  ): Promise<ApiResponse<VariantInfo[]>> {
    // 将表单数组转换为后端期望的映射格式：Record<string, string[]>
    const payload: Record<string, string[]> = {};
    for (const item of attributes) {
      const key = String(item.attributeName || '').trim();
      const values = Array.isArray(item.values) ? item.values.map((v) => String(v)) : [];
      if (key && values.length) {
        payload[key] = values;
      }
    }
    const response = await apiClient.post<ApiResponse<VariantInfo[]>>(
      `/products/${productId}/variants/generate`,
      payload,
    );
    return response.data;
  }

  static async getVariants(
    productId: string,
    params: PaginationParams & Record<string, unknown>,
  ): Promise<{ data: VariantInfo[]; success: boolean; total: number }> {
    const response = await apiClient.get<ApiResponse<{
      data: VariantInfo[];
      pagination?: { total: number; page: number; pageSize: number; totalPages: number };
      total?: number;
      page?: number;
      pageSize?: number;
      totalPages?: number;
    }>>(`/products/${productId}/variants`, { params });

    const payload = (response.data.data ?? {}) as { data?: VariantInfo[]; pagination?: { total?: number }; total?: number }
    const total = (payload.pagination?.total ?? payload.total ?? 0) as number
    return {
      data: (payload.data || []) as VariantInfo[],
      success: response.data.success,
      total,
    };
  }

  static async batchCreate(
    productId: string,
    variants: Array<{ name: string; code: string; barcode?: string; variantAttributes?: Array<{ name: string; value: string }> }>,
  ): Promise<ApiResponse<{ success: number; failed: number; variants: VariantInfo[] }>> {
    const response = await apiClient.post<ApiResponse<{ success: number; failed: number; variants: VariantInfo[] }>>(
      `/products/${productId}/variants/batch`,
      { variants },
    );
    return response.data;
  }

  static async updateVariant(
    productId: string,
    variantId: string,
    payload: Partial<{ name: string; status: 'active' | 'inactive'; barcode?: string; qrCode?: string; minStock?: number; safetyStock?: number; maxStock?: number; reorderPoint?: number; standardPrice?: number; salePrice?: number; purchasePrice?: number; currency?: string }> & { variantAttributes?: Array<{ name: string; value: string }> },
  ): Promise<ApiResponse<VariantInfo>> {
    const response = await apiClient.patch<ApiResponse<VariantInfo>>(`/products/${productId}/variants/${variantId}`, payload);
    return response.data;
  }
  static async adjustVariantStock(
    productId: string,
    variantId: string,
    payload: { type: 'inbound' | 'outbound' | 'reserve' | 'release'; delta: number; warehouseId: string; unitId: string },
  ): Promise<ApiResponse<{ success: boolean }>> {
    const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
      `/products/${productId}/variants/${variantId}/stock/adjust`,
      payload,
    );
    return response.data;
  }

  static async listVariantImages(
    productId: string,
    variantId: string,
  ): Promise<ApiResponse<Array<{ id: string; url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>>> {
    const response = await apiClient.get<ApiResponse<Array<{ id: string; url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }>>>(`/products/${productId}/variants/${variantId}/images`);
    return response.data;
  }

  static async uploadVariantImage(
    productId: string,
    variantId: string,
    file: File,
  ): Promise<ApiResponse<{ id: string; url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<ApiResponse<{ id: string; url: string }>>(`/products/${productId}/variants/${variantId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async deleteVariantImage(
    productId: string,
    variantId: string,
    imageId: string,
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/products/${productId}/variants/${variantId}/images/${imageId}`);
    return response.data;
  }

  static async deleteVariant(
    productId: string,
    variantId: string,
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/products/${productId}/variants/${variantId}`)
    return response.data
  }
}
