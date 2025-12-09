import type { ProductInfo } from './product';

export enum SalesOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  PRODUCTION = 'production',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const SalesOrderPaymentMethod = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  CHECK: 'check',
  INSTALLMENT: 'installment',
  ADVANCE: 'advance',
} as const;

export type SalesOrderPaymentMethodType = 
  | 'cash'
  | 'bank_transfer'
  | 'credit_card'
  | 'check'
  | 'installment'
  | 'advance';

export interface SalesOrderFormItem {
  productId: string
  productName?: string
  productCode?: string
  specification?: string
  unit?: string
  quantity: number
  unitPriceWithTax: number
}

export interface SalesOrderBase<TDate, TPaymentMethod, TItem> {
  productId?: string
  customerName: string
  contactInfo: string
  contactPerson?: string
  contactPhone?: string
  orderDate: TDate
  deliveryDate: TDate
  salesManager: string
  productName?: string
  productCode?: string
  customerProductCode?: string
  specification?: string
  unit?: string
  quantity?: number
  unitPriceWithTax?: number
  unitPriceWithoutTax?: number
  taxRate: number
  paymentMethod: TPaymentMethod
  plannedPaymentDate: TDate
  remark?: string
  totalPriceWithTax?: number
  items?: TItem[]
}

export type SalesOrderFormData = SalesOrderBase<string, SalesOrderPaymentMethodType, SalesOrderFormItem>;

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
  product?: ProductInfo
  unit?: { id: string; name: string; symbol?: string }
  warehouse?: { id: string; code?: string; name: string }
}

export interface SalesOrder {
  id: string
  orderNo?: string
  customerName?: string
  contactPerson?: string
  contactPhone?: string
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

export interface SalesOrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalSalesAmount: number
  monthlyGrowth: number
}
