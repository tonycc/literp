/**
 * 产品类别服务实现
 */

import apiClient from '@/shared/services/api';
import type { 
  ProductCategoryApi,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
  ProductCategoryTreeNode,
  ProductCategoryOption,
  GenerateCodeRequest,
  GenerateCodeResponse,
  ValidateCodeRequest,
  ValidateCodeResponse,
  BatchOperationRequest,
  BatchOperationResponse,
  ProductCategoryStats
} from '@/shared/src/interfaces/productCategory';
import type {
  ProductCategoryInfo,
  ProductCategoryQueryParams,
  ProductCategoryImportResult,
  ProductCategoryExportParams
} from '@/shared/src/types/productCategory';
import type { ApiResponse, PaginatedResponse, ID } from '@zyerp/shared';

/**
 * 产品类别服务类
 */
class ProductCategoryService implements ProductCategoryApi {
  private readonly baseUrl = '/product-categories';

  /**
   * 获取产品类别列表（分页）
   */
  async getList(params?: ProductCategoryQueryParams): Promise<PaginatedResponse<ProductCategoryInfo>> {
    const response = await apiClient.get<ApiResponse<{
      data: ProductCategoryInfo[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
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
        page: backendData.page || 1,
        pageSize: backendData.pageSize || 10,
        total: backendData.total || 0,
      },
    };
    
    return result;
  }

  /**
   * 获取产品类别树形结构
   */
  async getTree(params?: { isActive?: boolean }): Promise<ApiResponse<ProductCategoryTreeNode[]>> {
    const response = await apiClient.get(`${this.baseUrl}/tree`, { params });
    return response.data;
  }

  /**
   * 获取产品类别选项（用于下拉选择）
   */
  async getOptions(params?: { 
    level?: number; 
    parentCode?: string; 
    isActive?: boolean 
  }): Promise<ApiResponse<ProductCategoryOption[]>> {
    const response = await apiClient.get(`${this.baseUrl}/options`, { params });
    return response.data;
  }

  /**
   * 根据ID获取产品类别详情
   */
  async getById(id: ID): Promise<ApiResponse<ProductCategoryInfo>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * 根据编码获取产品类别详情
   */
  async getByCode(code: string): Promise<ApiResponse<ProductCategoryInfo>> {
    const response = await apiClient.get(`${this.baseUrl}/code/${code}`);
    return response.data;
  }

  /**
   * 创建产品类别
   */
  async create(data: CreateProductCategoryRequest): Promise<ApiResponse<ProductCategoryInfo>> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * 更新产品类别
   */
  async update(id: ID, data: UpdateProductCategoryRequest): Promise<ApiResponse<ProductCategoryInfo>> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * 删除产品类别
   */
  async delete(id: ID): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * 切换产品类别状态
   */
  async toggleStatus(id: ID, isActive: boolean): Promise<ApiResponse<void>> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/status`, { isActive });
    return response.data;
  }

  /**
   * 批量操作
   */
  async batchOperation(data: BatchOperationRequest): Promise<ApiResponse<BatchOperationResponse>> {
    const response = await apiClient.post(`${this.baseUrl}/batch`, data);
    return response.data;
  }

  /**
   * 生成产品类别编码
   */
  async generateCode(data: GenerateCodeRequest): Promise<ApiResponse<GenerateCodeResponse>> {
    const response = await apiClient.post(`${this.baseUrl}/generate-code`, data);
    return response.data;
  }

  /**
   * 验证产品类别编码
   */
  async validateCode(data: ValidateCodeRequest): Promise<ApiResponse<ValidateCodeResponse>> {
    const response = await apiClient.post(`${this.baseUrl}/validate-code`, data);
    return response.data;
  }

  /**
   * 获取产品类别统计信息
   */
  async getStats(): Promise<ApiResponse<ProductCategoryStats>> {
    const response = await apiClient.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * 调整排序
   */
  async updateSortOrder(data: Array<{ id: string; sortOrder: number }>): Promise<ApiResponse<void>> {
    const response = await apiClient.patch(`${this.baseUrl}/sort-order`, { items: data });
    return response.data;
  }

  /**
   * 移动类别（更改父级）
   */
  async moveCategory(id: ID, newParentCode?: string): Promise<ApiResponse<ProductCategoryInfo>> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/move`, { newParentCode });
    return response.data;
  }

  /**
   * 导入产品类别
   */
  async importCategories(file: File): Promise<ApiResponse<ProductCategoryImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`${this.baseUrl}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * 导出产品类别
   */
  async exportCategories(params: ProductCategoryExportParams): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * 获取产品类别层级路径
   */
  async getCategoryPath(code: string): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get(`${this.baseUrl}/${code}/path`);
    return response.data;
  }

  /**
   * 检查类别是否可以删除
   */
  async checkDeletable(id: ID): Promise<ApiResponse<{ 
    canDelete: boolean; 
    reason?: string; 
    relatedCount?: number 
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/check-deletable`);
    return response.data;
  }

  /**
   * 复制产品类别
   */
  async copyCategory(id: ID, data: { 
    name: string; 
    parentCode?: string; 
    includeChildren?: boolean 
  }): Promise<ApiResponse<ProductCategoryInfo>> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/copy`, data);
    return response.data;
  }
}

// 创建服务实例
export const productCategoryService = new ProductCategoryService();

// 导出服务类型
export type { ProductCategoryService };

// 默认导出
export default productCategoryService;