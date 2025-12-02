import apiClient from '@/shared/services/api';
import type { 
  ProductInfo, 
  ProductFormData, 
  ProductQueryParams, 
  ProductImportResult,
  ProductExportData,
  ProductSpecification,
  ProductImage,
  ProductAlternativeUnit,
  ApiResponse, 
  PaginatedResponse,
  ProductCreateWithVariantsInput,
  ProductAttributeLineInput,
} from '@zyerp/shared';

export type ProductListParams = ProductQueryParams;

export class ProductService {
  private readonly baseUrl = '/products';

  // ==================== 产品基础CRUD操作 ====================

  // 获取产品列表
  async getProducts(params?: ProductQueryParams): Promise<PaginatedResponse<ProductInfo>> {
    const response = await apiClient.get<ApiResponse<{
      data: ProductInfo[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>>(this.baseUrl, { params });
    
    // 转换后端数据结构为前端期望的格式
    const backendData = response.data.data;
    
    if (!backendData) {
      throw new Error('后端返回的数据结构异常：缺少data字段');
    }
    
    const result = {
      success: response.data.success,
      data: backendData.data || [],
      message: response.data.message,
      timestamp: response.data.timestamp,
      pagination: {
        page: backendData.pagination?.page || 1,
        pageSize: backendData.pagination?.pageSize || 10,
        total: backendData.pagination?.total || 0,
      },
    };
    
    return result;
  }

  // 根据ID获取产品详情
  async getProductById(id: string): Promise<ApiResponse<ProductInfo>> {
    const response = await apiClient.get<ApiResponse<ProductInfo>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // 根据编码获取产品详情
  async getProductByCode(code: string): Promise<ApiResponse<ProductInfo>> {
    const response = await apiClient.get<ApiResponse<ProductInfo>>(`${this.baseUrl}/code/${code}`);
    return response.data;
  }

  // 复制产品
  async copyProduct(id: string, changes?: Partial<ProductFormData>): Promise<ApiResponse<ProductInfo>> {
    const response = await apiClient.post<ApiResponse<ProductInfo>>(`${this.baseUrl}/${id}/copy`, {
      changes
    });
    return response.data;
  }

  // 创建产品
  async createProduct(data: ProductFormData & { attributeLines?: ProductAttributeLineInput[] }): Promise<ApiResponse<ProductInfo>> {
    try {
      const response = await apiClient.post<ApiResponse<ProductInfo>>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('[ProductService] createProduct error:', error);
      throw error;
    }
  }

  async createProductWithVariants(data: ProductCreateWithVariantsInput): Promise<ApiResponse<{ product: ProductInfo; variants: ProductInfo[] }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ product: ProductInfo; variants: ProductInfo[] }>>(`${this.baseUrl}/with-variants`, data);
      return response.data;
    } catch (error) {
      console.error('[ProductService] createProductWithVariants error:', error);
      throw error;
    }
  }

  // 更新产品
  async updateProduct(id: string, data: ProductFormData): Promise<ApiResponse<ProductInfo>> {
    const response = await apiClient.put<ApiResponse<ProductInfo>>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // 删除产品
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // ==================== 产品状态管理 ====================

  // 切换产品状态
  async toggleProductStatus(id: string): Promise<ApiResponse<ProductInfo>> {
    const response = await apiClient.patch<ApiResponse<ProductInfo>>(`${this.baseUrl}/${id}/toggle-status`);
    return response.data;
  }

  // 批量更新产品状态
  async batchUpdateStatus(ids: string[], status: 'active' | 'inactive'): Promise<ApiResponse<{ success: number; failed: number }>> {
    const response = await apiClient.patch<ApiResponse<{ success: number; failed: number }>>(`${this.baseUrl}/batch/status`, {
      ids,
      status
    });
    return response.data;
  }

  // ==================== 产品查询和搜索 ====================

  // 搜索产品
  async searchProducts(keyword: string, params?: Partial<ProductQueryParams>): Promise<PaginatedResponse<ProductInfo>> {
    const searchParams = { ...params, keyword };
    return this.getProducts(searchParams as ProductQueryParams);
  }

  // 获取产品选项（用于下拉选择）
  async getProductOptions(params?: { categoryId?: string; keyword?: string; activeOnly?: boolean }): Promise<ApiResponse<Array<{ id: string; code: string; name: string; specification?: string; unit?: { name: string; symbol: string }; primaryImageUrl?: string }>>> {
    const response = await apiClient.get<ApiResponse<Array<{ id: string; code: string; name: string; specification?: string; unit?: { name: string; symbol: string }; primaryImageUrl?: string }>>>(`${this.baseUrl}/options`, { params });
    return response.data;
  }

  // 验证产品编码唯一性（统一响应格式）
  async validateProductCode(code: string, excludeId?: string): Promise<ApiResponse<{ isValid: boolean; message?: string }>> {
    // 后端实际路由为 /products/check-code/:code，返回 { available: boolean }
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
      `${this.baseUrl}/check-code/${encodeURIComponent(code)}`,
      { params: { excludeId } }
    );

    const backend = response.data;
    return {
      success: backend.success,
      data: {
        isValid: backend.data?.available ?? true,
        message: backend.message,
      },
      message: backend.message,
      timestamp: backend.timestamp,
    };
  }

  // ==================== 产品导入导出 ====================

