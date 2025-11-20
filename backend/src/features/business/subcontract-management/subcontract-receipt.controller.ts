import type { Request, Response, NextFunction } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ErrorHandler } from '../../../shared/decorators/error-handler'
import { SubcontractReceiptService } from './subcontract-receipt.service'

export class SubcontractReceiptController extends BaseController {
  private service: SubcontractReceiptService

  constructor() {
    super()
    this.service = new SubcontractReceiptService()
  }

  @ErrorHandler
  async list(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const pagination = this.parsePaginationParams(req)
    const params = {
      page: pagination.page,
      pageSize: pagination.limit,
      status: req.query.status as string,
      orderId: req.query.orderId as string,
      supplierId: req.query.supplierId as string,
      receivedDateStart: req.query.receivedDateStart as string,
      receivedDateEnd: req.query.receivedDateEnd as string,
    }
    const result = await this.service.getList(params)
    this.success(res, result)
  }

  @ErrorHandler
  async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = req.params.id as string
    const result = await this.service.getById(id)
    this.success(res, result.data)
  }

  @ErrorHandler
  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const data = req.body as any
    const created = await this.service.create(data, userId)
    this.success(res, created.data, '创建委外收货单成功')
  }

  @ErrorHandler
  async updateStatus(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const id = req.params.id as string
    const status = req.body?.status as string
    const result = await this.service.updateStatus(id, status, userId)
    this.success(res, result.data, '收货单状态更新成功')
  }
}
