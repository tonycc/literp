import type { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { CustomerPriceListService } from './customer-price-list.service';

export class CustomerPriceListController extends BaseController {
  private service: CustomerPriceListService;

  constructor() {
    super();
    this.service = new CustomerPriceListService();
  }

  @ErrorHandler
  async getList(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { page, limit } = this.parsePaginationParams(req);
    const orderStr = (req.query.sortOrder as string) || 'desc';
    const params: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      customerId?: string;
      productCode?: string;
      status?: string;
      salesManager?: string;
      effectiveDateStart?: string;
      effectiveDateEnd?: string;
      expiryDate?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {
      page,
      pageSize: limit,
      keyword: (req.query.keyword as string) || undefined,
      customerId: (req.query.customerId as string) || undefined,
      productCode: (req.query.productCode as string) || undefined,
      status: (req.query.status as string) || undefined,
      salesManager: (req.query.salesManager as string) || undefined,
      effectiveDateStart: (req.query.effectiveDateStart as string) || undefined,
      effectiveDateEnd: (req.query.effectiveDateEnd as string) || undefined,
      expiryDate: (req.query.expiryDate as string) || undefined,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (orderStr === 'asc' || orderStr === 'desc') ? orderStr : 'desc',
    };
    const result = await this.service.getList(params);
    this.success(res, result);
  }

  @ErrorHandler
  async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    const row = await this.service.getById(id);
    this.success(res, row);
  }

  @ErrorHandler
  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req);
    const created = await this.service.create(req.body as Record<string, unknown>, userId);
    this.success(res, created, '创建成功');
  }

  @ErrorHandler
  async update(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const updated = await this.service.update(id, req.body as Record<string, unknown>, userId);
    this.success(res, updated, '更新成功');
  }

  @ErrorHandler
  async remove(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    await this.service.delete(id);
    this.success(res, null, '删除成功');
  }
}