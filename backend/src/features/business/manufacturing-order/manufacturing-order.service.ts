import { BaseService } from '../../../shared/services/base.service'
import type { ManufacturingOrderCreateFromPlanRequest, ManufacturingOrderListParams, ManufacturingOrder, GenerateWorkOrdersRequest } from '@zyerp/shared'
import { PrismaClient, Prisma } from '@prisma/client'

export class ManufacturingOrderService extends BaseService {
  private async generateOrderNo(client?: Prisma.TransactionClient | PrismaClient): Promise<string> {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const y = now.getFullYear()
    const m = pad(now.getMonth() + 1)
    const d = pad(now.getDate())
    const prefix = `MO${y}${m}${d}`

    const prisma = client ?? this.prisma
    const last = await prisma.manufacturingOrder.findFirst({
      where: { orderNo: { startsWith: prefix } },
      orderBy: { orderNo: 'desc' },
      select: { orderNo: true },
    })

    let next = 1
    if (last?.orderNo) {
      const m2 = last.orderNo.match(new RegExp(`^${prefix}(\\d+)$`))
      if (m2 && m2[1]) next = parseInt(m2[1], 10) + 1
    }
    return `${prefix}${String(next).padStart(4, '0')}`
  }

  private async generateWorkOrderNo(client?: Prisma.TransactionClient | PrismaClient): Promise<string> {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const y = now.getFullYear()
    const m = pad(now.getMonth() + 1)
    const d = pad(now.getDate())
    const prefix = `WO${y}${m}${d}`

    const prisma = client ?? this.prisma
    const last = await prisma.workOrder.findFirst({
      where: { orderNo: { startsWith: prefix } },
      orderBy: { orderNo: 'desc' },
      select: { orderNo: true },
    })

    let next = 1
    if (last?.orderNo) {
      const m2 = last.orderNo.match(new RegExp(`^${prefix}(\\d+)$`))
      if (m2 && m2[1]) next = parseInt(m2[1], 10) + 1
    }
    return `${prefix}${String(next).padStart(4, '0')}`
  }

  async createFromPlan(data: ManufacturingOrderCreateFromPlanRequest, userId: string) {
    const { orderId, products = [], warehouseId, dueDate, plannedStart, plannedFinish } = data
    if (!orderId) throw new Error('缺少订单ID')
    const rows = Array.isArray(products) ? products.filter(p => p && typeof p.productId === 'string' && typeof p.quantity === 'number') : []
    if (rows.length === 0) throw new Error('没有可生成的产品计划行')

    const created: ManufacturingOrder[] = []
    const parentMap: Map<string, string> = new Map()

    const tops = rows.filter(r => !r.parentProductId)
    const children = rows.filter(r => !!r.parentProductId)

    await this.prisma.$transaction(async (tx) => {
      for (const r of tops) {
        let mo: unknown
        for (let attempt = 0; attempt < 5; attempt++) {
          const orderNo = await this.generateOrderNo(tx)
          try {
            mo = await tx.manufacturingOrder.create({
              data: {
                orderNo,
                sourceType: 'sales_order',
                sourceRefId: orderId,
                productId: r.productId,
                productCode: r.productCode,
                productName: r.productName,
                bomId: r.bomId ?? null,
                bomCode: r.bomCode ?? null,
                routingId: r.routingId ?? null,
                routingCode: r.routingCode ?? null,
                unit: r.unit ?? null,
                quantity: r.quantity,
                warehouseId: warehouseId ?? null,
                dueDate: dueDate ? new Date(dueDate) : null,
                plannedStart: plannedStart ? new Date(plannedStart) : null,
                plannedFinish: plannedFinish ? new Date(plannedFinish) : null,
                status: 'draft',
                parentMoId: null,
                createdBy: userId,
                updatedBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            })
            break
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
              continue
            }
            throw error
          }
        }
        if (!mo) throw new Error('制造订单编号冲突，请重试')
        parentMap.set(r.productId, (mo as any).id)
        created.push(mo as unknown as ManufacturingOrder)
      }

      for (const r of children) {
        const parentId = r.parentProductId ? parentMap.get(r.parentProductId) ?? null : null
        let mo: unknown
        for (let attempt = 0; attempt < 5; attempt++) {
          const orderNo = await this.generateOrderNo(tx)
          try {
            mo = await tx.manufacturingOrder.create({
              data: {
                orderNo,
                sourceType: 'sales_order',
                sourceRefId: orderId,
                productId: r.productId,
                productCode: r.productCode,
                productName: r.productName,
                bomId: r.bomId ?? null,
                bomCode: r.bomCode ?? null,
                routingId: r.routingId ?? null,
                routingCode: r.routingCode ?? null,
                unit: r.unit ?? null,
                quantity: r.quantity,
                warehouseId: warehouseId ?? null,
                dueDate: dueDate ? new Date(dueDate) : null,
                plannedStart: plannedStart ? new Date(plannedStart) : null,
                plannedFinish: plannedFinish ? new Date(plannedFinish) : null,
                status: 'draft',
                parentMoId: parentId,
                createdBy: userId,
                updatedBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            })
            break
          } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
              continue
            }
            throw error
          }
        }
        if (!mo) throw new Error('制造订单编号冲突，请重试')
        created.push(mo as unknown as ManufacturingOrder)
      }
    })

