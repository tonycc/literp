import type { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { SalesOrderService } from './sales-order.service';

export class SalesOrderController extends BaseController {
  private salesOrderService: SalesOrderService;

  constructor() {
    super();
    this.salesOrderService = new SalesOrderService();
  }

  /**
   * 获取销售订单列表（分页）
   */
  @ErrorHandler
  async getSalesOrders(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const paginationParams = this.parsePaginationParams(req);
    const params = {
      page: paginationParams.page,
      pageSize: paginationParams.limit,
      orderNumber: req.query.orderNumber as string,
      customerName: req.query.customerName as string,
      productName: req.query.productName as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const result = await this.salesOrderService.getSalesOrders(params);
    this.success(res, result);
  }

  /**
   * 获取销售订单详情
   */
  @ErrorHandler
  async getSalesOrderById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    const order = await this.salesOrderService.getSalesOrderById(id);
    this.success(res, order);
  }
}