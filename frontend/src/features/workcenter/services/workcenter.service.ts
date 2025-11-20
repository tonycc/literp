import apiClient from '@/shared/services/api';
import type { 
  WorkcenterApi,
  UpdateWorkcenterRequest,
  WorkcenterQueryParams,
  WorkcenterInfo,
  WorkcenterOption,
  PaginatedResponse,
  ApiResponse,
  CreateWorkcenterRequest,
  WorkcenterValidateCodeRequest
} from '@zyerp/shared';

class WorkcenterService implements WorkcenterApi {
  private readonly baseUrl = '/workcenters';

  async getList(params?: WorkcenterQueryParams): Promise<PaginatedResponse<WorkcenterInfo>> {
    const response = await apiClient.get<ApiResponse<{
      data: WorkcenterInfo[];
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
    _active?: boolean,
    _type?: string
  }): Promise<ApiResponse<WorkcenterOption[]>> {
    const response = await apiClient.get<ApiResponse<WorkcenterOption[]>>(`${this.baseUrl}/options`, { 
      params: {
        active: params?._active,
        type: params?._type
      }
    });
    return response.data;
  }

  async getById(_id: string): Promise<ApiResponse<WorkcenterInfo>> {
    const response = await apiClient.get<ApiResponse<WorkcenterInfo>>(`${this.baseUrl}/${_id}`);
    return response.data;
  }

  async getByCode(_code: string): Promise<ApiResponse<WorkcenterInfo>> {
    const response = await apiClient.get<ApiResponse<WorkcenterInfo>>(`${this.baseUrl}/code/${_code}`);
    return response.data;
  }

  async create(_data: CreateWorkcenterRequest): Promise<ApiResponse<WorkcenterInfo>> {
    const response = await apiClient.post<ApiResponse<WorkcenterInfo>>(this.baseUrl, _data);
    return response.data;
  }

  async update(_id: string, _data: UpdateWorkcenterRequest): Promise<ApiResponse<WorkcenterInfo>> {
    const response = await apiClient.put<ApiResponse<WorkcenterInfo>>(`${this.baseUrl}/${_id}`, _data);
    return response.data;
  }

  async delete(_id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${_id}`);
    return response.data;
  }

  /**
   * 切换工作中心状态
   */
  async toggleStatus(_id: string, _isActive: boolean): Promise<ApiResponse<WorkcenterInfo>> {
    const response = await apiClient.patch<ApiResponse<WorkcenterInfo>>(`${this.baseUrl}/${_id}/status`, { isActive: _isActive });
    return response.data;
  }

  /**
   * 验证工作中心编码唯一性
   */
  async validateCode(data: WorkcenterValidateCodeRequest): Promise<ApiResponse<{ isValid: boolean; isUnique: boolean; message?: string }>> {
    const response = await apiClient.post<ApiResponse<{ isValid: boolean; isUnique: boolean; message?: string }>>(`${this.baseUrl}/validate-code`, data);
    return response.data;
  }

  /**
   * 更新车间成员
   */
  async updateTeamMembers(_id: string, _memberIds: string[]): Promise<ApiResponse<WorkcenterInfo>> {
    const response = await apiClient.put<ApiResponse<WorkcenterInfo>>(`${this.baseUrl}/${_id}/members`, { memberIds: _memberIds });
    return response.data;
  }

  /**
   * 获取车间成员
   */
  async getTeamMembers(_id: string): Promise<ApiResponse<{ members: string[] }>> {
    const response = await apiClient.get<ApiResponse<{ members: string[] }>>(`${this.baseUrl}/${_id}/members`);
    return response.data;
  }

  /**
   * 更新排班信息
   */
  async updateShiftSchedule(_id: string, _schedule: Record<string, unknown>): Promise<ApiResponse<WorkcenterInfo>> {
    const response = await apiClient.put<ApiResponse<WorkcenterInfo>>(`${this.baseUrl}/${_id}/schedule`, { schedule: _schedule });
    return response.data;
  }

  /**
   * 获取排班信息
   */
  async getShiftSchedule(_id: string): Promise<ApiResponse<{ schedule: Record<string, unknown> }>> {
    const response = await apiClient.get<ApiResponse<{ schedule: Record<string, unknown> }>>(`${this.baseUrl}/${_id}/schedule`);
    return response.data;
  }
}

// 创建服务实例
export const workcenterService = new WorkcenterService();
export type { WorkcenterService };
export default workcenterService;