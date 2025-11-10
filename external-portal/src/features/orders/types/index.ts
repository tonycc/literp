// 订单查询相关类型定义

export interface Order {
  id: string
  orderNumber: string
  product: string
  quantity: number
  unit: string
  unitPrice: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
  orderDate: string
  expectedDeliveryDate: string
  actualDeliveryDate?: string
  customer: string
  customerContact: string
  supplier: string
  supplierContact: string
  batchNumber: string
  trackingNumber?: string
  notes?: string
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded'
  paymentMethod?: string
  shippingAddress: string
  billingAddress: string
}

export interface OrderSearchParams {
  search?: string
  status?: string
  paymentStatus?: string
  dateRange?: [string, string]
  customer?: string
  supplier?: string
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalAmount: number
  averageOrderValue: number
}

export interface OrderStatusConfig {
  label: string
  color: string
  description: string
}

export const ORDER_STATUS_CONFIG: Record<Order['status'], OrderStatusConfig> = {
  pending: { label: '待确认', color: 'orange', description: '订单已提交，等待确认' },
  confirmed: { label: '已确认', color: 'blue', description: '订单已确认，准备处理' },
  processing: { label: '处理中', color: 'purple', description: '订单正在处理中' },
  shipped: { label: '已发货', color: 'cyan', description: '订单已发货，正在运输' },
  delivered: { label: '已送达', color: 'green', description: '订单已送达目的地' },
  completed: { label: '已完成', color: 'success', description: '订单已完成' },
  cancelled: { label: '已取消', color: 'red', description: '订单已取消' }
}

export const PAYMENT_STATUS_CONFIG: Record<Order['paymentStatus'], OrderStatusConfig> = {
  unpaid: { label: '未付款', color: 'red', description: '订单尚未付款' },
  partial: { label: '部分付款', color: 'orange', description: '订单已部分付款' },
  paid: { label: '已付款', color: 'green', description: '订单已全额付款' },
  refunded: { label: '已退款', color: 'purple', description: '订单已退款' }
}