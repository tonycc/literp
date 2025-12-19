/**
 * 产品库存服务
 */

import { BaseService } from '../../../shared/services/base.service';
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

    const productWhere: any = {};
    if (productCode) productWhere.code = { contains: productCode };
    if (productName) productWhere.name = { contains: productName };
    if (productType) productWhere.type = productType;

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where: productWhere }),
      this.prisma.product.findMany({
        where: productWhere,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          unit: true,
          defaultWarehouse: true,
          productVariants: {
            include: {
              variantStocks: true,
            },
          },
        },
      }),
    ]);

    const warehouseInfo = warehouseId
      ? await this.prisma.warehouse.findUnique({ where: { id: warehouseId } })
      : null;

    const formatted: ProductStockInfo[] = products.map((p) => {
      const variants = (p as any).productVariants as Array<{
        variantStocks?: Array<{ warehouseId: string | null; quantity: number | null; reservedQuantity: number | null }>;
      }>;
      const allStocks = variants.flatMap((v) => v.variantStocks || []);
      const filtered = warehouseId ? allStocks.filter((s) => s.warehouseId === warehouseId) : allStocks;
      const currentStock = filtered.reduce((sum, s) => sum + (s.quantity || 0), 0);
      const reservedStock = filtered.reduce((sum, s) => sum + (s.reservedQuantity || 0), 0);
      const availableStock = Math.max(0, currentStock - reservedStock);
      const averageCost = p.averageCost ?? null;
      const totalValue = averageCost != null ? Number((currentStock * averageCost).toFixed(2)) : null;

      let invStatus: InventoryStatus = 'normal' as InventoryStatus;
      if (currentStock <= 0) invStatus = 'out_of_stock' as InventoryStatus;

      return {
        id: p.id,
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        productType: p.type,
        specification: p.specification ?? null,
        unit: p.unit?.name ?? p.unit?.symbol ?? null,
        unitId: p.unit?.id ?? null,
        warehouseId: warehouseId ?? p.defaultWarehouseId ?? null,
        warehouseName: warehouseInfo?.name ?? (p as any).defaultWarehouse?.name ?? null,
        currentStock,
        reservedStock,
        availableStock,
        minStock: null,
        maxStock: null,
        safetyStock: null,
        reorderPoint: null,
        averageCost,
        totalValue,
        status: invStatus,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    const targetStatus = status as InventoryStatus | undefined;
    const filteredByStatus = targetStatus
      ? formatted.filter((item) => item.status === targetStatus)
      : formatted;

    const paginated = this.buildPaginatedResponse(
      filteredByStatus,
      targetStatus ? filteredByStatus.length : total,
      currentPage,
      currentPageSize,
    );
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
