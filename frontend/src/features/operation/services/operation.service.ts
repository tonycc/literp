import apiClient from '@/shared/services/api';
import type { 
  OperationApi,
  UpdateOperationRequest,
  OperationQueryParams,
  OperationInfo,
  OperationOption,
  PaginatedResponse,
  ApiResponse,
  CreateOperationRequest,
  OperationStats,
  OperationValidateCodeRequest,
  OperationValidateNameRequest
} from '@zyerp/shared';

class OperationService implements OperationApi {
  private readonly baseUrl = '/operations';

  async getList(params?: OperationQueryParams): Promise<PaginatedResponse<OperationInfo>> {
    const response = await apiClient.get<ApiResponse<{
      data: OperationInfo[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>>(this.baseUrl, { params });
    
    // 数据格式转换
    const backendData = response.data.data;
    return {
      success: response.data.success,
      data: backendData?.data || [],
      message: response.data.message,
      timestamp: response.data.timestamp,
      pagination: {
        page: backendData?.page || 1,
        pageSize: backendData?.pageSize || 10,
        total: backendData?.total || 0
      }
    };
  }

  async getOptions(params?: { 
    _isActive?: boolean 
  }): Promise<ApiResponse<OperationOption[]>> {
    const response = await apiClient.get<ApiResponse<OperationOption[]>>(`${this.baseUrl}/options`, { 
      params 
    });
    return response.data;
  }

  async getById(_id: string): Promise<ApiResponse<OperationInfo>> {
    const response = await apiClient.get<ApiResponse<OperationInfo>>(`${this.baseUrl}/${_id}`);
    return response.data;
  }

  async getByCode(_code: string): Promise<ApiResponse<OperationInfo>> {
    const response = await apiClient.get<ApiResponse<OperationInfo>>(`${this.baseUrl}/code/${_code}`);
    return response.data;
  }

  async create(_data: CreateOperationRequest): Promise<ApiResponse<OperationInfo>> {
    const response = await apiClient.post<ApiResponse<OperationInfo>>(this.baseUrl, _data);
    return response.data;
  }

  async update(_id: string, _data: UpdateOperationRequest): Promise<ApiResponse<OperationInfo>> {
    const response = await apiClient.put<ApiResponse<OperationInfo>>(`${this.baseUrl}/${_id}`, _data);
    return response.data;
  }

  async delete(_id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${_id}`);
    return response.data;
  }

  async toggleStatus(_id: string, _isActive: boolean): Promise<ApiResponse<void>> {
    const response = await apiClient.patch<ApiResponse<void>>(`${this.baseUrl}/${_id}/status`, { isActive: _isActive });
    return response.data;
  }

  async getStats(): Promise<ApiResponse<OperationStats>> {
    const response = await apiClient.get<ApiResponse<OperationStats>>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * 验证工序编码唯一性
   */
  async validateCode(data: OperationValidateCodeRequest): Promise<ApiResponse<{ isValid: boolean; isUnique: boolean; message?: string }>> {
    const response = await apiClient.post<ApiResponse<{ isValid: boolean; isUnique: boolean; message?: string }>>(`${this.baseUrl}/validate-code`, data);
    return response.data;
  }

  /**
   * 验证工序名称唯一性
   */
  async validateName(data: OperationValidateNameRequest): Promise<ApiResponse<{ isValid: boolean; isUnique: boolean; message?: string }>> {
    const response = await apiClient.post<ApiResponse<{ isValid: boolean; isUnique: boolean; message?: string }>>(`${this.baseUrl}/validate-name`, data);
    return response.data;
  }
}

// 创建服务实例
export const operationService = new OperationService();
export type { OperationService };
export default operationService;