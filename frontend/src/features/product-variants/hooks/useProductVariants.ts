import { useState, useCallback } from 'react';
import { ProductVariantsService } from '../services/product-variants.service';
import { useMessage } from '@/shared/hooks';
import type { ProductInfo, PaginationParams, ApiResponse } from '@zyerp/shared';

export const useProductVariants = (productId: string) => {
  const message = useMessage();
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<ProductInfo[]>([]);

  const generateVariants = useCallback(
    async (attributes: { attributeName: string; values: string[] }[]) => {
      setLoading(true);
      try {
        const resp: ApiResponse<ProductInfo[]> = await ProductVariantsService.generateVariants(productId, attributes);
        if (resp.success) {
          message.success('变体生成成功');
          // 生成成功后刷新列表
          await getVariants();
        } else {
          message.error(resp.message || '变体生成失败');
        }
      } catch {
        message.error('变体生成失败');
      } finally {
        setLoading(false);
      }
    },
    [productId, message],
  );

  const getVariants = useCallback(async () => {
    setLoading(true);
    try {
      const params: PaginationParams & Record<string, unknown> = { page: 1, pageSize: 10 };
      const response = await ProductVariantsService.getVariants(productId, params);
      if (response.success) {
        setVariants(response.data);
      } else {
        message.error('获取变体列表失败');
      }
    } catch {
      message.error('获取变体列表失败');
    } finally {
      setLoading(false);
    }
  }, [productId, message]);

  return {
    loading,
    variants,
    generateVariants,
    getVariants,
  };
};