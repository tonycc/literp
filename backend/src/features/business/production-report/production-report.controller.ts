import type { Request, Response, NextFunction } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ErrorHandler } from '../../../shared/decorators/error-handler'
import { ProductionReportService } from './production-report.service'

export class ProductionReportController extends BaseController {
  private svc: ProductionReportService

  constructor() {
    super()
    this.svc = new ProductionReportService()
  }

  @ErrorHandler
  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const order = await this.svc.create(req.body as any, userId)
    this.success(res, order, '报工创建成功')
  }

  @ErrorHandler
  async list(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const pagination = this.parsePaginationParams(req)
    const result = await this.svc.list({ page: pagination.page, pageSize: pagination.limit, workOrderId: req.query.workOrderId, workOrderNo: req.query.workOrderNo, from: req.query.from, to: req.query.to })
    this.success(res, result)
  }

  @ErrorHandler
  async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = req.params.id as string
    const result = await this.svc.getById(id)
    this.success(res, result)
  }
}

export default ProductionReportController