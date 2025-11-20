import { BaseService } from '../../../shared/services/base.service'
import type { PrismaClient, Prisma } from '@prisma/client'
import type { CreateWorkOrderRequest, WorkOrderStatus } from '@zyerp/shared'

export class WorkOrderService extends BaseService {
  async getList(params: Record<string, unknown>) {
    const page = typeof params.page === 'number' ? params.page : Number(params.page || 1)
    const pageSize = typeof params.pageSize === 'number' ? params.pageSize : Number(params.pageSize || 10)
    const pagination = this.getPaginationConfig(page, pageSize)
    const status = typeof params.status === 'string' ? params.status : undefined
    const workcenterId = typeof params.workcenterId === 'string' ? params.workcenterId : undefined
    const moId = typeof params.moId === 'string' ? params.moId : undefined
    const start = typeof params.start === 'string' ? params.start : undefined
    const end = typeof params.end === 'string' ? params.end : undefined

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (workcenterId) where.workcenterId = workcenterId
    if (moId) where.moId = moId

    if (start && end) {
      where.AND = [{ plannedStart: { lte: end } }, { plannedFinish: { gte: start } }]
    } else if (start) {
      where.plannedFinish = { gte: start }
    } else if (end) {
      where.plannedStart = { lte: end }
    }

    const [total, rows] = await Promise.all([
      this.prisma.workOrder.count({ where: where as any }),
      this.prisma.workOrder.findMany({
        where: where as any,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ plannedStart: 'asc' }, { sequence: 'asc' }],
      }),
    ])

    const moIds = Array.from(new Set(rows.map(r => r.moId).filter(Boolean)))
    const mos = moIds.length
      ? await this.prisma.manufacturingOrder.findMany({ where: { id: { in: moIds } } })
      : []
    const moMap = new Map(mos.map(m => [m.id, m]))

    const woIds = rows.map(r => r.id)
    const mats = woIds.length
      ? await this.prisma.workOrderMaterial.findMany({
          where: { workOrderId: { in: woIds } },
          select: {
            workOrderId: true,
            materialId: true,
            unitId: true,
            quantity: true,
            warehouseId: true,
            isIssued: true,
            material: { select: { code: true, name: true } },
            unit: { select: { name: true, symbol: true } },
          },
        })
      : []
    const matCountMap = new Map<string, number>()
    const matKindsMap = new Map<string, Set<string>>()
    const matMap = new Map<string, { materials: { materialId: string; materialCode?: string | null; materialName?: string | null; unitId: string; unit?: string | null; quantity: number; warehouseId?: string | null; issued?: boolean }[]; summary: string }>()
    for (const m of mats) {
      const k = m.workOrderId
      matCountMap.set(k, (matCountMap.get(k) || 0) + 1)
      const kindsSet = matKindsMap.get(k) ?? new Set<string>()
      kindsSet.add(m.materialId)
      matKindsMap.set(k, kindsSet)
      const current = matMap.get(k)
      const list = current?.materials ?? []
      const unitLabel = m.unit?.symbol ?? m.unit?.name ?? null
      list.push({ materialId: m.materialId, materialCode: m.material?.code ?? null, materialName: m.material?.name ?? null, unitId: m.unitId, unit: unitLabel, quantity: Number(m.quantity || 0), warehouseId: m.warehouseId ?? null, issued: Boolean(m.isIssued) })
      const summary = list.map(it => `${it.materialName ?? it.materialCode ?? it.materialId} × ${it.quantity}${it.unit ? ` ${it.unit}` : ''}`).join('；')
      matMap.set(k, { materials: list, summary })
    }

    const outsourcedCountMap = new Map<string, number>()
    const subcontractMap = new Map<string, { orderId: string; orderNo: string }>()
    if (woIds.length) {
      const wrwcs = await this.prisma.workOrderRoutingWorkcenter.findMany({
        where: { workOrderId: { in: woIds } },
        select: {
          workOrderId: true,
          routingWorkcenter: { select: { workcenter: { select: { type: true } } } },
        },
      })
      for (const rec of wrwcs) {
        const t = rec.routingWorkcenter?.workcenter?.type
        const isOut = typeof t === 'string' && t.toLowerCase() === 'outsourcing'
        if (isOut) {
          const k = rec.workOrderId
          outsourcedCountMap.set(k, (outsourcedCountMap.get(k) || 0) + 1)
        }
      }
      // fallback：若无关联工序，依据工单的工作中心类型判定
      const wcIds = Array.from(new Set(rows.map(r => r.workcenterId).filter(Boolean))) as string[]
      if (wcIds.length) {
        const wcs = await this.prisma.workcenter.findMany({ where: { id: { in: wcIds } }, select: { id: true, type: true } })
        const wcMap = new Map(wcs.map(w => [w.id, w.type]))
        for (const r of rows) {
          const ct = r.workcenterId ? wcMap.get(r.workcenterId) : undefined
          const isOut = typeof ct === 'string' && ct.toLowerCase() === 'outsourcing'
          if (isOut && !outsourcedCountMap.has(r.id)) {
            outsourcedCountMap.set(r.id, 1)
          }
        }
      }
      const soItems = await this.prisma.subcontractOrderItem.findMany({
        where: { workOrderId: { in: woIds } },
        select: { workOrderId: true, orderId: true, order: { select: { orderNo: true } } },
      })
      for (const it of soItems) {
        const k = it.workOrderId
        if (!subcontractMap.has(k)) {
          subcontractMap.set(k, { orderId: it.orderId, orderNo: it.order?.orderNo || '' })
        }
      }
    }

    const enriched = rows.map(r => {
      const mo = moMap.get(r.moId)
      return {
        ...r,
        moOrderNo: mo?.orderNo,
        productId: mo?.productId,
        productCode: mo?.productCode ?? null,
        productName: mo?.productName ?? null,
        moQuantity: typeof mo?.quantity === 'number' ? mo?.quantity : undefined,
        moUnit: mo?.unit ?? null,
        moPlannedStart: mo?.plannedStart ?? null,
        moPlannedFinish: mo?.plannedFinish ?? null,
        sourceType: mo?.sourceType ?? null,
        sourceRefId: mo?.sourceRefId ?? null,
        moRoutingCode: mo?.routingCode ?? null,
        moBomCode: mo?.bomCode ?? null,
        materialsCount: matCountMap.get(r.id) || 0,
        materialsSummary: matMap.get(r.id)?.summary ?? null,
        materials: matMap.get(r.id)?.materials ?? [],
        materialsKinds: (matKindsMap.get(r.id)?.size) ?? 0,
        outsourcedOperationCount: outsourcedCountMap.get(r.id) || 0,
        needsSubcontracting: (outsourcedCountMap.get(r.id) || 0) > 0,
        subcontractOrderId: subcontractMap.get(r.id)?.orderId,
        subcontractOrderNo: subcontractMap.get(r.id)?.orderNo ?? null,
      }
    })

    return this.buildPaginatedResponse(enriched, total, pagination.page, pagination.pageSize)
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

  async create(data: CreateWorkOrderRequest, userId: string) {
    if (!data?.moId) throw new Error('缺少制造订单ID')
    const quantity = Number(data.quantity || 0)
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('生产数量不合法')

    return this.prisma.$transaction(async (tx) => {
      const mo = await tx.manufacturingOrder.findUnique({ where: { id: data.moId } })
      if (!mo) throw new Error('制造订单不存在')

      const orderNo = await this.generateWorkOrderNo(tx)
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}${mm}${dd}`
      const suffix = String((mo.orderNo || mo.id)).replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase()
      const existingBatches = await tx.workOrder.findMany({ where: { moId: mo.id, batchNo: { startsWith: `LOT-${dateStr}-`, endsWith: `-${suffix}` } }, select: { batchNo: true } })
      let nextIndex = 1
      if (existingBatches.length) {
        for (const b of existingBatches) {
          const s = b.batchNo || ''
          const m = s.match(/^LOT-\d{8}-(\d{4})-[A-Z0-9]{4}$/)
          if (m) {
            const n = Number(m[1])
            if (Number.isFinite(n) && n >= nextIndex) nextIndex = n + 1
          }
        }
      }
      const batchNo = `LOT-${dateStr}-${String(nextIndex).padStart(4, '0')}-${suffix}`

      let opId: string = ''
      let workcenterId: string | null = data.workcenterId ?? null
      const operations: { routingWorkcenterId: string }[] = []
      if (Array.isArray(data.operations) && data.operations.length > 0) {
        operations.push(...data.operations)
      } else if (mo.routingId) {
        const rwcs = await tx.routingWorkcenter.findMany({ where: { routingId: mo.routingId }, orderBy: { sequence: 'asc' }, select: { id: true, operationId: true, workcenterId: true } })
        if (rwcs.length) {
          opId = String(rwcs[0].operationId)
          workcenterId = workcenterId ?? (rwcs[0].workcenterId || null)
          operations.push(...rwcs.map(r => ({ routingWorkcenterId: r.id })))
        }
      }
      if (!opId) {
        if (operations.length > 0) {
          const first = await tx.routingWorkcenter.findUnique({ where: { id: operations[0].routingWorkcenterId }, select: { operationId: true } })
          opId = String(first?.operationId || '')
        } else {
          throw new Error('缺少工序信息')
        }
      }

      const rwcsForCalc = operations.length
        ? await tx.routingWorkcenter.findMany({
            where: { id: { in: operations.map(o => o.routingWorkcenterId) } },
            orderBy: { sequence: 'asc' },
            select: { sequence: true, operation: { select: { name: true } } },
          })
        : await tx.routingWorkcenter.findMany({
            where: { routingId: mo.routingId! },
            orderBy: { sequence: 'asc' },
            select: { sequence: true, operation: { select: { name: true } } },
          })
      const minSeq = rwcsForCalc.length ? (rwcsForCalc[0].sequence ?? 1) : 1
      const maxSeq = rwcsForCalc.length ? (rwcsForCalc[rwcsForCalc.length - 1].sequence ?? minSeq) : minSeq
      const operationsLabel = rwcsForCalc.map(r => r.operation?.name || '').filter(Boolean).join('、') || null

      const wo = await tx.workOrder.create({
        data: {
          orderNo,
          moId: mo.id,
          operationId: opId,
          name: data.workcenterId ? `${mo.productName || ''}+${data.workcenterId}` : mo.productName || null,
          sequence: minSeq,
          sequenceStart: minSeq,
          sequenceEnd: maxSeq,
          operationsLabel,
          workcenterId: workcenterId,
          ownerId: data.ownerId ?? null,
          issueWarehouseId: data.issueWarehouseId ?? null,
          finishedWarehouseId: data.finishedWarehouseId ?? null,
          batchNo,
          quantity,
          plannedStart: data.plannedStart ?? null,
          plannedFinish: data.plannedFinish ?? null,
          status: 'draft',
          createdBy: userId,
          updatedBy: userId,
        },
      })

      if (operations.length) {
        await tx.workOrderRoutingWorkcenter.createMany({ data: operations.map(o => ({ workOrderId: wo.id, routingWorkcenterId: o.routingWorkcenterId })) })
      }

      const materials: { materialId: string; unitId: string; quantity: number; warehouseId?: string }[] = []
      if (Array.isArray(data.materials) && data.materials.length > 0) {
        materials.push(...data.materials)
      } else if (mo.bomId) {
        const bom = await tx.productBom.findUnique({ where: { id: mo.bomId }, select: { id: true, baseQuantity: true } })
        const items = await tx.productBomItem.findMany({ where: { bomId: mo.bomId }, select: { materialId: true, unitId: true, quantity: true } })
        const ratio = bom?.baseQuantity ? quantity / Number(bom.baseQuantity) : 1
        for (const it of items) {
          const q = Number(it.quantity || 0) * ratio
          if (q > 0) materials.push({ materialId: it.materialId, unitId: it.unitId, quantity: q, warehouseId: data.issueWarehouseId ?? undefined })
        }
      }
      if (materials.length) {
        await tx.workOrderMaterial.createMany({ data: materials.map(m => ({ workOrderId: wo.id, materialId: m.materialId, unitId: m.unitId, quantity: m.quantity, warehouseId: m.warehouseId, createdBy: userId, updatedBy: userId })) })
      }

      const enriched = {
        ...wo,
        ownerId: data.ownerId ?? null,
        moOrderNo: mo.orderNo,
        productId: mo.productId,
        productCode: mo.productCode ?? null,
        productName: mo.productName ?? null,
        moQuantity: typeof mo.quantity === 'number' ? mo.quantity : undefined,
        moUnit: mo.unit ?? null,
        moPlannedStart: mo.plannedStart ?? null,
        moPlannedFinish: mo.plannedFinish ?? null,
        sourceType: mo.sourceType ?? null,
        sourceRefId: mo.sourceRefId ?? null,
        moRoutingCode: mo.routingCode ?? null,
        moBomCode: mo.bomCode ?? null,
      }
      return enriched
    })
  }

  async updateStatus(id: string, status: WorkOrderStatus, userId: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!wo) throw new Error('工单不存在')
    const current = wo.status as WorkOrderStatus
    const target = status
    const allowMap: Record<WorkOrderStatus, WorkOrderStatus[]> = {
      draft: ['scheduled', 'in_progress', 'cancelled'],
      scheduled: ['in_progress', 'cancelled'],
      in_progress: ['paused', 'completed', 'cancelled'],
      paused: ['in_progress', 'cancelled'],
      completed: [],
      cancelled: [],
    }
    const allowed = allowMap[current] ?? []
    if (!allowed.includes(target)) {
      throw new Error('不允许的状态流转')
    }
    const updated = await this.prisma.workOrder.update({ where: { id }, data: { status: target, updatedBy: userId, updatedAt: new Date() } })
    return updated
  }

  async delete(id: string) {
    const wo = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!wo) throw new Error('工单不存在')
    const current = wo.status as WorkOrderStatus
    if (!['draft', 'cancelled'].includes(current)) {
      throw new Error('仅允许删除草稿或已取消的工单')
    }
    await this.prisma.workOrderRoutingWorkcenter.deleteMany({ where: { workOrderId: id } })
    await this.prisma.workOrderMaterial.deleteMany({ where: { workOrderId: id } })
    await this.prisma.workOrder.delete({ where: { id } })
  }
}