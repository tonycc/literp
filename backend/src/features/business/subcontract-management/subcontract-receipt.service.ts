import { BaseService } from '../../../shared/services/base.service'
import type { PrismaClient, Prisma } from '@prisma/client'

export class SubcontractReceiptService extends BaseService {
  private async generateReceiptNo(client?: Prisma.TransactionClient | PrismaClient): Promise<string> {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const y = now.getFullYear()
    const m = pad(now.getMonth() + 1)
    const d = pad(now.getDate())
    const prefix = `SR${y}${m}${d}`
    const prisma = client ?? this.prisma
    const last = await prisma.subcontractReceipt.findFirst({ where: { receiptNo: { startsWith: prefix } }, orderBy: { receiptNo: 'desc' }, select: { receiptNo: true } })
    let next = 1
    if (last?.receiptNo) {
      const m2 = last.receiptNo.match(new RegExp(`^${prefix}(\\d+)$`))
      if (m2 && m2[1]) next = parseInt(m2[1], 10) + 1
    }
    return `${prefix}${String(next).padStart(4, '0')}`
  }

  async getList(params: Record<string, unknown>) {
    const page = typeof params.page === 'number' ? params.page : Number(params.page || 1)
    const pageSize = typeof params.pageSize === 'number' ? params.pageSize : Number(params.pageSize || 10)
    const pagination = this.getPaginationConfig(page, pageSize)
    const status = typeof params.status === 'string' ? params.status : undefined
    const orderId = typeof params.orderId === 'string' ? params.orderId : undefined
    const supplierId = typeof params.supplierId === 'string' ? params.supplierId : undefined
    const receivedDateStart = typeof params.receivedDateStart === 'string' ? params.receivedDateStart : undefined
    const receivedDateEnd = typeof params.receivedDateEnd === 'string' ? params.receivedDateEnd : undefined

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (orderId) where.orderId = orderId
    if (supplierId) where.supplierId = supplierId
    if (receivedDateStart && receivedDateEnd) {
      where.AND = [{ receivedDate: { gte: receivedDateStart } }, { receivedDate: { lte: receivedDateEnd } }]
    }

    const [total, rows] = await Promise.all([
      this.prisma.subcontractReceipt.count({ where: where as any }),
      this.prisma.subcontractReceipt.findMany({ where: where as any, skip: pagination.skip, take: pagination.take, orderBy: [{ receivedDate: 'desc' }, { receiptNo: 'desc' }] }),
    ])

    const ids = rows.map(r => r.id)
    const sumMap = new Map<string, number>()
    if (ids.length > 0) {
      const items = await this.prisma.subcontractReceiptItem.findMany({ where: { receiptId: { in: ids } }, select: { receiptId: true, receivedQuantity: true } })
      for (const it of items) {
        const prev = sumMap.get(it.receiptId) || 0
        sumMap.set(it.receiptId, prev + Number(it.receivedQuantity || 0))
      }
    }
    const enriched = rows.map(r => ({ ...r, receivedQuantityTotal: sumMap.get(r.id) || 0 }))

    return this.buildPaginatedResponse(enriched, total, pagination.page, pagination.pageSize)
  }

  async getById(id: string) {
    const receipt = await this.prisma.subcontractReceipt.findUnique({ where: { id } })
    if (!receipt) throw new Error('委外收货单不存在')
    const items = await this.prisma.subcontractReceiptItem.findMany({ where: { receiptId: id } })
    return { success: true, data: { ...receipt, items }, message: '获取成功', timestamp: new Date().toISOString() }
  }

  async create(data: { orderId: string; supplierId?: string | null; receivedDate?: string; warehouseId?: string | null; items: Array<{ orderItemId: string; receivedQuantity: number; warehouseId?: string | null }> }, userId: string) {
    if (!data?.orderId) throw new Error('缺少委外订单')
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('缺少收货明细')
    for (const it of data.items) {
      const q = Number(it.receivedQuantity || 0)
      if (!Number.isFinite(q) || q <= 0) throw new Error('收货数量不合法')
    }
    return this.prisma.$transaction(async (tx) => {
      // 校验不超额收货
      const orderItems = await tx.subcontractOrderItem.findMany({ where: { id: { in: data.items.map(i => i.orderItemId) } }, select: { id: true, quantity: true } })
      const oiMap = new Map(orderItems.map(oi => [oi.id, Number(oi.quantity || 0)]))
      const receivedAgg = await tx.subcontractReceiptItem.groupBy({ by: ['orderItemId'], where: { orderItemId: { in: data.items.map(i => i.orderItemId) } }, _sum: { receivedQuantity: true } })
      const recMap = new Map(receivedAgg.map(r => [r.orderItemId, Number(r._sum.receivedQuantity || 0)]))
      for (const it of data.items) {
        const limit = oiMap.get(it.orderItemId) || 0
        const done = recMap.get(it.orderItemId) || 0
        if (done + Number(it.receivedQuantity || 0) > limit + 1e-8) {
          throw new Error('收货数量超出订单明细可收数量')
        }
      }

      const receiptNo = await this.generateReceiptNo(tx)
      const created = await tx.subcontractReceipt.create({
        data: {
          receiptNo,
          orderId: data.orderId,
          supplierId: data.supplierId ?? null,
          receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
          warehouseId: data.warehouseId ?? null,
          qcStatus: null,
          status: 'draft',
          createdBy: userId,
          updatedBy: userId,
        },
      })
      await tx.subcontractReceiptItem.createMany({ data: data.items.map(i => ({ receiptId: created.id, orderItemId: i.orderItemId, receivedQuantity: Number(i.receivedQuantity || 0), warehouseId: i.warehouseId ?? null })) })
      // 更新订单明细状态：部分收货/已收货
      const itemAgg = await tx.subcontractReceiptItem.groupBy({ by: ['orderItemId'], where: { orderItemId: { in: data.items.map(i => i.orderItemId) } }, _sum: { receivedQuantity: true } })
      for (const agg of itemAgg) {
        const limit = oiMap.get(agg.orderItemId) || 0
        const done = Number(agg._sum.receivedQuantity || 0)
        const status = done >= limit - 1e-8 ? 'received' : 'partially_received'
        await tx.subcontractOrderItem.update({ where: { id: agg.orderItemId }, data: { status } })
      }
      return { success: true, data: created, message: '创建收货单成功', timestamp: new Date().toISOString() }
    })
  }

  async updateStatus(id: string, status: string, userId: string) {
    const receipt = await this.prisma.subcontractReceipt.findUnique({ where: { id } })
    if (!receipt) throw new Error('委外收货单不存在')
    const current = receipt.status as string
    const allow: Record<string, string[]> = { draft: ['confirmed'], confirmed: ['posted'], posted: [] }
    const allowed = allow[current] ?? []
    if (!allowed.includes(status)) throw new Error('不允许的状态流转')
    const updated = await this.prisma.subcontractReceipt.update({ where: { id }, data: { status, updatedBy: userId, updatedAt: new Date() } })
    return { success: true, data: updated, message: '收货单状态更新成功', timestamp: new Date().toISOString() }
  }
}