  // 批量删除产品
  async batchDeleteProducts(ids: string[]): Promise<ApiResponse<{ success: number; failed: number }>> {
    const response = await apiClient.delete<ApiResponse<{ success: number; failed: number }>>(`${this.baseUrl}/batch`, {
      data: { ids }
    });
    return response.data;
  }

  // 导入产品
  async importProducts(file: File, options?: { skipDuplicates?: boolean; updateExisting?: boolean }): Promise<ApiResponse<ProductImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    
    const response = await apiClient.post<ApiResponse<ProductImportResult>>(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 导出产品
  async exportProducts(params: ProductQueryParams & { format?: 'excel' | 'csv' }): Promise<ApiResponse<ProductExportData>> {
    const response = await apiClient.get<ApiResponse<ProductExportData>>(`${this.baseUrl}/export`, { params });
    return response.data;
  }

  // 下载产品导入模板
  async downloadImportTemplate(): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/import/template`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ==================== 产品规格管理 ====================

  // 获取产品规格列表
  async getProductSpecifications(productId: string): Promise<ApiResponse<ProductSpecification[]>> {
    const response = await apiClient.get<ApiResponse<ProductSpecification[]>>(`${this.baseUrl}/${productId}/specifications`);
    return response.data;
  }

  // 添加产品规格
  async addProductSpecification(productId: string, data: Omit<ProductSpecification, 'id' | 'productId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ProductSpecification>> {
    const response = await apiClient.post<ApiResponse<ProductSpecification>>(`${this.baseUrl}/${productId}/specifications`, data);
    return response.data;
  }

  // 更新产品规格
  async updateProductSpecification(specId: string, data: Partial<Omit<ProductSpecification, 'id' | 'productId' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<ProductSpecification>> {
    const response = await apiClient.put<ApiResponse<ProductSpecification>>(`${this.baseUrl}/specifications/${specId}`, data);
    return response.data;
  }

  // 删除产品规格
  async deleteProductSpecification(specId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/specifications/${specId}`);
    return response.data;
  }

  // ==================== 产品图片管理 ====================

  // 获取产品图片列表
  async getProductImages(productId: string): Promise<ApiResponse<ProductImage[]>> {
    const response = await apiClient.get<ApiResponse<ProductImage[]>>(`${this.baseUrl}/${productId}/images`);
    return response.data;
  }

  // 上传产品图片
  async uploadProductImage(productId: string, file: File): Promise<ApiResponse<ProductImage>> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post<ApiResponse<ProductImage>>(`${this.baseUrl}/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 设置主图
  async setPrimaryImage(imageId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`${this.baseUrl}/images/${imageId}/primary`);
    return response.data;
  }

  // 更新产品图片信息
  async updateProductImage(imageId: string, data: { altText?: string; sortOrder?: number }): Promise<ApiResponse<ProductImage>> {
    const response = await apiClient.put<ApiResponse<ProductImage>>(`${this.baseUrl}/images/${imageId}`, data);
    return response.data;
  }

  // 删除产品图片
  async deleteProductImage(imageId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/images/${imageId}`);
    return response.data;
  }

  // 批量上传产品图片
  async batchUploadImages(productId: string, files: File[]): Promise<ApiResponse<ProductImage[]>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file);
    });
    
    const response = await apiClient.post<ApiResponse<ProductImage[]>>(`${this.baseUrl}/${productId}/images/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 更新图片排序
  async updateImageOrder(productId: string, imageOrders: Array<{ id: string; sortOrder: number }>): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`${this.baseUrl}/${productId}/images/order`, {
      imageOrders
    });
    return response.data;
  }

  // ==================== 产品替代单位管理 ====================

  // 获取产品替代单位列表
  async getAlternativeUnits(productId: string): Promise<ApiResponse<ProductAlternativeUnit[]>> {
    const response = await apiClient.get<ApiResponse<ProductAlternativeUnit[]>>(`${this.baseUrl}/${productId}/alternative-units`);
    return response.data;
  }

  // 添加替代单位
  async addAlternativeUnit(productId: string, data: Omit<ProductAlternativeUnit, 'id' | 'productId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ProductAlternativeUnit>> {
    const response = await apiClient.post<ApiResponse<ProductAlternativeUnit>>(`${this.baseUrl}/${productId}/alternative-units`, data);
    return response.data;
  }

  // 更新替代单位
  async updateAlternativeUnit(unitId: string, data: Partial<Omit<ProductAlternativeUnit, 'id' | 'productId' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<ProductAlternativeUnit>> {
    const response = await apiClient.put<ApiResponse<ProductAlternativeUnit>>(`${this.baseUrl}/alternative-units/${unitId}`, data);
    return response.data;
  }

  // 删除替代单位
  async deleteAlternativeUnit(unitId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/alternative-units/${unitId}`);
    return response.data;
  }

  // 设置默认替代单位
  async setDefaultAlternativeUnit(productId: string, unitId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`${this.baseUrl}/${productId}/alternative-units/${unitId}/default`);
    return response.data;
  }

  // ==================== 兼容性方法 ====================

  // 获取产品详情（兼容旧方法名）
  async getProductDetail(id: string): Promise<ApiResponse<ProductInfo>> {
    return this.getProductById(id);
  }
}

export const productService = new ProductService();
export default productService;