    return created
  }

  async getList(params: ManufacturingOrderListParams) {
    const { page = 1, pageSize = 10, status, productCode, orderNo, sourceOrderNo } = params || {}
    const pagination = this.getPaginationConfig(page, pageSize)
    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (productCode) where.productCode = { contains: productCode }
    if (orderNo) where.orderNo = { contains: orderNo }
    if (sourceOrderNo) {
      const sales = await this.prisma.salesOrder.findMany({
        where: { orderNo: { contains: sourceOrderNo } },
        select: { id: true },
      })
      const salesIds = sales.map(s => s.id)
      if (!salesIds.length) {
        return this.buildPaginatedResponse([], 0, pagination.page, pagination.pageSize)
      }
      where.sourceType = 'sales_order'
      where.sourceRefId = { in: salesIds }
    }

    const [total, orders] = await Promise.all([
      this.prisma.manufacturingOrder.count({ where }),
      this.prisma.manufacturingOrder.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const moIds = orders.map(o => o.id)
    const sumMap = new Map<string, number>()
    if (moIds.length) {
      const rows = await this.prisma.workOrder.findMany({
        where: { moId: { in: moIds }, NOT: { status: 'cancelled' } },
        select: { moId: true, sequence: true, quantity: true },
      })
      const minSeqMap = new Map<string, number>()
      for (const r of rows) {
        const cur = minSeqMap.get(r.moId)
        if (typeof cur !== 'number' || r.sequence < cur) minSeqMap.set(r.moId, r.sequence)
      }
      for (const r of rows) {
        const minSeq = minSeqMap.get(r.moId)
        if (typeof minSeq === 'number' && r.sequence === minSeq) {
          const prev = sumMap.get(r.moId) || 0
          sumMap.set(r.moId, prev + Number(r.quantity || 0))
        }
      }
    }
    // 追加父制造单编号，避免前端N+1查询
    const parentIds = Array.from(new Set(orders.map(o => o.parentMoId).filter((id): id is string => typeof id === 'string')))
    const parentNoMap = new Map<string, string>()
    if (parentIds.length) {
      const parents = await this.prisma.manufacturingOrder.findMany({
        where: { id: { in: parentIds } },
        select: { id: true, orderNo: true },
      })
      for (const p of parents) parentNoMap.set(p.id, p.orderNo)
    }

    // 来源订单号（销售订单）映射，避免前端N+1
    const salesIds = Array.from(new Set(orders.filter(o => o.sourceType === 'sales_order' && o.sourceRefId).map(o => String(o.sourceRefId))))
    const salesNoMap = new Map<string, string>()
    if (salesIds.length) {
      const sales = await this.prisma.salesOrder.findMany({
        where: { id: { in: salesIds } },
        select: { id: true, orderNo: true },
      })
      for (const s of sales) salesNoMap.set(s.id, s.orderNo || '')
    }

    const enriched = orders.map(o => ({
      ...o,
      scheduledQuantity: sumMap.get(o.id) || 0,
      pendingQuantity: Math.max(0, Number(o.quantity) - (sumMap.get(o.id) || 0)),
      parentMoOrderNo: o.parentMoId ? (parentNoMap.get(o.parentMoId) ?? null) : null,
      sourceOrderNo: o.sourceType === 'sales_order' && o.sourceRefId ? (salesNoMap.get(String(o.sourceRefId)) ?? null) : null,
    }))
    return this.buildPaginatedResponse(enriched as unknown as ManufacturingOrder[], total, pagination.page, pagination.pageSize)
  }

  async getById(id: string) {
    const mo = await this.prisma.manufacturingOrder.findUnique({ where: { id } })
    if (!mo) throw new Error('制造订单不存在')
    return mo
  }

  async confirm(id: string, userId: string) {
    const mo = await this.prisma.manufacturingOrder.findUnique({ where: { id } })
    if (!mo) throw new Error('制造订单不存在')
    if (mo.status !== 'draft') throw new Error('仅草稿状态可确认')
    await this.prisma.manufacturingOrder.update({
      where: { id },
      data: { status: 'confirmed', updatedBy: userId, updatedAt: new Date() },
    })
  }

  async cancel(id: string, userId: string) {
    const mo = await this.prisma.manufacturingOrder.findUnique({ where: { id } })
    if (!mo) throw new Error('制造订单不存在')
    if (mo.status === 'completed') throw new Error('已完成的制造订单不可取消')
    await this.prisma.$transaction(async (tx) => {
      await tx.manufacturingOrder.update({ where: { id }, data: { status: 'cancelled', updatedBy: userId, updatedAt: new Date() } })
      await tx.manufacturingOrder.updateMany({
        where: { parentMoId: id, NOT: { status: 'completed' } },
        data: { status: 'cancelled', updatedBy: userId, updatedAt: new Date() },
      })
    })
  }

  private async getRoutingOperations(routingId: string) {
    const ops = await this.prisma.routingWorkcenter.findMany({
      where: { routingId },
      include: { workcenter: true, operation: true },
      orderBy: { sequence: 'asc' },
    })
    return ops.map(op => ({
      id: op.id,
      name: op.operation?.name ?? op.workcenter?.name ?? '',
      sequence: op.sequence ?? 0,
      workcenterId: op.workcenterId ?? null,
      timeCycleManual: typeof op.timeCycleManual === 'number' ? op.timeCycleManual : 0,
      operationId: op.operationId ?? op.id,
    }))
  }

  async generateWorkOrders(moId: string, userId: string, payload?: GenerateWorkOrdersRequest) {
    const mo = await this.prisma.manufacturingOrder.findUnique({ where: { id: moId } })
    if (!mo) throw new Error('制造订单不存在')
    if (!mo.routingId) throw new Error('制造订单缺少工艺路线')
    const ops = await this.getRoutingOperations(mo.routingId)
    if (ops.length === 0) throw new Error('工艺路线无工序')
    const requestedQty = typeof payload?.quantity === 'number' ? payload!.quantity! : 0
    if (!requestedQty || requestedQty <= 0) throw new Error('生成工单数量必须大于0')
    const rows = await this.prisma.workOrder.findMany({
      where: { moId, NOT: { status: 'cancelled' } },
      select: { sequence: true, quantity: true },
    })
    let scheduledQty = 0
    if (rows.length) {
      let minSeq = Number.POSITIVE_INFINITY
      for (const r of rows) if (r.sequence < minSeq) minSeq = r.sequence
      for (const r of rows) if (r.sequence === minSeq) scheduledQty += Number(r.quantity || 0)
    }
    const remaining = Math.max(0, Number(mo.quantity) - scheduledQty)
    if (requestedQty > remaining) {
      throw new Error(`生成数量超过制造订单剩余数量（剩余：${remaining}）`)
    }
    const baselineStart = (payload?.baselineStart ? new Date(payload.baselineStart) : (mo.plannedStart ? new Date(mo.plannedStart) : new Date()))
    const baselineFinish = payload?.baselineFinish ? new Date(payload.baselineFinish) : null
    console.log('[generateWorkOrders][service] moId:', moId, 'requestedQty:', requestedQty, 'baselineStart:', baselineStart?.toISOString?.(), 'baselineFinish:', baselineFinish?.toISOString?.())
    const created: unknown[] = []
    await this.prisma.$transaction(async (tx) => {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}${mm}${dd}`
      const suffix = String((mo.orderNo || moId)).replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase()
      const existingBatches = await tx.workOrder.findMany({ where: { moId, batchNo: { startsWith: `LOT-${dateStr}-`, endsWith: `-${suffix}` } }, select: { batchNo: true } })
      const nextIndex = (() => {
        if (!existingBatches.length) return 1
        let max = 0
        for (const b of existingBatches) {
          const s = b.batchNo || ''
          const m = s.match(/^LOT-\d{8}-(\d{4})-[A-Z0-9]{4}$/)
          if (m) {
            const n = Number(m[1])
            if (Number.isFinite(n) && n > max) max = n
          }
        }
        return max + 1
      })()
      const batchNo = `LOT-${dateStr}-${String(nextIndex).padStart(4, '0')}-${suffix}`

      // 单工单包含完整工序：创建一个工单覆盖工艺路线的全部工序
      const start = payload?.baselineStart ?? ''
      const finish = payload?.baselineFinish ?? payload?.baselineStart ?? ''
      const minSeq = ops.reduce((min, o) => Math.min(min, o.sequence ?? min), Number.POSITIVE_INFINITY)
      const maxSeq = ops.reduce((max, o) => Math.max(max, o.sequence ?? max), 0)
      const operationsLabel = ops.map(o => o.name || '').filter(Boolean).join('、')
      const anchorOpId = String((ops.sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))[0]).operationId)
      const orderNo = await this.generateWorkOrderNo(tx)
      const wo = await tx.workOrder.create({
        data: {
          orderNo,
          moId,
          operationId: anchorOpId,
          name: mo.productName || null,
          sequence: Number.isFinite(minSeq) ? minSeq : 10,
          sequenceStart: Number.isFinite(minSeq) ? minSeq : 10,
          sequenceEnd: maxSeq || (Number.isFinite(minSeq) ? minSeq : 10),
          operationsLabel: operationsLabel || null,
          workcenterId: null,
          issueWarehouseId: payload?.issueWarehouseId ?? null,
          finishedWarehouseId: payload?.finishedWarehouseId ?? null,
          batchNo,
          quantity: requestedQty,
          plannedStart: start,
          plannedFinish: finish,
          status: 'draft',
          createdBy: userId,
          updatedBy: userId,
        },
      })
      await tx.workOrderRoutingWorkcenter.createMany({ data: ops.map(o => ({ workOrderId: (wo as any).id as string, routingWorkcenterId: String(o.id) })) })
      created.push(wo)
    })
    return created
  }

  async getWorkOrdersByMo(moId: string) {
    const list = await this.prisma.workOrder.findMany({
      where: { moId },
      orderBy: [{ sequence: 'asc' }, { createdAt: 'asc' }],
    })
    return list
  }

  async remove(id: string, userId: string) {
    void userId
    const mo = await this.prisma.manufacturingOrder.findUnique({ where: { id } })
    if (!mo) throw new Error('制造订单不存在')
    if (mo.status === 'confirmed' || mo.status === 'in_progress' || mo.status === 'completed') {
      throw new Error('已确认/进行中/已完成的制造订单不可删除')
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.workOrder.deleteMany({ where: { moId: id } })
      await tx.manufacturingOrder.delete({ where: { id } })
    })
  }
}
