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

export {
  SALES_ORDER_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG
} from './types';