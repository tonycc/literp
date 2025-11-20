import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderDetail,
  PurchaseOrderListParams,
  PurchaseOrderFormData,
} from '../types/purchase-order'
import type { PaginatedResponse, ApiResponse } from '../types/common'

export type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderDetail,
  PurchaseOrderListParams,
  PurchaseOrderFormData,
}

export type PurchaseOrderListApiResponse = ApiResponse<PaginatedResponse<PurchaseOrder>>
export type PurchaseOrderDetailApiResponse = ApiResponse<PurchaseOrderDetail>