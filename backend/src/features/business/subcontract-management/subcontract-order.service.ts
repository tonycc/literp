import { BaseService } from '../../../shared/services/base.service'
import type { PrismaClient, Prisma } from '@prisma/client'

export class SubcontractOrderService extends BaseService {
  private async generateOrderNo(client?: Prisma.TransactionClient | PrismaClient): Promise<string> {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const y = now.getFullYear()
    const m = pad(now.getMonth() + 1)
    const d = pad(now.getDate())
    const prefix = `SO${y}${m}${d}`
    const prisma = client ?? this.prisma
    const last = await prisma.subcontractOrder.findFirst({ where: { orderNo: { startsWith: prefix } }, orderBy: { orderNo: 'desc' }, select: { orderNo: true } })
    let next = 1
    if (last?.orderNo) {
      const m2 = last.orderNo.match(new RegExp(`^${prefix}(\\d+)$`))
      if (m2 && m2[1]) next = parseInt(m2[1], 10) + 1
    }
    return `${prefix}${String(next).padStart(4, '0')}`
  }

  async getList(params: Record<string, unknown>) {
    const page = typeof params.page === 'number' ? params.page : Number(params.page || 1)
    const pageSize = typeof params.pageSize === 'number' ? params.pageSize : Number(params.pageSize || 10)
    const pagination = this.getPaginationConfig(page, pageSize)
    const status = typeof params.status === 'string' ? params.status : undefined
    const supplierId = typeof params.supplierId === 'string' ? params.supplierId : undefined
    const orderDateStart = typeof params.orderDateStart === 'string' ? params.orderDateStart : undefined
    const orderDateEnd = typeof params.orderDateEnd === 'string' ? params.orderDateEnd : undefined
   

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (supplierId) where.supplierId = supplierId
    if (orderDateStart && orderDateEnd) {
      where.AND = [{ orderDate: { gte: orderDateStart } }, { orderDate: { lte: orderDateEnd } }]
    }

    const [total, rows] = await Promise.all([
      this.prisma.subcontractOrder.count({ where: where as any }),
      this.prisma.subcontractOrder.findMany({ where: where as any, skip: pagination.skip, take: pagination.take, orderBy: [{ orderDate: 'desc' }, { orderNo: 'desc' }] }),
    ])

    const orderIds = rows.map(r => r.id)
    const itemCounts = orderIds.length
      ? await this.prisma.subcontractOrderItem.groupBy({ by: ['orderId'], where: { orderId: { in: orderIds } }, _count: { _all: true } })
      : []
    const countMap = new Map(itemCounts.map(it => [it.orderId, it._count._all as number]))

    let firstItemMap = new Map<string, { workOrderId: string | null; productId: string | null; productCode: string | null; productName: string | null; operationId: string | null; price: number | null }>()
    if (orderIds.length) {
      const firstIds = await this.prisma.subcontractOrderItem.groupBy({ by: ['orderId'], where: { orderId: { in: orderIds } }, _min: { id: true } })
      const ids = firstIds.map(x => x._min.id).filter(Boolean) as string[]
      if (ids.length) {
        const firstItems = await this.prisma.subcontractOrderItem.findMany({ where: { id: { in: ids } }, select: { orderId: true, workOrderId: true, productId: true, productCode: true, productName: true, operationId: true, price: true } })
        firstItemMap = new Map(firstItems.map(fi => [fi.orderId, { workOrderId: fi.workOrderId ?? null, productId: fi.productId ?? null, productCode: fi.productCode ?? null, productName: fi.productName ?? null, operationId: fi.operationId ?? null, price: typeof fi.price === 'number' ? fi.price : null }]))
      }
    }

    // 映射：工单编号、工序名称、提交人姓名
    const woIds = Array.from(new Set(Array.from(firstItemMap.values()).map(v => v.workOrderId).filter(Boolean))) as string[]
    const opIds = Array.from(new Set(Array.from(firstItemMap.values()).map(v => v.operationId).filter(Boolean))) as string[]
    const userIds = Array.from(new Set(rows.map(r => r.createdBy).filter(Boolean))) as string[]
    const woNos = woIds.length ? await this.prisma.workOrder.findMany({ where: { id: { in: woIds } }, select: { id: true, orderNo: true } }) : []
    const opNames = opIds.length ? await this.prisma.operation.findMany({ where: { id: { in: opIds } }, select: { id: true, name: true } }) : []
    const users = userIds.length ? await this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, username: true } }) : []
    const woNoMap = new Map(woNos.map(w => [w.id, w.orderNo]))
    const opNameMap = new Map(opNames.map(o => [o.id, o.name]))
    const userNameMap = new Map(users.map(u => [u.id, u.username]))

    const enriched = rows.map(r => {
      const fi = firstItemMap.get(r.id)
      return {
        ...r,
        totalAmount: typeof r.totalAmount === 'number' ? r.totalAmount : null,
        itemsCount: countMap.get(r.id) || 0,
        firstWorkOrderId: fi?.workOrderId ?? null,
        firstWorkOrderNo: fi?.workOrderId ? (woNoMap.get(fi.workOrderId) ?? null) : null,
        firstProductId: fi?.productId ?? null,
        firstProductCode: fi?.productCode ?? null,
        firstProductName: fi?.productName ?? null,
        firstOperationId: fi?.operationId ?? null,
        firstOperationName: fi?.operationId ? (opNameMap.get(fi.operationId) ?? null) : null,
        firstPrice: fi?.price ?? null,
        submittedBy: r.createdBy ?? null,
        submittedByName: r.createdBy ? (userNameMap.get(r.createdBy) ?? null) : null,
        submittedAt: r.createdAt ?? null,
      }
    })
    return this.buildPaginatedResponse(enriched, total, pagination.page, pagination.pageSize)
  }

  async getById(id: string) {
    const order = await this.prisma.subcontractOrder.findUnique({ where: { id } })
    if (!order) throw new Error('委外订单不存在')
    const items = await this.prisma.subcontractOrderItem.findMany({ where: { orderId: id } })
    const woIds = Array.from(new Set(items.map(i => i.workOrderId).filter(Boolean))) as string[]
    const opIds = Array.from(new Set(items.map(i => i.operationId).filter(Boolean))) as string[]
    const woNos = woIds.length ? await this.prisma.workOrder.findMany({ where: { id: { in: woIds } }, select: { id: true, orderNo: true } }) : []
    const opNames = opIds.length ? await this.prisma.operation.findMany({ where: { id: { in: opIds } }, select: { id: true, name: true } }) : []
    const woNoMap = new Map(woNos.map(w => [w.id, w.orderNo]))
    const opNameMap = new Map(opNames.map(o => [o.id, o.name]))
    const enrichedItems = items.map(it => ({
      ...it,
      workOrderNo: it.workOrderId ? (woNoMap.get(it.workOrderId) ?? null) : null,
      operationName: it.operationId ? (opNameMap.get(it.operationId) ?? null) : null,
    }))
    return { success: true, data: { ...order, items: enrichedItems }, message: '获取成功', timestamp: new Date().toISOString() }
  }

  async create(data: { supplierId: string; supplierName?: string | null; expectedDeliveryDate?: string; currency?: string; remark?: string | null; moId?: string | null; items: Array<{ workOrderId: string; routingWorkcenterId?: string | null; operationId: string; productId: string; productCode?: string | null; productName?: string | null; unitId?: string | null; quantity: number; price?: number | null; dueDate?: string | null }> }, userId: string) {
    if (!data?.supplierId) throw new Error('缺少供应商')
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('缺少明细')
    for (const it of data.items) {
      const q = Number(it.quantity || 0)
      if (!Number.isFinite(q) || q <= 0) throw new Error('明细数量不合法')
    }
    return this.prisma.$transaction(async (tx) => {
      const orderNo = await this.generateOrderNo(tx)
      const created = await tx.subcontractOrder.create({
        data: {
          orderNo,
          supplierId: data.supplierId,
          supplierName: data.supplierName ?? null,
          status: 'draft',
          orderDate: new Date(),
          expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
          currency: data.currency ?? 'CNY',
          totalAmount: null,
          moId: data.moId ?? null,
          remark: data.remark ?? null,
          createdBy: userId,
          updatedBy: userId,
        },
      })
      if (Array.isArray(data.items) && data.items.length) {
        await tx.subcontractOrderItem.createMany({
          data: data.items.map((it) => ({
            orderId: created.id,
            workOrderId: it.workOrderId,
            routingWorkcenterId: it.routingWorkcenterId ?? null,
            operationId: it.operationId,
            productId: it.productId,
            productCode: it.productCode ?? null,
            productName: it.productName ?? null,
            unitId: it.unitId ?? null,
            quantity: Number(it.quantity || 0),
            price: it.price ?? null,
            amount: it.price ? Number(it.price || 0) * Number(it.quantity || 0) : null,
            dueDate: it.dueDate ? new Date(it.dueDate) : null,
            status: 'pending',
            remark: null,
          }) ),
        })
        const sum = await tx.subcontractOrderItem.aggregate({ where: { orderId: created.id }, _sum: { amount: true } })
        await tx.subcontractOrder.update({ where: { id: created.id }, data: { totalAmount: sum._sum.amount ?? null } })
      }
      return { success: true, data: created, message: '创建委外订单成功', timestamp: new Date().toISOString() }
    })
  }

  async updateStatus(id: string, status: string, userId: string) {
    const order = await this.prisma.subcontractOrder.findUnique({ where: { id } })
    if (!order) throw new Error('委外订单不存在')
    const current = order.status as string
    const allow: Record<string, string[]> = {
      draft: ['released', 'cancelled'],
      released: ['in_progress', 'cancelled'],
      in_progress: ['received', 'cancelled'],
      received: ['completed'],
      completed: [],
      cancelled: [],
    }
    const allowed = allow[current] ?? []
    if (!allowed.includes(status)) throw new Error('不允许的状态流转')
    const updated = await this.prisma.subcontractOrder.update({ where: { id }, data: { status, updatedBy: userId, updatedAt: new Date() } })
    return { success: true, data: updated, message: '状态更新成功', timestamp: new Date().toISOString() }
  }

  async delete(id: string) {
    const order = await this.prisma.subcontractOrder.findUnique({ where: { id } })
    if (!order) throw new Error('委外订单不存在')
    if (order.status !== 'draft') throw new Error('仅允许删除草稿委外订单')
    await this.prisma.subcontractOrderItem.deleteMany({ where: { orderId: id } })
    await this.prisma.subcontractOrder.delete({ where: { id } })
    return { success: true, data: undefined, message: '删除成功', timestamp: new Date().toISOString() }
  }

  async generateByWorkOrders(data: { workOrderIds: string[]; defaultSupplierId: string; expectedDeliveryDate?: string; groupingStrategy?: 'supplier' | 'dueDate' | 'operation'; currency?: string; itemPriceOverrides?: Array<{ workOrderId: string; price: number }> }, userId: string) {
    const ids = Array.isArray(data.workOrderIds) ? Array.from(new Set(data.workOrderIds.filter(Boolean))) : []
    if (!ids.length) throw new Error('缺少工单ID集合')
    if (!data.defaultSupplierId) throw new Error('缺少默认供应商')
    const existingItems = await this.prisma.subcontractOrderItem.findMany({ where: { workOrderId: { in: ids } }, select: { workOrderId: true } })
    const existed = new Set(existingItems.map(i => i.workOrderId))
    const targets = ids.filter(id => !existed.has(id))
    if (!targets.length) {
      return { success: true, data: [], message: '目标工单均已生成委外明细', timestamp: new Date().toISOString() }
    }
    const workOrders = await this.prisma.workOrder.findMany({ where: { id: { in: targets } } })
    if (!workOrders.length) throw new Error('未找到工单')
    const moIds = Array.from(new Set(workOrders.map(w => w.moId)))
    const mos = await this.prisma.manufacturingOrder.findMany({ where: { id: { in: moIds } }, select: { id: true, productId: true, productCode: true, productName: true, unitId: true, dueDate: true } })
    const moMap = new Map(mos.map(m => [m.id, m]))
    const wrwcs = await this.prisma.workOrderRoutingWorkcenter.findMany({ where: { workOrderId: { in: targets } }, select: { workOrderId: true, routingWorkcenterId: true, routingWorkcenter: { select: { operationId: true, workcenter: { select: { type: true } } } } } })
    const priceMap = new Map<string, number>()
    if (Array.isArray(data.itemPriceOverrides)) {
      for (const ov of data.itemPriceOverrides) {
        const p = Number(ov.price)
        if (ov.workOrderId && Number.isFinite(p) && p >= 0) priceMap.set(ov.workOrderId, p)
      }
    }
    // 准备工序默认单价（来自 operation.wageRate）
    const opIdByWorkOrder = new Map<string, string>()
    for (const wo of workOrders) {
      const ops = wrwcs.filter(x => x.workOrderId === wo.id)
      const opId = ops.length ? String(ops[0].routingWorkcenter?.operationId) : String(wo.operationId)
      if (opId) opIdByWorkOrder.set(wo.id, opId)
    }
    const opIds = Array.from(new Set(Array.from(opIdByWorkOrder.values()).filter(Boolean))) as string[]
    let opWageMap = new Map<string, number>()
    if (opIds.length) {
      const baseOps = await this.prisma.operation.findMany({ where: { id: { in: opIds } }, select: { id: true, wageRate: true } })
      opWageMap = new Map(baseOps.map(o => [o.id, (typeof (o as any).wageRate === 'number' ? (o as any).wageRate : 0)]))
    }

    const itemsByOrder: Record<string, Array<{ workOrderId: string; routingWorkcenterId?: string | null; operationId: string; productId: string; productCode?: string | null; productName?: string | null; unitId?: string | null; quantity: number; price?: number | null; dueDate?: Date | null }>> = {}
    for (const wo of workOrders) {
      const mo = moMap.get(wo.moId)
      const ops = wrwcs.filter(x => x.workOrderId === wo.id)
      const out = ops.find(x => {
        const t = x.routingWorkcenter?.workcenter?.type
        const tl = typeof t === 'string' ? t.toLowerCase() : ''
        return tl === 'outsourcing' || tl.includes('outsource') || /外协|委外|外包/.test(String(t))
      })
      const chosen = out ?? (ops.length ? ops[0] : undefined)
      const opId = chosen ? String(chosen.routingWorkcenter?.operationId) : String(wo.operationId)
      const routingWorkcenterId = chosen ? (chosen.routingWorkcenterId ?? null) : null
      const defaultPrice = opWageMap.get(opId) ?? null
      const it = {
        workOrderId: wo.id,
        routingWorkcenterId,
        operationId: opId,
        productId: mo?.productId || '',
        productCode: mo?.productCode ?? null,
        productName: mo?.productName ?? null,
        unitId: mo?.unitId ?? null,
        quantity: Number(wo.quantity || 0) || 1,
        price: priceMap.get(wo.id) ?? defaultPrice,
        dueDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : (mo?.dueDate ?? null) as any,
      }
      const key = data.defaultSupplierId
      itemsByOrder[key] = itemsByOrder[key] || []
      itemsByOrder[key].push(it)
    }
    const result: Array<{ orderId: string; orderNo: string; supplierId: string; itemsCount: number }> = []
    await this.prisma.$transaction(async (tx) => {
      for (const [supplierId, items] of Object.entries(itemsByOrder)) {
        const orderNo = await this.generateOrderNo(tx)
        const supplier = await tx.supplier.findUnique({ where: { id: supplierId } })
        const order = await tx.subcontractOrder.create({ data: { orderNo, supplierId, supplierName: supplier?.name ?? null, status: 'draft', orderDate: new Date(), expectedDeliveryDate: items[0]?.dueDate ?? null, currency: data.currency ?? 'CNY', totalAmount: null, moId: null, remark: null, createdBy: userId, updatedBy: userId } })
        await tx.subcontractOrderItem.createMany({ data: items.map(it => ({ orderId: order.id, workOrderId: it.workOrderId, routingWorkcenterId: it.routingWorkcenterId ?? null, operationId: it.operationId, productId: it.productId, productCode: it.productCode ?? null, productName: it.productName ?? null, unitId: it.unitId ?? null, quantity: it.quantity, price: it.price ?? null, amount: (typeof it.price === 'number' ? it.price : null) ? Number(it.price || 0) * Number(it.quantity || 0) : null, dueDate: it.dueDate ?? null, status: 'pending', remark: null })) })
        result.push({ orderId: order.id, orderNo: order.orderNo, supplierId, itemsCount: items.length })
        const sum = await tx.subcontractOrderItem.aggregate({ where: { orderId: order.id }, _sum: { amount: true } })
        await tx.subcontractOrder.update({ where: { id: order.id }, data: { totalAmount: sum._sum.amount ?? null } })
      }
    })
    return { success: true, data: result, message: '批量生成委外订单成功', timestamp: new Date().toISOString() }
  }
}
