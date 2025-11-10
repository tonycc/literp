import type { ApiResponse } from '../types/common';
import type {
  ProductionPlanPreviewRequest,
  ProductionPlanPreviewResult,
} from '../types/productionPlan';

// 生产计划接口定义
export interface ProductionPlanApi {
  preview(data: ProductionPlanPreviewRequest): Promise<ApiResponse<ProductionPlanPreviewResult>>;
}