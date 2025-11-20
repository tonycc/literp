import type { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { productionPlanService } from './production-plan.service';
import type { ProductionPlanPreviewRequest } from '@zyerp/shared';

export class ProductionPlanController extends BaseController {
  /** 生产计划预览 */
  @ErrorHandler
  async preview(req: Request, res: Response) {
    const data: ProductionPlanPreviewRequest = req.body;
    if (!data?.salesOrderId) {
      throw new Error('缺少销售订单ID');
    }
    const result = await productionPlanService.preview(data);
    this.success(res, result, '生产计划预览生成成功');
  }

  /** 新增生产计划（基于预览结果快照持久化） */
  @ErrorHandler
  async create(req: Request, res: Response) {
    const userId = this.getUserId(req);
    const data: ProductionPlanPreviewRequest & { name: string; plannedStart: string; plannedFinish: string; finishedWarehouseId: string; issueWarehouseId: string; ownerId: string } = req.body;
    if (!data?.salesOrderId) throw new Error('缺少销售订单ID');
    if (!data?.name) throw new Error('缺少生产计划名称');
    if (!data?.plannedStart || !data?.plannedFinish) throw new Error('缺少计划起止日期');
    if (!data?.finishedWarehouseId) throw new Error('缺少成品入库仓库');
    if (!data?.issueWarehouseId) throw new Error('缺少领料仓库');
    if (!data?.ownerId) throw new Error('缺少生产计划负责人');
    const created = await productionPlanService.create(data, userId);
    this.success(res, { id: created.id }, '生产计划创建成功');
  }

  /** 生产计划列表 */
  @ErrorHandler
  async list(req: Request, res: Response) {
    const paginationParams = this.parsePaginationParams(req);
    const status = req.query.status as string | undefined;
    const orderNo = req.query.orderNo as string | undefined;
    const orderId = req.query.orderId as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const result = await productionPlanService.getList({ page: paginationParams.page, pageSize: paginationParams.limit, status, orderNo, orderId, startDate, endDate });
    this.success(res, result);
  }

  /** 获取生产计划详情 */
  @ErrorHandler
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const plan = await productionPlanService.getById(id);
    this.success(res, plan);
  }

  /** 确认生产计划 */
  @ErrorHandler
  async confirm(req: Request, res: Response) {
    const userId = this.getUserId(req);
    const { id } = req.params;
    await productionPlanService.confirm(id, userId);
    this.success(res, null, '确认成功');
  }

  /** 取消生产计划 */
  @ErrorHandler
  async cancel(req: Request, res: Response) {
    const userId = this.getUserId(req);
    const { id } = req.params;
    await productionPlanService.cancel(id, userId);
    this.success(res, null, '取消成功');
  }

  /** 基于生产计划生成制造订单（仅支持已确认状态） */
  @ErrorHandler
  async generateManufacturingOrders(req: Request, res: Response) {
    const userId = this.getUserId(req)
    const { id } = req.params
    const created = await productionPlanService.generateManufacturingOrders(id, userId)
    this.success(res, created, '制造订单生成成功')
  }

  /** 删除生产计划 */
  @ErrorHandler
  async remove(req: Request, res: Response) {
    const userId = this.getUserId(req)
    const { id } = req.params
    await productionPlanService.remove(id, userId)
    this.success(res, null, '删除成功')
  }
}

export const productionPlanController = new ProductionPlanController();