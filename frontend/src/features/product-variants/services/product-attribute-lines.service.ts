import apiClient from '@/shared/services/api'
import type { ApiResponse } from '@zyerp/shared'

export class ProductAttributeLinesService {
  static async getLines(productId: string): Promise<{ success: boolean; data: { attributeName: string; values: string[] }[] }> {
    const resp = await apiClient.get<ApiResponse<{ data: { id: string; attributeId: string; attributeName: string; values: string[] }[]; total: number; page: number; pageSize: number; totalPages: number }>>(`/products/${productId}/attribute-lines`)
    return { success: !!resp.data.success, data: (resp.data.data?.data || []).map((l) => ({ attributeName: l.attributeName, values: l.values })) }
  }
  static async save(productId: string, lines: Array<{ attributeName: string; values: string[] }>): Promise<boolean> {
    const resp = await apiClient.post<ApiResponse<boolean>>(`/products/${productId}/attribute-lines/save`, { lines })
    return !!resp.data.success
  }
  static async create(productId: string, line: { attributeName: string; values: string[] }): Promise<boolean> {
    const resp = await apiClient.post<ApiResponse<boolean>>(`/products/${productId}/attribute-lines`, line)
    return !!resp.data.success
  }
  static async update(productId: string, lineId: string, line: { attributeName?: string; values?: string[] }): Promise<boolean> {
    const resp = await apiClient.patch<ApiResponse<boolean>>(`/products/${productId}/attribute-lines/${lineId}`, line)
    return !!resp.data.success
  }
  static async delete(productId: string, lineId: string): Promise<boolean> {
    const resp = await apiClient.delete<ApiResponse<boolean>>(`/products/${productId}/attribute-lines/${lineId}`)
    return !!resp.data.success
  }
}
