import apiClient from '../../../shared/services/api';
import type { 
  RoutingApi,
  UpdateRoutingRequest,
  RoutingQueryParams,
  RoutingInfo,
  RoutingOption,
  PaginatedResponse,
  ApiResponse,
  CreateRoutingRequest,
  RoutingValidateCodeRequest,
  WorkcenterOption,
  RoutingWorkcenterInfo
} from '@zyerp/shared';
import type { OperationOption } from '@zyerp/shared';

class RoutingService implements RoutingApi {
  private readonly baseUrl = '/routings';

  async getList(params?: RoutingQueryParams): Promise<PaginatedResponse<RoutingInfo>> {
    const response = await apiClient.get<ApiResponse<{
      data: RoutingInfo[];
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
    _active?: boolean 
  }): Promise<ApiResponse<RoutingOption[]>> {
    const response = await apiClient.get<ApiResponse<RoutingOption[]>>(`${this.baseUrl}/options`, { 
      params 
    });
    return response.data;
  }

  async getById(_id: string): Promise<ApiResponse<RoutingInfo>> {
    const response = await apiClient.get<ApiResponse<RoutingInfo>>(`${this.baseUrl}/${_id}`);
    return response.data;
  }

  async getByCode(_code: string): Promise<ApiResponse<RoutingInfo>> {
    const response = await apiClient.get<ApiResponse<RoutingInfo>>(`${this.baseUrl}/code/${_code}`);
    return response.data;
  }

  async create(_data: CreateRoutingRequest): Promise<ApiResponse<RoutingInfo>> {
    const response = await apiClient.post<ApiResponse<RoutingInfo>>(this.baseUrl, _data);
    return response.data;
  }

  async update(_id: string, _data: UpdateRoutingRequest): Promise<ApiResponse<RoutingInfo>> {
    const response = await apiClient.put<ApiResponse<RoutingInfo>>(`${this.baseUrl}/${_id}`, _data);
    return response.data;
  }

  async delete(_id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${_id}`);
    return response.data;
  }

  /**
   * 切换工艺路线状态
   */
  async toggleStatus(_id: string, _isActive: boolean): Promise<ApiResponse<RoutingInfo>> {
    const response = await apiClient.patch<ApiResponse<RoutingInfo>>(`${this.baseUrl}/${_id}/status`, { isActive: _isActive });
    return response.data;
  }

  /**
   * 验证工艺路线编码唯一性
   */
  async validateCode(data: RoutingValidateCodeRequest): Promise<ApiResponse<{ isValid: boolean; isUnique: boolean; message?: string }>> {
    const response = await apiClient.post<ApiResponse<{ isValid: boolean; isUnique: boolean; message?: string }>>(`${this.baseUrl}/validate-code`, data);
    return response.data;
  }

  /**
   * 获取工作中心选项
   */
  async getWorkcenterOptions(params?: { 
    _active?: boolean 
  }): Promise<ApiResponse<WorkcenterOption[]>> {
    const response = await apiClient.get<ApiResponse<WorkcenterOption[]>>(`/workcenters/options`, { 
      params 
    });
    return response.data;
  }

  /**
   * 获取工序选项
   */
  async getOperationOptions(params?: { 
    _active?: boolean 
  }): Promise<ApiResponse<OperationOption[]>> {
    const response = await apiClient.get<ApiResponse<OperationOption[]>>(`/operations/options`, { 
      params 
    });
    return response.data;
  }

  /**
   * 获取指定工艺路线的工序列表
   */
  async getOperations(_id: string): Promise<ApiResponse<RoutingWorkcenterInfo[]>> {
    const response = await apiClient.get<ApiResponse<RoutingWorkcenterInfo[]>>(`${this.baseUrl}/${_id}/operations`);
    return response.data;
  }
}

// 创建服务实例
export const routingService = new RoutingService();
export type { RoutingService };
export default routingService;