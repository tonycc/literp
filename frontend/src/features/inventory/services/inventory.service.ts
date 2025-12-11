import apiClient from '@/shared/services/api';
import type { ProductStockInfo, ProductStockQueryParams, ProductStockListResponse, PaginationParams } from '@zyerp/shared';

// 后端分页数据的包裹结构（兼容两种返回格式）
type ProductStockBackendData =
  | {
      data: ProductStockInfo[];
      total: number;
      page: number;
      pageSize: number;
      totalPages?: number;
    }
  | {
      data: ProductStockInfo[];
      pagination: PaginationParams;
    };

/**
 * InventoryService
 * 负责与后端产品库存API交互，并进行数据格式转换
 */
export class InventoryService {
  /**
   * 获取库存列表（分页）
   * 注意：后端控制器的成功响应被统一包裹，实际数组位于 response.data.data.data
   */
  async getList(params: { current?: number; pageSize?: number } & Partial<ProductStockQueryParams>): Promise<{
    data: ProductStockInfo[];
    success: boolean;
    total: number;
  }> {
    // 转换为后端期望的分页参数
    const query: ProductStockQueryParams = {
      page: params.current || 1,
      pageSize: params.pageSize || 10,
      productCode: params.productCode,
      productName: params.productName,
      productType: params.productType,
      warehouseId: params.warehouseId,
      status: params.status,
    };

    const res = await apiClient.get<ProductStockListResponse>('/product-stocks', {
      params: query,
    });

    // 统一响应包裹：res.data => { success, data: { data:[], total, page, pageSize, totalPages } | { data:[], pagination }, message, timestamp }
    const raw = res.data?.data as ProductStockBackendData | undefined;
    const rawData = raw?.data;
    const list: ProductStockInfo[] = Array.isArray(rawData) ? rawData : [];
    // 兼容两种分页结构：直接字段或 pagination 对象
    const hasPagination = (
      d: ProductStockBackendData | undefined
    ): d is { data: ProductStockInfo[]; pagination: PaginationParams } => !!d && 'pagination' in d;
    const total = hasPagination(raw) ? (raw.pagination.total ?? 0) : (raw?.total ?? 0);

    return {
      data: list,
      success: !!res.data?.success,
      total,
    };
  }
}

export const inventoryService = new InventoryService();