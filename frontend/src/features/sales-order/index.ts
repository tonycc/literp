// 导出组件
export { SalesOrderManagement } from './components/SalesOrderManagement';
export { AddSalesOrderModal } from './components/AddSalesOrderModal';
export { SalesOrderForm } from './components/SalesOrderForm';

// 导出类型
export type {
  SalesOrder,
  SalesOrderStatus,
  PaymentMethod,
  SalesOrderQueryParams,
  SalesOrderFormData,
  SalesOrderStats
} from './types';
// 导出共享的枚举映射（前端统一常量）
export {
  SALES_ORDER_STATUS_VALUE_ENUM_PRO,
  SALES_ORDER_PAYMENT_METHOD_VALUE_ENUM_PRO,
  SalesOrderPaymentMethod
} from '@/shared/constants/sales-order';