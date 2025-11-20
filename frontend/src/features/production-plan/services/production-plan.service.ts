import apiClient from '@/shared/services/api'
import { mapPaginatedResponse } from '@/shared/services/pagination'
import type { 
  ProductionPlanApi,
  ApiResponse,
  PaginatedResponse,
} from '@zyerp/shared'
import type {
  ProductionPlanPreviewRequest,
  ProductionPlanPreviewResult,
  ProductionPlan,
  ProductionPlanListParams,
  ProductionPlanCreateRequest,
} from '@zyerp/shared'
import type { ManufacturingOrder } from '@zyerp/shared'

/**
 * 生产计划服务
 */
export class ProductionPlanService implements ProductionPlanApi {
  private readonly baseUrl = '/production-plan'

  /**
   * 生产计划预览
   */
  async preview(data: ProductionPlanPreviewRequest): Promise<ApiResponse<ProductionPlanPreviewResult>> {
    const response = await apiClient.post<ApiResponse<ProductionPlanPreviewResult>>(
      `${this.baseUrl}/preview`,
      data,
    )
    return response.data
  }

  async create(data: ProductionPlanCreateRequest): Promise<ApiResponse<{ id: string }>> {
    const response = await apiClient.post<ApiResponse<{ id: string }>>(
      `${this.baseUrl}`,
      data,
    )
    return response.data
  }

  async getList(params: ProductionPlanListParams = {}): Promise<PaginatedResponse<ProductionPlan>> {
    const response = await apiClient.get(`${this.baseUrl}`, {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10,
        status: params.status,
        orderNo: params.orderNo,
        orderId: params.orderId,
      },
    })
    return mapPaginatedResponse<ProductionPlan>(response.data)
  }

  async getById(id: string): Promise<ApiResponse<ProductionPlan>> {
    const response = await apiClient.get<ApiResponse<ProductionPlan>>(`${this.baseUrl}/${id}`)
    return response.data
  }

  async confirm(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/${id}/confirm`)
    return response.data
  }

  async cancel(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>(`${this.baseUrl}/${id}/cancel`)
    return response.data
  }

  async generateManufacturingOrders(id: string) : Promise<ApiResponse<ManufacturingOrder[]>> {
    const response = await apiClient.post<ApiResponse<ManufacturingOrder[]>>(`${this.baseUrl}/${id}/generate-manufacturing-orders`)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
    return response.data
  }
}

export const productionPlanService = new ProductionPlanService()
export default productionPlanService