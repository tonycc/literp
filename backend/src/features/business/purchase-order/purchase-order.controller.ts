import type { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { PurchaseOrderService } from './purchase-order.service';

export class PurchaseOrderController extends BaseController {
  private purchaseOrderService: PurchaseOrderService;

  constructor() {
    super();
    this.purchaseOrderService = new PurchaseOrderService();
  }

  /** 获取采购订单列表（分页） */
  @ErrorHandler
  async getPurchaseOrders(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const paginationParams = this.parsePaginationParams(req);
    const params = {
      page: paginationParams.page,
      pageSize: paginationParams.limit,
      orderNumber: req.query.orderNumber as string,
      supplierName: req.query.supplierName as string,
      productName: req.query.productName as string,
      status: req.query.status as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const result = await this.purchaseOrderService.getPurchaseOrders(params);
    this.success(res, result);
  }

  /** 获取采购订单详情 */
  @ErrorHandler
  async getPurchaseOrderById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    const order = await this.purchaseOrderService.getPurchaseOrderById(id);
    this.success(res, order);
  }

  /** 创建采购订单 */
  @ErrorHandler
  async createPurchaseOrder(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req);
    const data = req.body as Record<string, unknown>;
    const created = await this.purchaseOrderService.createPurchaseOrder(data, userId);
    this.success(res, created, '创建成功');
  }

  /** 更新采购订单 */
  @ErrorHandler
  async updatePurchaseOrder(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const data = req.body as Record<string, unknown>;
    const updated = await this.purchaseOrderService.updatePurchaseOrder(id, data, userId);
    this.success(res, updated, '更新成功');
  }

  /** 删除采购订单 */
  @ErrorHandler
  async deletePurchaseOrder(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    await this.purchaseOrderService.deletePurchaseOrder(id);
    this.success(res, null, '删除成功');
  }
}