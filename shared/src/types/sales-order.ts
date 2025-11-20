export enum SalesOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PRODUCTION = 'production',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface SalesOrderItem {
  id: string
  orderId: string
  productId: string
  unitId?: string
  warehouseId?: string
  quantity: number
  price?: number
  amount?: number
  remark?: string
  createdAt: string
  updatedAt: string
  product?: { id: string; code?: string; name: string }
  unit?: { id: string; name: string; symbol?: string }
  warehouse?: { id: string; code?: string; name: string }
}

export interface SalesOrder {
  id: string
  orderNo?: string
  customerName?: string
  orderDate: string
  deliveryDate?: string
  status: SalesOrderStatus
  totalAmount?: number
  currency?: string
  remark?: string
  salesManager?: string
  paymentMethod?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  items: SalesOrderItem[]
}

export interface SalesOrderListParams {
  page?: number
  pageSize?: number
  orderNumber?: string
  customerName?: string
  productName?: string
  status?: SalesOrderStatus | string
  startDate?: string
  endDate?: string
}