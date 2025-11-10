import type { Request, Response } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { productionPlanService } from './production-plan.service';
import type { ProductionPlanPreviewRequest } from '@zyerp/shared';

export class ProductionPlanController extends BaseController {
  /**
   * 生产计划预览
   */
  @ErrorHandler
  async preview(req: Request, res: Response) {
    const data: ProductionPlanPreviewRequest = req.body;
    if (!data?.salesOrderId) {
      throw new Error('缺少销售订单ID');
    }
    const result = await productionPlanService.preview(data);
    this.success(res, result, '生产计划预览生成成功');
  }
}

export const productionPlanController = new ProductionPlanController();