export enum MaterialIssueStatus {
  DRAFT = 'draft',
  PREPARED = 'prepared',
  PARTIALLY_ISSUED = 'partially_issued',
  ISSUED = 'issued',
  CANCELLED = 'cancelled',
}

export interface MaterialIssueOrderItem {
  id?: string
  orderId?: string
  materialId: string
  materialCode?: string | null
  materialName?: string | null
  specification?: string | null
  unitId: string
  unit?: string | null
  requiredQuantity: number
  issuedQuantity: number
  pendingQuantity: number
  warehouseId?: string | null
  warehouseCode?: string | null
  warehouseName?: string | null
  remark?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface MaterialIssueOrder {
  id?: string
  orderNo: string
  workOrderId: string
  workOrderNo?: string | null
  moId: string
  moOrderNo?: string | null
  warehouseId?: string | null
  warehouseCode?: string | null
  warehouseName?: string | null
  status: MaterialIssueStatus
  remark?: string | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt?: string | Date
  updatedAt?: string | Date
  items: MaterialIssueOrderItem[]
}

export interface MaterialIssueListParams {
  page?: number
  pageSize?: number
  status?: MaterialIssueStatus | string
  workcenterId?: string
  moId?: string
}

export type MaterialIssueOrderListResponse = import('./common').PaginatedResponse<MaterialIssueOrder>
export type MaterialIssueOrderResponse = import('./common').ApiResponse<MaterialIssueOrder>