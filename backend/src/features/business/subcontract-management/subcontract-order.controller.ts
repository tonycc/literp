import type { Request, Response, NextFunction } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ErrorHandler } from '../../../shared/decorators/error-handler'
import { SubcontractOrderService } from './subcontract-order.service'

export class SubcontractOrderController extends BaseController {
  private service: SubcontractOrderService

  constructor() {
    super()
    this.service = new SubcontractOrderService()
  }

  @ErrorHandler
  async list(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const pagination = this.parsePaginationParams(req)
    const params = {
      page: pagination.page,
      pageSize: pagination.limit,
      status: req.query.status as string,
      supplierId: req.query.supplierId as string,
      orderDateStart: req.query.orderDateStart as string,
      orderDateEnd: req.query.orderDateEnd as string,
      dueDateStart: req.query.dueDateStart as string,
      dueDateEnd: req.query.dueDateEnd as string,
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
    this.success(res, created.data, '创建委外订单成功')
  }

  @ErrorHandler
  async updateStatus(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const id = req.params.id as string
    const status = req.body?.status as string
    const result = await this.service.updateStatus(id, status, userId)
    this.success(res, result.data, '委外订单状态更新成功')
  }

  @ErrorHandler
  async delete(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = req.params.id as string
    await this.service.delete(id)
    this.success(res, undefined, '删除委外订单成功')
  }

  @ErrorHandler
  async generateByWorkOrders(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const data = req.body as { workOrderIds: string[]; defaultSupplierId: string; expectedDeliveryDate?: string; groupingStrategy?: 'supplier' | 'dueDate' | 'operation'; currency?: string; itemPriceOverrides?: Array<{ workOrderId: string; price: number }> }
    const result = await this.service.generateByWorkOrders(data, userId)
    this.success(res, result.data, '批量生成委外订单成功')
  }
}
