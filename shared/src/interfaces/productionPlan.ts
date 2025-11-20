import type { ApiResponse, PaginatedResponse } from '../types/common';
import type { ManufacturingOrder } from '../types/mo';
import type {
  ProductionPlanPreviewRequest,
  ProductionPlanPreviewResult,
  ProductionPlan,
  ProductionPlanListParams,
  ProductionPlanCreateRequest,
} from '../types/productionPlan';

// 生产计划接口定义
export interface ProductionPlanApi {
  preview(data: ProductionPlanPreviewRequest): Promise<ApiResponse<ProductionPlanPreviewResult>>;
  create(data: ProductionPlanCreateRequest): Promise<ApiResponse<{ id: string }>>;
  getList(params?: ProductionPlanListParams): Promise<PaginatedResponse<ProductionPlan>>;
  getById(id: string): Promise<ApiResponse<ProductionPlan>>;
  confirm(id: string): Promise<ApiResponse<void>>;
  cancel(id: string): Promise<ApiResponse<void>>;
  delete(id: string): Promise<ApiResponse<void>>;
  generateManufacturingOrders(id: string): Promise<ApiResponse<ManufacturingOrder[]>>;
}