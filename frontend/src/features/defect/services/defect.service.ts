import apiClient from '@/shared/services/api';
import type { ApiResponse } from '@zyerp/shared';

export interface Defect {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DefectListParams {
  current?: number;
  pageSize?: number;
  keyword?: string;
  isActive?: boolean;
}

export interface DefectListResult {
  data: Defect[];
  success: boolean;
  total: number;
}

export class DefectService {
  static async getList(params: DefectListParams): Promise<DefectListResult> {
    const response = await apiClient.get<ApiResponse<{
      data: Defect[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>>('/defects', {
      params: {
        page: params.current,
        pageSize: params.pageSize,
        keyword: params.keyword,
        isActive: params.isActive,
      },
    });

    return {
      data: response.data.data.data,
      success: response.data.success,
      total: response.data.data.total,
    };
  }

  static async getActiveList(): Promise<ApiResponse<Defect[]>> {
    const response = await apiClient.get<ApiResponse<Defect[]>>('/defects/active');
    return response.data;
  }

  static async create(data: Partial<Defect>): Promise<ApiResponse<Defect>> {
    const response = await apiClient.post<ApiResponse<Defect>>('/defects', data);
    return response.data;
  }

  static async update(id: string, data: Partial<Defect>): Promise<ApiResponse<Defect>> {
    const response = await apiClient.put<ApiResponse<Defect>>(`/defects/${id}`, data);
    return response.data;
  }

  static async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/defects/${id}`);
    return response.data;
  }
}
