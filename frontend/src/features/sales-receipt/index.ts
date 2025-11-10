// 组件导出
export { default as SalesReceiptManagement } from './components/SalesReceiptManagement';
export { default as AddSalesReceiptModal } from './components/AddSalesReceiptModal';
export { default as SalesReceiptForm } from './components/SalesReceiptForm';

// 类型导出
export type {
  SalesReceipt,
  SalesReceiptFormData,
  SalesReceiptQueryParams,
  ReceiptStatus,
} from './types';

export { RECEIPT_STATUS_CONFIG } from './types';