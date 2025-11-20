export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  RECEIVED = 'received',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export interface PurchaseOrderItem {
  id: string
  orderId: string
  productId: string
  unitId?: string
  warehouseId?: string
  quantity: number
  price: number
  amount: number
  createdAt?: string
  updatedAt?: string
  product?: { id: string; code?: string; name: string }
  unit?: { id: string; name: string; symbol?: string }
  warehouse?: { id: string; code?: string; name: string }
}

export interface PurchaseOrder {
  id: string
  orderNo: string
  supplierId: string
  status: PurchaseOrderStatus
  currency: string
  amount: number
  orderDate: string
  remark?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderListParams {
  page?: number
  pageSize?: number
  orderNo?: string
  supplierId?: string
  status?: PurchaseOrderStatus | string
  productName?: string
  startDate?: string
  endDate?: string
}

export interface PurchaseOrderFormData {
  supplierId: string
  status: PurchaseOrderStatus
  currency: string
  orderDate: string
  expectedDeliveryDate?: string
  remark?: string
  items: Array<{
    productId: string
    unitId?: string
    warehouseId?: string
    quantity: number
    price: number
  }>
}