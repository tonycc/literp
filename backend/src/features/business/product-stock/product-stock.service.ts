/**
 * 产品库存服务
 */

import { BaseService } from '../../../shared/services/base.service';
import type { Prisma } from '@prisma/client';
import type {
  ProductStockInfo,
  ProductStockQueryParams,
  ProductStockListResponse,
  InventoryStatus,
} from '@zyerp/shared';

export class ProductStockService extends BaseService {
  /**
   * 获取产品库存列表（分页与筛选）
   */
  async getProductStocks(params: ProductStockQueryParams): Promise<ProductStockListResponse> {
    const { page, pageSize, productCode, productName, productType, warehouseId, status } = params;
    const { skip, take, page: currentPage, pageSize: currentPageSize } = this.getPaginationConfig(page, pageSize);

    // 组装查询条件（支持关联条件）
    const where: any = {};

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (status) {
      // 状态为计算字段，不能直接用 where 过滤；仅在前端展示或后续拓展计算过滤
    }

    // 关联产品条件筛选
    const productWhere: any = {};
    if (productCode) {
      productWhere.code = { contains: productCode };
    }
    if (productName) {
      productWhere.name = { contains: productName };
    }
    if (productType) {
      productWhere.type = productType;
    }

    // 将产品相关筛选放入顶层where（关联一对多/一对一使用 is）
    if (Object.keys(productWhere).length) {
      where.product = { is: productWhere };
    }

    // 查询数据
    const [stocks, total]: [
      Prisma.ProductStockGetPayload<{
        include: {
          product: { include: { unit: true; defaultWarehouse: true } };
          warehouse: true;
          unit: true;
        };
      }>[] ,
      number
    ] = await Promise.all([
      this.prisma.productStock.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          product: {
            include: {
              unit: true,
              defaultWarehouse: true,
            },
          },
          warehouse: true,
          unit: true,
        },
      }),
      this.prisma.productStock.count({ where }),
    ]);

    // 格式化与计算字段
    const formatted: ProductStockInfo[] = stocks
      .filter((s) => !!s.product) // 过滤未关联产品的库存记录
      .map((s) => {
        const p = s.product!;
        const u = s.unit ?? p.unit;
        const w = s.warehouse ?? p.defaultWarehouse;

        const currentStock = s.quantity ?? 0;
        const reservedStock = s.reservedQuantity ?? 0;
        const availableStock = Math.max(0, currentStock - reservedStock);
        const averageCost = p.averageCost ?? null;
        const totalValue = averageCost != null ? Number((currentStock * averageCost).toFixed(2)) : null;

        // 计算库存状态
        const safety = p.safetyStock ?? p.minStock ?? 0;
        const maxStock = p.maxStock ?? undefined;
        let invStatus: InventoryStatus = 'normal' as InventoryStatus;
        if (currentStock <= 0) {
          invStatus = 'out_of_stock' as InventoryStatus;
        } else if (safety && currentStock < safety) {
          invStatus = 'low_stock' as InventoryStatus;
        } else if (typeof maxStock === 'number' && currentStock > maxStock) {
          invStatus = 'overstocked' as InventoryStatus;
        }

        return {
          id: s.id,
          productId: p.id,
          productCode: p.code,
          productName: p.name,
          productType: p.type,
          specification: p.specification ?? null,
          unit: u?.symbol ?? u?.name ?? null,
          unitId: u?.id ?? null,
          warehouseId: w?.id ?? s.warehouseId ?? null,
          warehouseName: w?.name ?? null,
          currentStock,
          reservedStock,
          availableStock,
          minStock: p.minStock ?? null,
          maxStock: p.maxStock ?? null,
          safetyStock: p.safetyStock ?? null,
          reorderPoint: p.reorderPoint ?? null,
          averageCost,
          totalValue,
          status: invStatus,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        };
      });

    const paginated = this.buildPaginatedResponse(formatted, total, currentPage, currentPageSize);
    return {
      success: true,
      data: {
        data: paginated.data,
        pagination: paginated.pagination,
      },
      message: '库存列表获取成功',
      timestamp: new Date().toISOString(),
    };
  }
}

export const productStockService = new ProductStockService();