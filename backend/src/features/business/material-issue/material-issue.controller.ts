import type { Request, Response, NextFunction } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ErrorHandler } from '../../../shared/decorators/error-handler'
import { MaterialIssueService } from './material-issue.service'

export class MaterialIssueController extends BaseController {
  private svc: MaterialIssueService

  constructor() {
    super()
    this.svc = new MaterialIssueService()
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
    }
    const result = await this.svc.listOrders(params)
    this.success(res, result)
  }

  @ErrorHandler
  async createForWorkOrder(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = req.params.id as string
    const userId = this.getUserId(req)
    const order = await this.svc.createPersistedForWorkOrder(id, userId)
    this.success(res, order, '生成领料订单成功')
  }

  @ErrorHandler
  async issueAll(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = req.params.id as string
    const userId = this.getUserId(req)
    const order = await this.svc.issueAll(id, userId)
    this.success(res, order, '已完成领料')
  }

  @ErrorHandler
  async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = req.params.id as string
    const order = await this.svc.getById(id)
    this.success(res, order)
  }

  @ErrorHandler
  async issueItem(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const id = req.params.id as string
    const itemId = req.params.itemId as string
    const quantity = Number((req.body as any)?.quantity || 0)
    const userId = this.getUserId(req)
    const order = await this.svc.issueItem(id, itemId, quantity, userId)
    this.success(res, order, '已部分领取')
  }
}

export default MaterialIssueController