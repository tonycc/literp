import apiClient from '@/shared/services/api'
import { mapPaginatedResponse } from '@/shared/services/pagination'
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared'
import type { SubcontractOrder, SubcontractOrderListParams, SubcontractOrderGenerateRequest, SubcontractOrderGenerateResponse } from '@zyerp/shared'

class SubcontractOrderService {
  private readonly baseUrl = '/subcontract-orders'

  async getList(params: SubcontractOrderListParams): Promise<PaginatedResponse<SubcontractOrder>> {
    const resp = await apiClient.get<ApiResponse<unknown>>(this.baseUrl, { params })
    return mapPaginatedResponse<SubcontractOrder>(resp.data)
  }

  async getById(id: string) {
    const resp = await apiClient.get<ApiResponse<SubcontractOrder & { items: import('@zyerp/shared').SubcontractOrderItem[] }>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Omit<SubcontractOrder, 'id' | 'orderNo' | 'createdAt' | 'updatedAt' | 'status'>) {
    const resp = await apiClient.post<ApiResponse<SubcontractOrder>>(this.baseUrl, data)
    return resp.data
  }

  async updateStatus(id: string, status: string) {
    const resp = await apiClient.patch<ApiResponse<SubcontractOrder>>(`${this.baseUrl}/${id}/status`, { status })
    return resp.data
  }

  async delete(id: string) {
    const resp = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async generateByWorkOrders(data: SubcontractOrderGenerateRequest) {
    const resp = await apiClient.post<SubcontractOrderGenerateResponse>(`${this.baseUrl}/generate-by-work-orders`, data)
    return resp.data
  }
}

export const subcontractOrderService = new SubcontractOrderService()
export default subcontractOrderService