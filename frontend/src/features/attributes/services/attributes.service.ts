import apiClient from '@/shared/services/api'
import type { ApiResponse } from '@zyerp/shared'

export interface AttributeInfo {
  id: string
  name: string
  code?: string
  description?: string
  isActive?: boolean
  sortOrder?: number
  isGlobal?: boolean
  values?: string[]
  attributeValues?: AttributeValueInfo[]
}

export interface AttributeValueInfo {
  id: string
  attributeId: string
  name: string
  code?: string
  value?: string
  isActive?: boolean
  sortOrder?: number
}

export class AttributesService {
  private static baseUrl = '/product-attributes'

  static async getAttributes(params?: { page?: number; pageSize?: number; keyword?: string }): Promise<{ success: boolean; data: AttributeInfo[]; total: number }> {
    const resp = await apiClient.get<ApiResponse<{ data: AttributeInfo[]; total: number; page: number; pageSize: number; totalPages: number }>>(
      this.baseUrl,
      { params }
    )
    const payload: { data: AttributeInfo[]; total: number; page: number; pageSize: number; totalPages: number } =
      resp.data?.data ?? { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    return {
      success: !!resp.data?.success,
      data: payload.data || [],
      total: payload.total || 0,
    }
  }

  static async createAttribute(data: Partial<AttributeInfo>): Promise<{ success: boolean; data?: AttributeInfo; message?: string }> {
    try {
      const resp = await apiClient.post<ApiResponse<AttributeInfo>>(this.baseUrl, data)
      return { success: !!resp.data?.success, data: resp.data?.data, message: resp.data?.message }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return { success: false, message: err.response?.data?.message || '创建失败' }
    }
  }

  static async updateAttribute(id: string, data: Partial<AttributeInfo>): Promise<{ success: boolean; message?: string }> {
    try {
      const resp = await apiClient.patch<ApiResponse<AttributeInfo>>(`${this.baseUrl}/${id}`, data)
      return { success: !!resp.data?.success, message: resp.data?.message }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return { success: false, message: err.response?.data?.message || '更新失败' }
    }
  }

  static async deleteAttribute(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const resp = await apiClient.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`)
      return { success: !!resp.data?.success, message: resp.data?.message }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      return { success: false, message: err.response?.data?.message || '删除失败' }
    }
  }

  static async getAttributeValues(attributeId: string): Promise<{ success: boolean; data: AttributeValueInfo[] }> {
    try {
      const resp = await apiClient.get<ApiResponse<AttributeValueInfo[]>>(`${this.baseUrl}/${attributeId}/values`)
      return { success: !!resp.data?.success, data: resp.data?.data || [] }
    } catch{
      // Fallback: get attribute details if separate endpoint doesn't exist
      try {
        const allResp = await this.getAttributes({ page: 1, pageSize: 100, keyword: '' });
        const found = allResp.data.find(a => a.id === attributeId);
        return { success: true, data: found?.attributeValues || [] }
      } catch {
        return { success: false, data: [] }
      }
    }
  }
}

export default AttributesService
