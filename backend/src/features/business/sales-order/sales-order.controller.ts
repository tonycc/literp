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

  /**
   * 获取销售订单明细项
   */
  @ErrorHandler
  async getSalesOrderItems(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    const items = await this.salesOrderService.getSalesOrderItems(id);
    this.success(res, items);
  }

  /**
   * 创建销售订单
   */
  @ErrorHandler
  async createSalesOrder(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req);
    const data = req.body as Record<string, unknown>;
    const created = await this.salesOrderService.createSalesOrder(data, userId);
    this.success(res, created, '创建成功');
  }

  /**
   * 更新销售订单
   */
  @ErrorHandler
  async updateSalesOrder(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = req.body as Record<string, unknown>;
    const updated = await this.salesOrderService.updateSalesOrder(id, data, userId);
    this.success(res, updated, '更新成功');
  }

  /**
   * 删除销售订单
   */
  @ErrorHandler
  async deleteSalesOrder(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    await this.salesOrderService.deleteSalesOrder(id);
    this.success(res, null, '删除成功');
  }
}