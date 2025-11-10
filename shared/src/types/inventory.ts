/**
 * 库存相关类型定义（跨前后端复用）
 */

import type { PaginationParams, ApiResponse } from './common';

// 库存状态枚举（与前端保持一致的语义，字段为字符串）
export enum InventoryStatus {
  NORMAL = 'normal',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCKED = 'overstocked',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
  EXPIRED = 'expired'
}

// 产品库存信息（后端聚合返回的扁平结构）
export interface ProductStockInfo {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  productType: string;
  specification?: string | null;
  unit?: string | null; // 单位符号或名称
  unitId?: string | null;
  warehouseId?: string | null;
  warehouseName?: string | null;
  currentStock: number; // 实际库存（quantity）
  reservedStock: number; // 预留库存（reservedQuantity）
  availableStock: number; // 可用库存（quantity - reservedQuantity）
  minStock?: number | null;
  maxStock?: number | null;
  safetyStock?: number | null;
  reorderPoint?: number | null;
  averageCost?: number | null;
  totalValue?: number | null; // currentStock * averageCost
  status: InventoryStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 库存查询参数
export interface ProductStockQueryParams {
  page?: number;
  pageSize?: number;
  productCode?: string;
  productName?: string;
  productType?: string;
  warehouseId?: string;
  status?: InventoryStatus | string;
}

// 库存列表响应（后端原始响应体）
export type ProductStockListResponse = ApiResponse<{
  data: ProductStockInfo[];
  pagination: PaginationParams;
}>;