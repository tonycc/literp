import type { ApiResponse, PaginatedResponse } from '../types/common'
import type {
  SubcontractOrder,
  SubcontractOrderItem,
  SubcontractOrderListParams,
  SubcontractReceipt,
  SubcontractReceiptItem,
  SubcontractReceiptListParams,
  SubcontractOrderStatus,
  SubcontractReceiptStatus,
} from '../types/subcontract-order'

export interface SubcontractOrderApi {
  list(params: SubcontractOrderListParams): Promise<PaginatedResponse<SubcontractOrder>>
  getById(id: string): Promise<ApiResponse<SubcontractOrder & { items: SubcontractOrderItem[] }>>
  create(data: Omit<SubcontractOrder, 'id' | 'orderNo' | 'createdAt' | 'updatedAt' | 'status'> & { items: Array<Pick<SubcontractOrderItem, 'workOrderId' | 'routingWorkcenterId' | 'operationId' | 'productId' | 'productCode' | 'productName' | 'unitId' | 'quantity' | 'price' | 'dueDate'>> }): Promise<ApiResponse<SubcontractOrder>>
  updateStatus(id: string, status: SubcontractOrderStatus): Promise<ApiResponse<SubcontractOrder>>
  delete(id: string): Promise<ApiResponse<void>>
  generateByWorkOrders(data: import('../types/subcontract-order').SubcontractOrderGenerateRequest): Promise<import('../types/subcontract-order').SubcontractOrderGenerateResponse>
}

export interface SubcontractReceiptApi {
  list(params: SubcontractReceiptListParams): Promise<PaginatedResponse<SubcontractReceipt>>
  getById(id: string): Promise<ApiResponse<SubcontractReceipt & { items: SubcontractReceiptItem[] }>>
  create(data: Omit<SubcontractReceipt, 'id' | 'receiptNo' | 'createdAt' | 'updatedAt' | 'status'> & { items: Array<Pick<SubcontractReceiptItem, 'orderItemId' | 'receivedQuantity' | 'warehouseId'>> }): Promise<ApiResponse<SubcontractReceipt>>
  updateStatus(id: string, status: SubcontractReceiptStatus): Promise<ApiResponse<SubcontractReceipt>>
}