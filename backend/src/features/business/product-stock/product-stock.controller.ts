import type { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { ProductStockService } from './product-stock.service';
import type { ProductStockQueryParams, InventoryStatus } from '@zyerp/shared';

/**
 * 产品库存控制器
 */
export class ProductStockController extends BaseController {
  private service: ProductStockService;

  constructor() {
    super();
    this.service = new ProductStockService();
  }

  /**
   * 获取库存列表（分页）
   */
  @ErrorHandler
  async getProductStocks(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { page, limit } = this.parsePaginationParams(req);
    const params: ProductStockQueryParams = {
      page,
      pageSize: limit,
      productCode: req.query.productCode as string,
      productName: req.query.productName as string,
      productType: req.query.productType as string,
      warehouseId: req.query.warehouseId as string,
      status: req.query.status as InventoryStatus,
    };

    const result = await this.service.getProductStocks(params);
    // 仅包裹一次：控制器层统一包裹服务返回的payload，避免双重data导致前端列表为空
    this.success(res, result.data, '库存列表获取成功');
  }
}

export default ProductStockController;