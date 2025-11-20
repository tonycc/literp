export interface ProductionReport {
  id?: string
  reportNo: string
  workOrderId?: string | null
  workOrderNo?: string | null
  teamId?: string | null
  teamName?: string | null
  reporterId?: string | null
  reporterName?: string | null
  reportTime: string | Date
  productId?: string | null
  productCode?: string | null
  productName?: string | null
  specification?: string | null
  reportedQuantity: number
  qualifiedQuantity: number
  defectQuantity: number
  processCode?: string | null
  processName?: string | null
  remark?: string | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface CreateProductionReportData {
  workOrderId?: string | null
  workOrderNo?: string | null
  teamId?: string | null
  teamName?: string | null
  reporterId?: string | null
  reporterName?: string | null
  reportTime?: string | Date
  productId?: string | null
  productCode?: string | null
  productName?: string | null
  specification?: string | null
  reportedQuantity: number
  qualifiedQuantity: number
  defectQuantity: number
  processCode?: string | null
  processName?: string | null
  remark?: string | null
}

export interface ProductionReportListParams {
  page?: number
  pageSize?: number
  workOrderId?: string
  workOrderNo?: string
  from?: string
  to?: string
}

export type ProductionReportResponse = import('./common').ApiResponse<ProductionReport>
export type ProductionReportListResponse = import('./common').PaginatedResponse<ProductionReport>