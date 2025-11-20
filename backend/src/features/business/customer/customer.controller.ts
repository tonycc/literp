import type { Request, Response, NextFunction } from 'express';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { CustomerService } from './customer.service';
import type { CustomerListParams, CreateCustomerData, UpdateCustomerData } from '@zyerp/shared';
import { CustomerCategory, CustomerStatus, CreditLevel } from '@zyerp/shared';

export class CustomerController extends BaseController {
  private service: CustomerService;

  constructor() {
    super();
    this.service = new CustomerService();
  }

  @ErrorHandler
  async getCustomerOptions(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const keyword = (req.query.keyword as string) || '';
    const activeOnly = this.parseBooleanParam(req.query.activeOnly);
    const data = await this.service.getCustomerOptions({ keyword, activeOnly });
    this.success(res, data);
  }

  @ErrorHandler
  async getCustomers(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { page, limit } = this.parsePaginationParams(req);
    const catStr = req.query.category as string | undefined;
    const statusStr = req.query.status as string | undefined;
    const levelStr = req.query.creditLevel as string | undefined;
    const orderStr = (req.query.sortOrder as string | undefined) || 'desc';
    const params: CustomerListParams = {
      page,
      pageSize: limit,
      keyword: (req.query.keyword as string) || undefined,
      category: catStr && Object.values(CustomerCategory).includes(catStr as CustomerCategory) ? (catStr as CustomerCategory) : undefined,
      status: statusStr && Object.values(CustomerStatus).includes(statusStr as CustomerStatus) ? (statusStr as CustomerStatus) : undefined,
      creditLevel: levelStr && Object.values(CreditLevel).includes(levelStr as CreditLevel) ? (levelStr as CreditLevel) : undefined,
      industry: (req.query.industry as string) || undefined,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (orderStr === 'asc' || orderStr === 'desc') ? orderStr : 'desc',
    };
    const result = await this.service.getCustomers(params);
    this.success(res, result);
  }

  @ErrorHandler
  async getCustomerById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    const customer = await this.service.getCustomerById(id);
    this.success(res, customer);
  }

  @ErrorHandler
  async createCustomer(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req);
    const created = await this.service.createCustomer(req.body as CreateCustomerData, userId);
    this.success(res, created, '创建成功');
  }

  @ErrorHandler
  async updateCustomer(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req);
    const { id } = req.params;
    const updated = await this.service.updateCustomer(id, req.body as UpdateCustomerData, userId);
    this.success(res, updated, '更新成功');
  }

  @ErrorHandler
  async deleteCustomer(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    await this.service.deleteCustomer(id);
    this.success(res, null, '删除成功');
  }
}