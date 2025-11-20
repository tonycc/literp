import type { Request, Response, NextFunction } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ErrorHandler } from '../../../shared/decorators/error-handler'
import { SupplierPriceService } from './supplier-price.service'

export class SupplierPriceController extends BaseController {
  private service: SupplierPriceService
  constructor() {
    super()
    this.service = new SupplierPriceService()
  }

  @ErrorHandler
  async getList(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { page, limit } = this.parsePaginationParams(req)
    const params = {
      page,
      pageSize: limit,
      supplierId: req.query.supplierId as string,
      productName: req.query.productName as string,
      productCode: req.query.productCode as string,
      vatRate: req.query.vatRate ? Number(req.query.vatRate) : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    }
    const result = await this.service.getList(params)
    this.success(res, result)
  }

  @ErrorHandler
  async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params
    const item = await this.service.getById(id)
    this.success(res, item)
  }

  @ErrorHandler
  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const data = req.body as Record<string, unknown>
    const created = await this.service.create(data as any, userId)
    this.success(res, created, '创建成功')
  }

  @ErrorHandler
  async update(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const { id } = req.params
    const data = req.body as Record<string, unknown>
    const updated = await this.service.update(id, data as any, userId)
    this.success(res, updated, '更新成功')
  }

  @ErrorHandler
  async delete(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params
    await this.service.delete(id)
    this.success(res, null, '删除成功')
  }
}