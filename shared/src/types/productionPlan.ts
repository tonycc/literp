/**
 * 生产计划相关类型定义
 */

import type { RoutingWorkcenterInfo } from './routing';
import type { Timestamp } from './common';

// 预览请求（基于销售订单）
export interface ProductionPlanPreviewRequest {
  salesOrderId: string;
  warehouseId?: string;
  includeRouting?: boolean;
  // 是否在产品计划中包含子BOM对应的产品
  includeChildProducts?: boolean;
  // 是否递归展开物料需求，按子BOM层级展开叶子物料
  expandMaterialsRecursively?: boolean;
  // 指定参与计算的销售订单项ID集合
  selectedItemIds?: string[];
}

// 单个产品的计划信息
export interface ProductionPlanProductPlan {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit?: string | null;
  bomId?: string | null;
  bomCode?: string | null;
  baseQuantity?: number | null;
  routingId?: string | null;
  routingCode?: string | null;
  operations?: RoutingWorkcenterInfo[];
  source?: 'bom' | 'child_bom' | 'bom_child';
  parentProductId?: string | null;
}

// 物料需求明细
export interface MaterialRequirement {
  materialId: string;
  materialCode: string;
  materialName: string;
  specification?: string | null;
  unitId?: string | null;
  unit?: string | null;
  requiredQuantity: number;
  availableStock: number;
  shortageQuantity: number;
  warehouseId?: string | null;
  // 是否需外协（由BOM工序的工作中心类型判定）
  needOutsource?: boolean;
}

// 生产计划预览结果
export interface ProductionPlanPreviewResult {
  orderId: string;
  orderNo?: string;
  products: ProductionPlanProductPlan[];
  materialRequirements: MaterialRequirement[];
  generatedAt: Timestamp;
  notes?: string;
}

export type ProductionPlanStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';

export interface ProductionPlan {
  id: string;
  orderId: string;
  orderNo?: string;
  name?: string;
  status: ProductionPlanStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  updatedBy?: string;
  plannedStart?: Timestamp;
  plannedFinish?: Timestamp;
  finishedWarehouseId?: string;
  issueWarehouseId?: string;
  ownerId?: string;
  products: ProductionPlanProductPlan[];
  materialRequirements: MaterialRequirement[];
  notes?: string;
}

export interface ProductionPlanListParams {
  page?: number;
  pageSize?: number;
  status?: ProductionPlanStatus | string;
  orderNo?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProductionPlanCreateRequest extends ProductionPlanPreviewRequest {
  name: string;
  plannedStart: string;
  plannedFinish: string;
  finishedWarehouseId: string;
  issueWarehouseId: string;
  ownerId: string;
}