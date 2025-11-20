/**
 * 计量单位服务
 */

import apiClient from './api';
import { mapPaginatedResponse } from './pagination';
import type { 
  UnitInfo, 
  UnitQueryParams, 
  PaginatedResponse,
  ApiResponse 
} from '@zyerp/shared';

export interface UnitOption {
  value: string;
  label: string;
  symbol: string;
  category: string;
}

class UnitService {
  private readonly baseUrl = '/units';

  /**
   * 获取单位列表
   */
  async getUnits(params?: UnitQueryParams): Promise<PaginatedResponse<UnitInfo>> {
    // 转换前端参数为后端期望的格式
    const backendParams: Record<string, unknown> = {};
    if (params) {
      if (params.page !== undefined) backendParams.page = params.page;
      // 限制pageSize不超过100，以符合后端验证规则
      if (params.pageSize !== undefined) backendParams.limit = Math.min(params.pageSize, 100);
      if (params.keyword !== undefined) backendParams.search = params.keyword;
      if (params.category !== undefined) backendParams.category = params.category;
      if (params.isActive !== undefined) backendParams.isActive = params.isActive;
      if (params.sortField !== undefined) backendParams.sortBy = params.sortField;
      if (params.sortOrder !== undefined) backendParams.sortOrder = params.sortOrder;
    }
    
    const response = await apiClient.get<ApiResponse<unknown>>(this.baseUrl, { params: backendParams });
    return mapPaginatedResponse<UnitInfo>(response.data);
  }

  /**
   * 获取单位选项（用于下拉选择）
   */
  async getOptions(params?: { category?: string; isActive?: boolean }): Promise<UnitOption[]> {
    const response = await apiClient.get<ApiResponse<UnitOption[]>>(`${this.baseUrl}/options`, { 
      params: {
        isActive: true,
        ...params
      }
    });
    
    // 后端已经返回了正确的选项格式，但需要重新构造 label
    return response.data.data!
      .filter((unit: UnitOption) => unit.value && unit.label && unit.symbol)
      .map((unit: UnitOption) => ({
        value: unit.value,
        label: `${unit.label}(${unit.symbol})`,
        symbol: unit.symbol,
        category: unit.category,
      }));
  }

  /**
   * 根据ID获取单位信息
   */
  async getUnitById(id: string): Promise<UnitInfo> {
    const response = await apiClient.get<ApiResponse<UnitInfo>>(`${this.baseUrl}/${id}`);
    return response.data.data!;
  }

  /**
   * 获取单位分类选项
   */
  async getCategoryOptions(): Promise<Array<{ value: string; label: string }>> {
    const response = await apiClient.get<ApiResponse<string[]>>(`${this.baseUrl}/categories`);
    
    return response.data.data!.map((category: string) => ({
      value: category,
      label: category,
    }));
  }
}

export const unitService = new UnitService();
export default unitService;
