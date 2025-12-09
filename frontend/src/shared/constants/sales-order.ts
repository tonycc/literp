import { SalesOrderStatus, SalesOrderPaymentMethod } from '@zyerp/shared'

export const SALES_ORDER_STATUS_OPTIONS = [
  { label: '草稿', value: SalesOrderStatus.DRAFT },
  { label: '已确认', value: SalesOrderStatus.CONFIRMED },
  { label: '生产中', value: SalesOrderStatus.PRODUCTION },
  { label: '已发货', value: SalesOrderStatus.SHIPPED },
  { label: '已交付', value: SalesOrderStatus.DELIVERED },
  { label: '已完成', value: SalesOrderStatus.COMPLETED },
  { label: '已取消', value: SalesOrderStatus.CANCELLED },
]

export const SALES_ORDER_STATUS_VALUE_ENUM_PRO = {
  [SalesOrderStatus.DRAFT]: { text: '草稿' },
  [SalesOrderStatus.CONFIRMED]: { text: '已确认' },
  [SalesOrderStatus.PRODUCTION]: { text: '生产中' },
  [SalesOrderStatus.SHIPPED]: { text: '已发货' },
  [SalesOrderStatus.DELIVERED]: { text: '已交付' },
  [SalesOrderStatus.COMPLETED]: { text: '已完成' },
  [SalesOrderStatus.CANCELLED]: { text: '已取消' },
} as const

export const SALES_ORDER_PAYMENT_METHOD_OPTIONS = [
  { label: '现金', value: SalesOrderPaymentMethod.CASH },
  { label: '银行转账', value: SalesOrderPaymentMethod.BANK_TRANSFER },
  { label: '信用卡', value: SalesOrderPaymentMethod.CREDIT_CARD },
  { label: '支票', value: SalesOrderPaymentMethod.CHECK },
  { label: '分期付款', value: SalesOrderPaymentMethod.INSTALLMENT },
  { label: '预付款', value: SalesOrderPaymentMethod.ADVANCE },
]

export const SALES_ORDER_PAYMENT_METHOD_VALUE_ENUM_PRO = {
  [SalesOrderPaymentMethod.CASH]: { text: '现金' },
  [SalesOrderPaymentMethod.BANK_TRANSFER]: { text: '银行转账' },
  [SalesOrderPaymentMethod.CREDIT_CARD]: { text: '信用卡' },
  [SalesOrderPaymentMethod.CHECK]: { text: '支票' },
  [SalesOrderPaymentMethod.INSTALLMENT]: { text: '分期付款' },
  [SalesOrderPaymentMethod.ADVANCE]: { text: '预付款' },
} as const