import { useState, useCallback } from 'react';
import type { 
  MaterialRequirement,
  ProductionPlanPreviewRequest,
  ProductionPlanPreviewResult,
  ApiResponse,
} from '@zyerp/shared';
import { productionPlanService } from '../services/production-plan.service';

export const useProductionPlan = () => {
  const [selectedItems, setSelectedItems] = useState<MaterialRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<ProductionPlanPreviewResult | null>(null);

  const handleRefresh = useCallback(async (params: ProductionPlanPreviewRequest): Promise<ApiResponse<ProductionPlanPreviewResult>> => {
    setLoading(true);
    try {
      const response = await productionPlanService.preview(params);
      // data 可能为 undefined，这里规范化为 null 以满足状态类型
      setPreviewResult(response.data ?? null);
      setSelectedItems(response.data?.materialRequirements || []);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // 状态
    selectedItems,
    loading,
    previewResult,
    // 方法
    handleRefresh,
    // 状态设置器（按需暴露）
    setSelectedItems,
    setLoading,
    setPreviewResult,
  };
};