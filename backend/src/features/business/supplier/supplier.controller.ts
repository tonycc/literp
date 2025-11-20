import type { Request, Response, NextFunction } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ErrorHandler } from '../../../shared/decorators/error-handler'
import { SupplierService } from './supplier.service'

export class SupplierController extends BaseController {
  private supplierService: SupplierService

  constructor() {
    super()
    this.supplierService = new SupplierService()
  }

  @ErrorHandler
  async getSuppliers(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { page, limit } = this.parsePaginationParams(req)
    const params = {
      page,
      pageSize: limit,
      keyword: req.query.keyword as string,
      status: req.query.status as any,
      category: req.query.category as any,
    }
    const result = await this.supplierService.getSuppliers(params)
    this.success(res, result)
  }

  @ErrorHandler
  async getSupplierById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params
    const supplier = await this.supplierService.getSupplierById(id)
    this.success(res, supplier)
  }

  @ErrorHandler
  async createSupplier(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const data = req.body as Record<string, unknown>
    const created = await this.supplierService.createSupplier(data as any, userId)
    this.success(res, created, '创建成功')
  }

  @ErrorHandler
  async updateSupplier(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const { id } = req.params
    const data = req.body as Record<string, unknown>
    const updated = await this.supplierService.updateSupplier(id, data as any, userId)
    this.success(res, updated, '更新成功')
  }

  @ErrorHandler
  async deleteSupplier(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params
    await this.supplierService.deleteSupplier(id)
    this.success(res, null, '删除成功')
  }
}