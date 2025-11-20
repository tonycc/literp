export type SubcontractOrderStatus = 'draft' | 'released' | 'in_progress' | 'received' | 'completed' | 'cancelled'

export interface SubcontractOrderItem {
  id: string
  orderId: string
  workOrderId: string
  workOrderNo?: string | null
  routingWorkcenterId?: string | null
  operationId: string
  operationName?: string | null
  productId: string
  productCode?: string | null
  productName?: string | null
  unitId?: string | null
  unit?: string | null
  quantity: number
  price?: number | null
  amount?: number | null
  dueDate?: string | Date | null
  status: 'pending' | 'partially_received' | 'received' | 'cancelled'
  remark?: string | null
}

export interface SubcontractOrder {
  id: string
  orderNo: string
  supplierId: string
  supplierName?: string | null
  status: SubcontractOrderStatus
  orderDate: string | Date
  expectedDeliveryDate?: string | Date | null
  currency: string
  totalAmount?: number | null
  moId?: string | null
  remark?: string | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
  items?: SubcontractOrderItem[]
  itemsCount?: number
  firstWorkOrderId?: string | null
  firstWorkOrderNo?: string | null
  firstProductId?: string | null
  firstProductCode?: string | null
  firstProductName?: string | null
  firstOperationId?: string | null
  firstOperationName?: string | null
  firstPrice?: number | null
  submittedBy?: string | null
  submittedByName?: string | null
  submittedAt?: string | Date | null
}

export interface SubcontractOrderListParams {
  page?: number
  pageSize?: number
  status?: SubcontractOrderStatus | string
  supplierId?: string
  orderDateStart?: string
  orderDateEnd?: string
  dueDateStart?: string
  dueDateEnd?: string
}

export type SubcontractReceiptStatus = 'draft' | 'confirmed' | 'posted'

export interface SubcontractReceiptItem {
  id: string
  receiptId: string
  orderItemId: string
  receivedQuantity: number
  qcResult?: string | null
  warehouseId?: string | null
  remark?: string | null
}

export interface SubcontractReceipt {
  id: string
  receiptNo: string
  orderId: string
  supplierId?: string | null
  receivedDate: string | Date
  warehouseId?: string | null
  qcStatus?: string | null
  status: SubcontractReceiptStatus
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
  items?: SubcontractReceiptItem[]
  receivedQuantityTotal?: number
}

export interface SubcontractReceiptListParams {
  page?: number
  pageSize?: number
  orderId?: string
  supplierId?: string
  status?: SubcontractReceiptStatus | string
  receivedDateStart?: string
  receivedDateEnd?: string
}

export interface CreateSubcontractReceiptItemInput {
  orderItemId: string
  receivedQuantity: number
  warehouseId?: string | null
}

export interface CreateSubcontractReceiptInput {
  orderId: string
  supplierId?: string | null
  receivedDate?: string
  warehouseId?: string | null
  items: CreateSubcontractReceiptItemInput[]
}

export interface SubcontractOrderGenerateRequest {
  workOrderIds: string[]
  defaultSupplierId: string
  expectedDeliveryDate?: string
  groupingStrategy?: 'supplier' | 'dueDate' | 'operation'
  currency?: string
  itemPriceOverrides?: Array<{ workOrderId: string; price: number }>
}

export interface SubcontractOrderGenerateResponseItem {
  orderId: string
  orderNo: string
  supplierId: string
  itemsCount: number
}

export type SubcontractOrderGenerateResponse = {
  success: boolean
  data: SubcontractOrderGenerateResponseItem[]
  message?: string
  timestamp: string
}