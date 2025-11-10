/**
 * 仓库服务
 */

import apiClient from './api';
import type { 
  WarehouseInfo, 
  WarehouseQueryParams, 
  WarehouseListResponse,
  ApiResponse 
} from '@zyerp/shared';

export interface WarehouseOption {
  value: string;
  label: string;
  code: string;
  type: string;
}

class WarehouseService {
  private readonly baseUrl = '/warehouses';

  /**
   * 获取仓库列表
   */
  async getWarehouses(params?: WarehouseQueryParams): Promise<WarehouseListResponse> {
    const response = await apiClient.get<ApiResponse<{
      data: WarehouseInfo[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>>(this.baseUrl, { params });
    
    // 转换后端数据结构为前端期望的格式
    const backendData = response.data.data!;
    return {
      success: response.data.success,
      data: backendData.data,
      message: response.data.message,
      timestamp: new Date(response.data.timestamp),
      pagination: {
        page: backendData.page,
        pageSize: backendData.pageSize,
        total: backendData.total,
        totalPages: backendData.totalPages,
      },
    };
  }

  /**
   * 获取仓库选项（用于下拉选择）
   */
  async getOptions(params?: { type?: string; isActive?: boolean }): Promise<WarehouseOption[]> {
    const response = await apiClient.get<ApiResponse<WarehouseOption[]>>(`${this.baseUrl}/options`, { 
      params: {
        isActive: true,
        ...params
      }
    });
    
    // 后端已经返回了正确的选项格式，但需要重新构造 label
    return response.data.data!.map((warehouse: WarehouseOption) => ({
      value: warehouse.value,
      label: `${warehouse.label}(${warehouse.code})`,
      code: warehouse.code,
      type: warehouse.type,
    }));
  }

  /**
   * 根据ID获取仓库信息
   */
  async getWarehouseById(id: string): Promise<WarehouseInfo> {
    const response = await apiClient.get<ApiResponse<WarehouseInfo>>(`${this.baseUrl}/${id}`);
    return response.data.data!;
  }

  /**
   * 获取仓库类型选项
   */
  async getTypeOptions(): Promise<Array<{ value: string; label: string }>> {
    const response = await apiClient.get<ApiResponse<string[]>>(`${this.baseUrl}/types`);
    
    return response.data.data!.map((type: string) => ({
      value: type,
      label: type,
    }));
  }
}

export const warehouseService = new WarehouseService();
export default warehouseService;