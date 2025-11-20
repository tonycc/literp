import { Request, Response } from 'express'
import { BaseController } from '../../../shared/controllers/base.controller'
import { ProductAttributeLineService } from './product-attribute-line.service'

export class ProductAttributeLineController extends BaseController {
  constructor(private readonly service: ProductAttributeLineService) { super() }

  list = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string }
    const result = await this.service.list(productId, req.query)
    this.success(res, result.data)
  })

  save = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string }
    const payload = (req.body?.lines || req.body || []) as Array<{ attributeName: string; values: string[] }>
    const result = await this.service.saveLines(productId, payload)
    this.success(res, result.data, '保存成功')
  })

  create = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string }
    const { attributeName, values } = req.body as { attributeName: string; values: string[] }
    const result = await this.service.createLine(productId, attributeName, values || [])
    this.success(res, result.data, '新增成功')
  })

  update = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, lineId } = req.params as { productId: string; lineId: string }
    const { attributeName, values } = req.body as { attributeName?: string; values?: string[] }
    const result = await this.service.updateLine(productId, lineId, attributeName, values)
    this.success(res, result.data, '更新成功')
  })

  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const { productId, lineId } = req.params as { productId: string; lineId: string }
    const result = await this.service.deleteLine(productId, lineId)
    this.success(res, result.data, '删除成功')
  })
}
