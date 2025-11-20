import type { Request, Response, NextFunction } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ErrorHandler } from '../../../shared/decorators/error-handler'
import { ManufacturingOrderService } from './manufacturing-order.service'

export class ManufacturingOrderController extends BaseController {
  private manufacturingOrderService: ManufacturingOrderService

  constructor() {
    super()
    this.manufacturingOrderService = new ManufacturingOrderService()
  }

  @ErrorHandler
  async createFromPlan(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const data = req.body as Record<string, unknown>
    const created = await this.manufacturingOrderService.createFromPlan(data as any, userId)
    this.success(res, created, '生成制造订单成功')
  }

  @ErrorHandler
  async getManufacturingOrders(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const paginationParams = this.parsePaginationParams(req)
    const params = {
      page: paginationParams.page,
      pageSize: paginationParams.limit,
      status: req.query.status as string,
      productCode: req.query.productCode as string,
      orderNo: req.query.orderNo as string,
      sourceOrderNo: req.query.sourceOrderNo as string,
    }
    const result = await this.manufacturingOrderService.getList(params)
    this.success(res, result)
  }

  @ErrorHandler
  async getManufacturingOrderById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params
    const mo = await this.manufacturingOrderService.getById(id)
    this.success(res, mo)
  }

  @ErrorHandler
  async confirm(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const { id } = req.params
    await this.manufacturingOrderService.confirm(id, userId)
    this.success(res, null, '确认成功')
  }

  @ErrorHandler
  async cancel(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const { id } = req.params
    await this.manufacturingOrderService.cancel(id, userId)
    this.success(res, null, '取消成功')
  }

  @ErrorHandler
  async generateWorkOrders(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const { id } = req.params
    const payload = req.body as Record<string, unknown>
    try {
      const bs = typeof payload?.baselineStart === 'string' ? payload?.baselineStart : undefined
      const bf = typeof payload?.baselineFinish === 'string' ? payload?.baselineFinish : undefined
      const items = Array.isArray((payload as any)?.items) ? ((payload as any)?.items as any[]) : []
      console.log('[generateWorkOrders][controller] moId:', id, 'baselineStart:', bs, 'baselineFinish:', bf, 'items.count:', items.length)
      if (items.length) {
        console.log('[generateWorkOrders][controller] firstItem.plannedStart:', items[0]?.plannedStart, 'plannedFinish:', items[0]?.plannedFinish)
      }
    } catch {}
    const created = await this.manufacturingOrderService.generateWorkOrders(id, userId, payload as any)
    this.success(res, created, '生成工单成功')
  }

  @ErrorHandler
  async getWorkOrders(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params
    const list = await this.manufacturingOrderService.getWorkOrdersByMo(id)
    this.success(res, list)
  }

  @ErrorHandler
  async remove(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = this.getUserId(req)
    const { id } = req.params
    await this.manufacturingOrderService.remove(id, userId)
    this.success(res, null, '删除成功')
  }
}