import apiClient from '@/shared/services/api'
import { mapPaginatedResponse } from '@/shared/services/pagination'
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared'
import type { SubcontractReceipt, SubcontractReceiptItem, SubcontractReceiptListParams, CreateSubcontractReceiptInput } from '@zyerp/shared'

class SubcontractReceiptService {
  private readonly baseUrl = '/subcontract-receipts'

  async getList(params: SubcontractReceiptListParams): Promise<PaginatedResponse<SubcontractReceipt>> {
    const resp = await apiClient.get<ApiResponse<unknown>>(this.baseUrl, { params })
    return mapPaginatedResponse<SubcontractReceipt>(resp.data)
  }

  async getById(id: string) {
    const resp = await apiClient.get<ApiResponse<SubcontractReceipt & { items: SubcontractReceiptItem[] }>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: CreateSubcontractReceiptInput) {
    const resp = await apiClient.post<ApiResponse<SubcontractReceipt>>(this.baseUrl, data)
    return resp.data
  }

  async updateStatus(id: string, status: string) {
    const resp = await apiClient.patch<ApiResponse<SubcontractReceipt>>(`${this.baseUrl}/${id}/status`, { status })
    return resp.data
  }
}

export const subcontractReceiptService = new SubcontractReceiptService()
export default subcontractReceiptService