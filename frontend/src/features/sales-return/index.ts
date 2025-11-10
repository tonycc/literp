// 导出组件
export { default as SalesReturnManagement } from './components/SalesReturnManagement';
export { default as SalesReturnForm } from './components/SalesReturnForm';
export { default as AddSalesReturnModal } from './components/AddSalesReturnModal';

// 导出类型
export type {
  ReturnProduct,
  SalesReturn,
  SalesReturnQueryParams,
  SalesReturnFormData,
  OriginalSalesOrder
} from './types';

export {
  ReturnStatus,
  ReturnReason,
  RETURN_STATUS_CONFIG,
  RETURN_REASON_CONFIG
} from './types';