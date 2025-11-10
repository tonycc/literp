// 导出组件
export { default as InventoryManagement } from './pages/InventoryManagement';
export { default as InventoryDetails } from './components/InventoryDetails';
export { default as OutboundOrderList } from './components/OutboundOrderList';

// 导出类型和枚举
export type {
  ProductInventory,
  InventoryTransaction,
  InventoryQueryParams,
  InventoryTransactionQueryParams,
  InventoryStatistics,
  Warehouse,
  StorageLocation
} from './types';

export {
  ProductType,
  InventoryStatus,
  InventoryTransactionType,
  PRODUCT_TYPE_CONFIG,
  INVENTORY_STATUS_CONFIG,
  INVENTORY_TRANSACTION_TYPE_CONFIG
} from './types';
// 服务与业务逻辑导出
export { inventoryService } from './services/inventory.service';
export { useInventory } from './hooks/useInventory';