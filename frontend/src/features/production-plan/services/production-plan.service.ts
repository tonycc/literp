import apiClient from '@/shared/services/api';
import type { 
  ProductionPlanApi,
  ApiResponse,
} from '@zyerp/shared';
import type {
  ProductionPlanPreviewRequest,
  ProductionPlanPreviewResult,
} from '@zyerp/shared';

/**
 * 生产计划服务
 */
export class ProductionPlanService implements ProductionPlanApi {
  private readonly baseUrl = '/production-plan';

  /**
   * 生产计划预览
   */
  async preview(data: ProductionPlanPreviewRequest): Promise<ApiResponse<ProductionPlanPreviewResult>> {
    const response = await apiClient.post<ApiResponse<ProductionPlanPreviewResult>>(
      `${this.baseUrl}/preview`,
      data,
    );
    return response.data;
  }
}

export const productionPlanService = new ProductionPlanService();
export default productionPlanService;