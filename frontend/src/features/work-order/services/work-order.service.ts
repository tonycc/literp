import apiClient from '@/shared/services/api'
import { mapPaginatedResponse } from '@/shared/services/pagination'
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared'
import type { WorkOrderDetail, WorkOrderListParams, CreateWorkOrderRequest, WorkOrderStatus } from '@zyerp/shared'

class WorkOrderService {
  private readonly baseUrl = '/work-orders'

  async getList(params: WorkOrderListParams): Promise<PaginatedResponse<WorkOrderDetail>> {
    const resp = await apiClient.get<ApiResponse<unknown>>(this.baseUrl, { params })
    return mapPaginatedResponse<WorkOrderDetail>(resp.data)
  }

  async create(data: CreateWorkOrderRequest) {
    const resp = await apiClient.post<ApiResponse<WorkOrderDetail>>(this.baseUrl, data)
    return resp.data
  }

  async updateStatus(id: string, status: WorkOrderStatus) {
    const resp = await apiClient.patch<ApiResponse<WorkOrderDetail>>(`${this.baseUrl}/${id}/status`, { status })
    return resp.data
  }

  async delete(id: string) {
    const resp = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
    return resp.data
  }
}

export const workOrderService = new WorkOrderService()
export default workOrderService