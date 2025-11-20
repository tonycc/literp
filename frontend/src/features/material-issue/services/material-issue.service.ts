import apiClient from '@/shared/services/api'
import { mapPaginatedResponse } from '@/shared/services/pagination'
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared'
import type { MaterialIssueOrder, MaterialIssueListParams } from '@zyerp/shared'

class MaterialIssueService {
  private readonly baseUrl = '/material-issue'

  async getList(params: MaterialIssueListParams): Promise<PaginatedResponse<MaterialIssueOrder>> {
    const resp = await apiClient.get<ApiResponse<unknown>>(`${this.baseUrl}/orders`, { params })
    return mapPaginatedResponse<MaterialIssueOrder>(resp.data)
  }

  async getById(id: string) {
    const resp = await apiClient.get<ApiResponse<MaterialIssueOrder>>(`${this.baseUrl}/orders/${id}`)
    return resp.data
  }

  async createForWorkOrder(workOrderId: string) {
    const resp = await apiClient.post<ApiResponse<MaterialIssueOrder>>(`${this.baseUrl}/work-orders/${workOrderId}`)
    return resp.data
  }

  async issueAll(workOrderId: string) {
    const resp = await apiClient.patch<ApiResponse<MaterialIssueOrder>>(`${this.baseUrl}/work-orders/${workOrderId}/issue`)
    return resp.data
  }

  async issueItem(orderId: string, itemId: string, quantity: number) {
    const resp = await apiClient.patch<ApiResponse<MaterialIssueOrder>>(`${this.baseUrl}/orders/${orderId}/items/${itemId}/issue`, { quantity })
    return resp.data
  }
}

export const materialIssueService = new MaterialIssueService()
export default materialIssueService