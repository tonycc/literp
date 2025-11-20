/**
 * 仓库服务
 */

import apiClient from './api';
import { mapPaginatedResponse } from './pagination';
import type { 
  WarehouseInfo, 
  WarehouseQueryParams, 
  PaginatedResponse,
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
  async getWarehouses(params?: WarehouseQueryParams): Promise<PaginatedResponse<WarehouseInfo>> {
    const response = await apiClient.get<ApiResponse<unknown>>(this.baseUrl, { params });
    return mapPaginatedResponse<WarehouseInfo>(response.data);
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
