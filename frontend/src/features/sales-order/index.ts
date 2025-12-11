// 导出组件
export { SalesOrderManagement } from './pages/SalesOrderManagement';
export { AddSalesOrderModal } from './components/AddSalesOrderModal';
export { SalesOrderForm } from './components/SalesOrderForm';

// 导出类型
export type {
  SalesOrder,
  SalesOrderStatus,
  SalesOrderListParams as SalesOrderQueryParams,
  SalesOrderFormData,
  SalesOrderStats
} from '@zyerp/shared';

export { SalesOrderPaymentMethod as PaymentMethod } from '@zyerp/shared';
// 导出共享的枚举映射（前端统一常量）
export {
  SALES_ORDER_STATUS_VALUE_ENUM_PRO,
  SALES_ORDER_PAYMENT_METHOD_VALUE_ENUM_PRO
} from '@/shared/constants/sales-order';