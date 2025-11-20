import { BaseService } from '../../../shared/services/base.service'
import type { CreateProductionReportData, ProductionReport } from '@zyerp/shared'

export class ProductionReportService extends BaseService {
  async create(data: CreateProductionReportData, userId?: string): Promise<ProductionReport> {
    const now = new Date()
    const reportNo = `PR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${now.getTime()}`
    const payload = {
      reportNo,
      workOrderId: data.workOrderId ?? null,
      workOrderNo: data.workOrderNo ?? null,
      teamId: data.teamId ?? null,
      teamName: data.teamName ?? null,
      reporterId: data.reporterId ?? userId ?? null,
      reporterName: data.reporterName ?? null,
      reportTime: data.reportTime ? new Date(data.reportTime) : now,
      productId: data.productId ?? null,
      productCode: data.productCode ?? null,
      productName: data.productName ?? null,
      specification: data.specification ?? null,
      reportedQuantity: Number(data.reportedQuantity || 0),
      qualifiedQuantity: Number(data.qualifiedQuantity || 0),
      defectQuantity: Number(data.defectQuantity || 0),
      processCode: data.processCode ?? null,
      processName: data.processName ?? null,
      remark: data.remark ?? null,
      createdBy: userId ?? null,
      updatedBy: userId ?? null,
    }
    const created = await this.prisma.productionReport.create({ data: payload as any })
    return { ...payload, id: created.id, createdAt: created.createdAt, updatedAt: created.updatedAt }
  }

  async getById(id: string): Promise<ProductionReport> {
    const r = await this.prisma.productionReport.findUnique({ where: { id } })
    if (!r) throw new Error('报工记录不存在')
    return r as unknown as ProductionReport
  }

  async list(params: Record<string, unknown>) {
    const page = Number(params.page || 1)
    const pageSize = Number(params.pageSize || 10)
    const { skip, take } = this.getPaginationConfig(page, pageSize)
    const where: Record<string, unknown> = {}
    if (typeof params.workOrderId === 'string') where.workOrderId = params.workOrderId
    if (typeof params.workOrderNo === 'string') where.workOrderNo = params.workOrderNo
    if (typeof params.from === 'string' || typeof params.to === 'string') {
      const from = typeof params.from === 'string' ? new Date(params.from) : undefined
      const to = typeof params.to === 'string' ? new Date(params.to) : undefined
      where.reportTime = {
        gte: from,
        lte: to,
      }
    }
    const [total, rows] = await Promise.all([
      this.prisma.productionReport.count({ where: where as any }),
      this.prisma.productionReport.findMany({ where: where as any, skip, take, orderBy: { reportTime: 'desc' } }),
    ])
    return this.buildPaginatedResponse(rows as unknown as ProductionReport[], total, page, pageSize)
  }
}

export default ProductionReportService