import apiClient from '@/shared/services/api'
import { mapPaginatedResponse } from '@/shared/services/pagination'
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared'
import type { CreateProductionReportData, ProductionReport, ProductionReportListParams } from '@zyerp/shared'

class ProductionReportService {
  private readonly baseUrl = '/production-report'

  async create(data: CreateProductionReportData): Promise<ApiResponse<ProductionReport>> {
    const resp = await apiClient.post<ApiResponse<ProductionReport>>(`${this.baseUrl}/reports`, data)
    return resp.data
  }

  async getList(params: ProductionReportListParams): Promise<PaginatedResponse<ProductionReport>> {
    const resp = await apiClient.get<ApiResponse<unknown>>(`${this.baseUrl}/reports`, { params })
    return mapPaginatedResponse<ProductionReport>(resp.data)
  }

  async getById(id: string): Promise<ApiResponse<ProductionReport>> {
    const resp = await apiClient.get<ApiResponse<ProductionReport>>(`${this.baseUrl}/reports/${id}`)
    return resp.data
  }
}

export const productionReportService = new ProductionReportService()
export default productionReportService