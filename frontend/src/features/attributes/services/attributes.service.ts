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

  static async createAttribute(data: Partial<AttributeInfo>): Promise<boolean> {
    const resp = await apiClient.post<ApiResponse<AttributeInfo>>(this.baseUrl, data)
    return !!resp.data?.success
  }

  static async updateAttribute(id: string, data: Partial<AttributeInfo>): Promise<boolean> {
    const resp = await apiClient.patch<ApiResponse<AttributeInfo>>(`${this.baseUrl}/${id}`, data)
    return !!resp.data?.success
  }

  static async deleteAttribute(id: string): Promise<boolean> {
    const resp = await apiClient.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`)
    return !!resp.data?.success
  }

  static async getAttributeValues(attributeId: string, params?: { page?: number; pageSize?: number }): Promise<{ success: boolean; data: AttributeValueInfo[]; total: number }> {
    const resp = await apiClient.get<ApiResponse<{ data: AttributeValueInfo[]; total: number; page: number; pageSize: number; totalPages: number }>>(
      `${this.baseUrl}/${attributeId}/values`,
      { params }
    )
    const payload: { data: AttributeValueInfo[]; total: number; page: number; pageSize: number; totalPages: number } =
      resp.data?.data ?? { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
    return {
      success: !!resp.data?.success,
      data: payload.data || [],
      total: payload.total || 0,
    }
  }

  static async createAttributeValues(attributeId: string, values: Array<Partial<AttributeValueInfo>>): Promise<boolean> {
    const resp = await apiClient.post<ApiResponse<boolean>>(`${this.baseUrl}/${attributeId}/values`, { values })
    return !!resp.data?.success
  }

  static async updateAttributeValue(valueId: string, data: Partial<AttributeValueInfo>): Promise<boolean> {
    const resp = await apiClient.patch<ApiResponse<boolean>>(`${this.baseUrl}/values/${valueId}`, data)
    return !!resp.data?.success
  }

  static async deleteAttributeValue(valueId: string): Promise<boolean> {
    try {
      const resp = await apiClient.delete<ApiResponse<boolean>>(`${this.baseUrl}/values/${valueId}`)
      return !!resp.data?.success
    } catch {
      return false
    }
  }
}

export default AttributesService
