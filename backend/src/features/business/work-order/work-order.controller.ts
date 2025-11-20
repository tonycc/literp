import type { Request, Response, NextFunction } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ErrorHandler } from '../../../shared/decorators/error-handler'
import { WorkOrderService } from './work-order.service'
import type { CreateWorkOrderRequest, WorkOrderStatus } from '@zyerp/shared'

export class WorkOrderController extends BaseController {
  private workOrderService: WorkOrderService

  constructor() {
    super()
    this.workOrderService = new WorkOrderService()
  }

  @ErrorHandler
  async list(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const pagination = this.parsePaginationParams(req)
    const params = {
      page: pagination.page,
      pageSize: pagination.limit,
      status: req.query.status as string,
      workcenterId: req.query.workcenterId as string,
      moId: req.query.moId as string,
      start: req.query.start as string,
      end: req.query.end as string,
    }
    const result = await this.workOrderService.getList(params)
    this.success(res, result)
  }

  @ErrorHandler
  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const data = req.body as CreateWorkOrderRequest
    const created = await this.workOrderService.create(data, userId)
    this.success(res, created, '创建工单成功')
  }

  @ErrorHandler
  async updateStatus(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const id = req.params.id as string
    const status = req.body?.status as WorkOrderStatus
    const result = await this.workOrderService.updateStatus(id, status, userId)
    this.success(res, result, '工单状态更新成功')
  }

  @ErrorHandler
  async delete(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = req.params.id as string
    await this.workOrderService.delete(id)
    this.success(res, undefined, '删除工单成功')
  }
}