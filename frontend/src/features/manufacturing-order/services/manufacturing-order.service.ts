import apiClient from '@/shared/services/api'
import { mapPaginatedResponse } from '@/shared/services/pagination'
import type { AxiosError } from 'axios'
import type { ApiResponse, ManufacturingOrder, ManufacturingOrderCreateFromPlanRequest, ManufacturingOrderListParams, WorkOrder, GenerateWorkOrdersRequest } from '@zyerp/shared'

class ManufacturingOrderService {
  private readonly baseUrl = '/manufacturing-order'

  async createFromPlan(data: ManufacturingOrderCreateFromPlanRequest): Promise<ApiResponse<ManufacturingOrder[]>> {
    try {
      const resp = await apiClient.post<ApiResponse<ManufacturingOrder[]>>(`${this.baseUrl}/from-plan`, data)
      return resp.data
    } catch (e) {
      const err = e as AxiosError<ApiResponse<ManufacturingOrder[]>>
      const payload = err.response?.data
      if (payload && typeof payload === 'object') {
        return payload
      }
      return {
        success: false,
        message: err.message,
        timestamp: new Date().toISOString(),
      } as ApiResponse<ManufacturingOrder[]>
    }
  }

  async getList(params: ManufacturingOrderListParams) {
    const resp = await apiClient.get<ApiResponse<unknown>>(this.baseUrl, { params })
    return mapPaginatedResponse<ManufacturingOrder>(resp.data)
  }

  async getById(id: string): Promise<ApiResponse<ManufacturingOrder>> {
    const resp = await apiClient.get<ApiResponse<ManufacturingOrder>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async confirm(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/${id}/confirm`)
    return resp.data
  }

  async cancel(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/${id}/cancel`)
    return resp.data
  }

  async generateWorkOrders(id: string, data?: GenerateWorkOrdersRequest): Promise<ApiResponse<WorkOrder[]>> {
    const resp = await apiClient.post<ApiResponse<WorkOrder[]>>(`${this.baseUrl}/${id}/generate-work-orders`, data)
    return resp.data
  }

  async getWorkOrders(id: string): Promise<ApiResponse<WorkOrder[]>> {
    const resp = await apiClient.get<ApiResponse<WorkOrder[]>>(`${this.baseUrl}/${id}/work-orders`)
    return resp.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const resp = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
    return resp.data
  }
}

export const manufacturingOrderService = new ManufacturingOrderService()
export default manufacturingOrderService