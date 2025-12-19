import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { SalesReceiptService } from './sales-receipt.service';

const salesReceiptService = new SalesReceiptService();

export class SalesReceiptController extends BaseController {
  // 获取列表
  getList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await salesReceiptService.getList(req.query);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // 获取详情
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await salesReceiptService.getById(id);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // 创建
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).userId;
      const result = await salesReceiptService.create(req.body, userId);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // 更新
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).userId;
      const result = await salesReceiptService.update(id, req.body, userId);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // 确认出库
  confirm = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).userId;
      const result = await salesReceiptService.confirm(id, userId);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // 作废
  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).userId;
      const result = await salesReceiptService.cancel(id, userId);
      this.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  // 删除
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await salesReceiptService.delete(id);
      this.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  };
}
