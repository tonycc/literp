import { BaseService } from '../../../shared/services/base.service'
import type { MaterialIssueOrder, MaterialIssueOrderItem } from '@zyerp/shared'
import crypto from 'crypto'
import * as store from './material-issue.store'

export class MaterialIssueService extends BaseService {
  async buildOrderForWorkOrder(workOrderId: string): Promise<MaterialIssueOrder> {
    const wo = await this.prisma.workOrder.findUnique({ where: { id: workOrderId } })
    if (!wo) throw new Error('工单不存在')
    const mo = await this.prisma.manufacturingOrder.findUnique({ where: { id: wo.moId } })
    const mats = await this.prisma.workOrderMaterial.findMany({
      where: { workOrderId: workOrderId },
      select: {
        materialId: true,
        unitId: true,
        quantity: true,
        warehouseId: true,
        isIssued: true,
        material: { select: { code: true, name: true, specification: true, unit: true } },
        unit: { select: { name: true, symbol: true } },
      },
    })
    const itemWhIds = Array.from(new Set(mats.map(m => m.warehouseId).filter(Boolean))) as string[]
    const itemWhs = itemWhIds.length ? await this.prisma.warehouse.findMany({ where: { id: { in: itemWhIds } } }) : []
    const itemWhMap = new Map(itemWhs.map(w => [w.id, w]))
    const items: MaterialIssueOrderItem[] = mats.map(m => {
      const required = Number(m.quantity || 0)
      const issued = m.isIssued ? required : 0
      const unitLabel = m.unit?.symbol ?? m.unit?.name ?? ((m.material as any)?.unit?.symbol ?? (m.material as any)?.unit?.name) ?? null
      const iw = m.warehouseId ? (itemWhMap.get(m.warehouseId) ?? null) : null
      return {
        materialId: m.materialId,
        materialCode: (m.material as any)?.code ?? null,
        materialName: (m.material as any)?.name ?? null,
        specification: (m.material as any)?.specification ?? null,
        unitId: m.unitId,
        unit: unitLabel,
        warehouseId: m.warehouseId ?? (wo.issueWarehouseId || mo?.warehouseId || null),
        warehouseCode: iw?.code ?? null,
        warehouseName: iw?.name ?? null,
        requiredQuantity: required,
        issuedQuantity: issued,
        pendingQuantity: Math.max(0, required - issued),
      }
    })
    const totalRequired = items.reduce((sum, i) => sum + i.requiredQuantity, 0)
    const totalIssued = items.reduce((sum, i) => sum + i.issuedQuantity, 0)
    const status = totalIssued >= totalRequired && items.length > 0
      ? 'issued'
      : totalIssued > 0
        ? 'partially_issued'
        : 'prepared'
    const orderNo = `MI-${wo.orderNo ?? wo.id}`
    return {
      orderNo,
      workOrderId: wo.id,
      moId: wo.moId,
      warehouseId: wo.issueWarehouseId || mo?.warehouseId || null,
      status: status as any,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private async persistOrder(order: MaterialIssueOrder, userId?: string): Promise<MaterialIssueOrder> {
    const id = crypto.randomUUID()
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(
          'INSERT INTO material_issue_orders (id, orderNo, workOrderId, moId, warehouseId, status, remark, createdBy, updatedBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          id,
          order.orderNo,
          order.workOrderId,
          order.moId,
          order.warehouseId ?? null,
          order.status,
          order.remark ?? null,
          userId ?? null,
          userId ?? null,
        )
        for (const it of order.items) {
          const itemId = crypto.randomUUID()
          await tx.$executeRawUnsafe(
            'INSERT INTO material_issue_order_items (id, orderId, materialId, unitId, requiredQuantity, issuedQuantity, pendingQuantity, warehouseId, remark, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
            itemId,
            id,
            it.materialId,
            it.unitId,
            it.requiredQuantity,
            it.issuedQuantity,
            it.pendingQuantity,
            it.warehouseId ?? null,
            it.remark ?? null,
          )
        }
      })
      return { ...order, id }
    } catch {
      store.save(order)
      return order
    }
  }

  async createPersistedForWorkOrder(workOrderId: string, userId?: string): Promise<MaterialIssueOrder> {
    try {
      const existing: unknown[] = await this.prisma.$queryRawUnsafe(
        'SELECT id, orderNo, workOrderId, moId, warehouseId, status, remark, createdAt, updatedAt FROM material_issue_orders WHERE workOrderId = ? LIMIT 1',
        workOrderId,
      )
      if (Array.isArray(existing) && existing.length > 0) {
        const row = existing[0] as { id: string; orderNo: string; workOrderId: string; moId: string; warehouseId?: string | null; status: string; remark?: string | null; createdAt: string; updatedAt: string }
        const itemsRaw: unknown[] = await this.prisma.$queryRawUnsafe(
          'SELECT id, materialId, unitId, requiredQuantity, issuedQuantity, pendingQuantity, warehouseId, remark, createdAt, updatedAt FROM material_issue_order_items WHERE orderId = ?',
          row.id,
        )
        type DbItemRow = { id: string; materialId: string; unitId: string; requiredQuantity: unknown; issuedQuantity: unknown; pendingQuantity: unknown; warehouseId?: string | null; remark?: string | null; createdAt: string; updatedAt: string }
        const itemsRows = itemsRaw as unknown as DbItemRow[]
        const items: MaterialIssueOrderItem[] = itemsRows.map(m => ({
          id: m.id,
          orderId: row.id,
          materialId: m.materialId,
          unitId: m.unitId,
          requiredQuantity: Number(m.requiredQuantity || 0),
          issuedQuantity: Number(m.issuedQuantity || 0),
          pendingQuantity: Number(m.pendingQuantity || 0),
          warehouseId: m.warehouseId ?? null,
          remark: m.remark ?? null,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        }))
        return { id: row.id, orderNo: row.orderNo, workOrderId: row.workOrderId, moId: row.moId, warehouseId: row.warehouseId ?? null, status: row.status as any, remark: row.remark ?? null, createdAt: row.createdAt, updatedAt: row.updatedAt, items }
      }
    } catch {}
    const fallback = store.getByWorkOrderId(workOrderId)
    if (fallback) return fallback
    const built = await this.buildOrderForWorkOrder(workOrderId)
    return this.persistOrder(built, userId)
  }

  async listOrders(params: Record<string, unknown>) {
    const page = typeof params.page === 'number' ? params.page : Number(params.page || 1)
    const pageSize = typeof params.pageSize === 'number' ? params.pageSize : Number(params.pageSize || 10)
    const pagination = this.getPaginationConfig(page, pageSize)
    const workcenterId = typeof params.workcenterId === 'string' ? params.workcenterId : undefined
    const moId = typeof params.moId === 'string' ? params.moId : undefined
    const status = typeof params.status === 'string' ? params.status : undefined

    const where: Record<string, unknown> = {}
    if (workcenterId) where.workcenterId = workcenterId
    if (moId) where.moId = moId
    if (status) where.status = status

    const [total, wos] = await Promise.all([
      this.prisma.workOrder.count({ where: where as any }),
      this.prisma.workOrder.findMany({
        where: where as any,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ updatedAt: 'desc' }],
      }),
    ])

    const ids = wos.map(w => w.id)
    const moIds = Array.from(new Set(wos.map(w => w.moId)))
    const mos = moIds.length ? await this.prisma.manufacturingOrder.findMany({ where: { id: { in: moIds } } }) : []
    const moMap = new Map(mos.map(m => [m.id, m]))

    const mats = ids.length ? await this.prisma.workOrderMaterial.findMany({
      where: { workOrderId: { in: ids } },
      select: {
        workOrderId: true,
        materialId: true,
        unitId: true,
        quantity: true,
        warehouseId: true,
        isIssued: true,
        material: { select: { code: true, name: true, specification: true, unit: true } },
        unit: { select: { name: true, symbol: true } },
      },
    }) : []
    const itemWhIds2 = Array.from(new Set(mats.map(m => m.warehouseId).filter(Boolean))) as string[]
    const itemWhs2 = itemWhIds2.length ? await this.prisma.warehouse.findMany({ where: { id: { in: itemWhIds2 } } }) : []
    const itemWhMap2 = new Map(itemWhs2.map(w => [w.id, w]))

    const grouped = new Map<string, MaterialIssueOrderItem[]>()
    for (const m of mats) {
      const arr = grouped.get(m.workOrderId) ?? []
      const required = Number(m.quantity || 0)
      const issued = m.isIssued ? required : 0
      const unitLabel = m.unit?.symbol ?? m.unit?.name ?? ((m.material as any)?.unit?.symbol ?? (m.material as any)?.unit?.name) ?? null
      const iw = m.warehouseId ? (itemWhMap2.get(m.warehouseId) ?? null) : null
      arr.push({
        materialId: m.materialId,
        materialCode: (m.material as any)?.code ?? null,
        materialName: (m.material as any)?.name ?? null,
        specification: (m.material as any)?.specification ?? null,
        unitId: m.unitId,
        unit: unitLabel,
        warehouseId: m.warehouseId ?? undefined,
        warehouseCode: iw?.code ?? null,
        warehouseName: iw?.name ?? null,
        requiredQuantity: required,
        issuedQuantity: issued,
        pendingQuantity: Math.max(0, required - issued),
      })
      grouped.set(m.workOrderId, arr)
    }

    const orders: MaterialIssueOrder[] = wos.map(w => {
      const items = grouped.get(w.id) ?? []
      const mo = moMap.get(w.moId)
      const totalRequired = items.reduce((sum, i) => sum + i.requiredQuantity, 0)
      const totalIssued = items.reduce((sum, i) => sum + i.issuedQuantity, 0)
      const status = totalIssued >= totalRequired && items.length > 0
        ? 'issued'
        : totalIssued > 0
          ? 'partially_issued'
          : 'prepared'
      return {
        orderNo: `MI-${w.orderNo ?? w.id}`,
        workOrderId: w.id,
        moId: w.moId,
        warehouseId: w.issueWarehouseId || mo?.warehouseId || null,
        status: status as any,
        items,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }
    })

    try {
      const countRows: unknown[] = await this.prisma.$queryRawUnsafe(
        'SELECT COUNT(1) as c FROM material_issue_orders',
      )
      const dbTotal = Number(((countRows as Array<any>)[0]?.c) ?? 0)
      const rows: unknown[] = await this.prisma.$queryRawUnsafe(
        'SELECT id, orderNo, workOrderId, moId, warehouseId, status, remark, createdAt, updatedAt FROM material_issue_orders ORDER BY updatedAt DESC LIMIT ? OFFSET ?',
        pagination.take,
        pagination.skip,
      )
      type DbOrderRow = { id: string; orderNo: string; workOrderId: string; moId: string; warehouseId?: string | null; status: string; remark?: string | null; createdAt: string; updatedAt: string }
      const orderRows = rows as unknown as DbOrderRow[]
      const ids = orderRows.map(r => r.id)
      const itemRows: unknown[] = ids.length ? await this.prisma.$queryRawUnsafe(
        `SELECT id, orderId, materialId, unitId, requiredQuantity, issuedQuantity, pendingQuantity, warehouseId, remark, createdAt, updatedAt FROM material_issue_order_items WHERE orderId IN (${ids.map(() => '?').join(',')})`,
        ...ids,
      ) : []
      const grouped = new Map<string, MaterialIssueOrderItem[]>()
      const itemRowsTyped = itemRows as unknown as Array<{ id: string; orderId: string; materialId: string; unitId: string; requiredQuantity: unknown; issuedQuantity: unknown; pendingQuantity: unknown; warehouseId?: string | null; remark?: string | null; createdAt: string; updatedAt: string }>
      const itemWarehouseIds = Array.from(new Set(itemRowsTyped.map(r => r.warehouseId).filter(Boolean))) as string[]
      const itemWarehouseList = itemWarehouseIds.length ? await this.prisma.warehouse.findMany({ where: { id: { in: itemWarehouseIds } } }) : []
      const itemWarehouseMap = new Map(itemWarehouseList.map(w => [w.id, w]))
      const materialIds = Array.from(new Set(itemRowsTyped.map(r => r.materialId)))
      const unitIds = Array.from(new Set(itemRowsTyped.map(r => r.unitId)))
      const [materials, units] = await Promise.all([
        materialIds.length ? this.prisma.product.findMany({ where: { id: { in: materialIds } }, select: { id: true, code: true, name: true, specification: true, unit: { select: { symbol: true, name: true } } } }) : Promise.resolve([]),
        unitIds.length ? this.prisma.unit.findMany({ where: { id: { in: unitIds } }, select: { id: true, symbol: true, name: true } }) : Promise.resolve([]),
      ])
      const materialMap = new Map(materials.map(m => [m.id, m]))
      const unitMap = new Map(units.map(u => [u.id, u]))
      for (const m of itemRowsTyped) {
        const arr = grouped.get(m.orderId) ?? []
        const iw = m.warehouseId ? (itemWarehouseMap.get(m.warehouseId) ?? null) : null
        const mat = materialMap.get(m.materialId)
        const unitInfo = unitMap.get(m.unitId)
        const unitLabel = unitInfo?.symbol ?? unitInfo?.name ?? mat?.unit?.symbol ?? mat?.unit?.name ?? null
        arr.push({ id: m.id, orderId: m.orderId, materialId: m.materialId, materialCode: mat?.code ?? null, materialName: mat?.name ?? null, specification: mat?.specification ?? null, unitId: m.unitId, unit: unitLabel ?? null, requiredQuantity: Number(m.requiredQuantity || 0), issuedQuantity: Number(m.issuedQuantity || 0), pendingQuantity: Number(m.pendingQuantity || 0), warehouseId: m.warehouseId ?? null, warehouseCode: iw?.code ?? null, warehouseName: iw?.name ?? null, remark: m.remark ?? null, createdAt: m.createdAt, updatedAt: m.updatedAt })
        grouped.set(m.orderId, arr)
      }
      const woIds = Array.from(new Set(orderRows.map(r => r.workOrderId)))
      const moIds2 = Array.from(new Set(orderRows.map(r => r.moId)))
      const whIds2 = Array.from(new Set(orderRows.map(r => r.warehouseId).filter(Boolean))) as string[]
      const [wos2, mos2, whs2] = await Promise.all([
        woIds.length ? this.prisma.workOrder.findMany({ where: { id: { in: woIds } } }) : Promise.resolve([]),
        moIds2.length ? this.prisma.manufacturingOrder.findMany({ where: { id: { in: moIds2 } } }) : Promise.resolve([]),
        whIds2.length ? this.prisma.warehouse.findMany({ where: { id: { in: whIds2 } } }) : Promise.resolve([]),
      ])
      const woMap2 = new Map(wos2.map(w => [w.id, w]))
      const moMap2 = new Map(mos2.map(m => [m.id, m]))
      const whMap2 = new Map(whs2.map(w => [w.id, w]))
      const ordersDb: MaterialIssueOrder[] = orderRows.map(r => {
        const wo = woMap2.get(r.workOrderId)
        const mo = moMap2.get(r.moId)
        const wh = r.warehouseId ? whMap2.get(r.warehouseId) ?? null : null
        return { id: r.id, orderNo: r.orderNo, workOrderId: r.workOrderId, workOrderNo: wo?.orderNo ?? null, moId: r.moId, moOrderNo: mo?.orderNo ?? null, warehouseId: r.warehouseId ?? null, warehouseCode: wh?.code ?? null, warehouseName: wh?.name ?? null, status: r.status as any, remark: r.remark ?? null, createdAt: r.createdAt, updatedAt: r.updatedAt, items: grouped.get(r.id) ?? [] }
      })
      return this.buildPaginatedResponse(ordersDb, dbTotal, pagination.page, pagination.pageSize)
    } catch {}
    const fileOrders = store.list()
    if (fileOrders.length > 0) return this.buildPaginatedResponse(fileOrders, fileOrders.length, pagination.page, pagination.pageSize)
    return this.buildPaginatedResponse(orders, total, pagination.page, pagination.pageSize)
  }

  async issueAll(workOrderId: string, userId: string): Promise<MaterialIssueOrder> {
    const order = await this.createPersistedForWorkOrder(workOrderId, userId)
    await this.prisma.$transaction(async (tx) => {
      for (const it of order.items) {
        const outstanding = Math.max(0, it.requiredQuantity - it.issuedQuantity)
        if (outstanding <= 0) continue
        const variants = await tx.productVariant.findMany({
          where: { productId: it.materialId },
          include: { variantStocks: { where: { warehouseId: it.warehouseId ?? order.warehouseId ?? null } } },
        })
        let remain = outstanding
        for (const v of variants) {
          const stocks = (v as unknown as { variantStocks: { id: string; quantity: number; reservedQuantity: number }[] }).variantStocks
          for (const s of stocks) {
            const available = Math.max(0, Number(s.quantity || 0) - Number(s.reservedQuantity || 0))
            if (available <= 0) continue
            const take = Math.min(available, remain)
            if (take <= 0) continue
            await tx.variantStock.update({ where: { id: s.id }, data: { quantity: Number(s.quantity || 0) - take } })
            remain -= take
            if (remain <= 0) break
          }
          if (remain <= 0) break
        }
        const issuedNow = outstanding - remain
        it.issuedQuantity += issuedNow
        it.pendingQuantity = Math.max(0, it.requiredQuantity - it.issuedQuantity)
        try {
          await tx.$executeRawUnsafe(
            'UPDATE material_issue_order_items SET issuedQuantity = ?, pendingQuantity = ?, updatedAt = CURRENT_TIMESTAMP WHERE orderId = ? AND materialId = ? AND unitId = ?',
            it.issuedQuantity,
            it.pendingQuantity,
            (order.id ?? ''),
            it.materialId,
            it.unitId,
          )
        } catch {}
      }
      await tx.workOrderMaterial.updateMany({ where: { workOrderId }, data: { isIssued: true, updatedBy: userId, updatedAt: new Date() } })
      const totalReq = order.items.reduce((sum, i) => sum + i.requiredQuantity, 0)
      const totalIss = order.items.reduce((sum, i) => sum + i.issuedQuantity, 0)
      const status = totalIss >= totalReq && order.items.length > 0 ? 'issued' : totalIss > 0 ? 'partially_issued' : 'prepared'
      order.status = status as any
      try {
        await tx.$executeRawUnsafe('UPDATE material_issue_orders SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE workOrderId = ?', order.status, workOrderId)
      } catch {}
    })
    store.save(order)
    return order
  }

  async getById(orderId: string): Promise<MaterialIssueOrder> {
    try {
      const order = await this.prisma.materialIssueOrder.findUnique({ where: { id: orderId } })
        ?? await this.prisma.materialIssueOrder.findFirst({ where: { workOrderId: orderId } })
      if (!order) throw new Error('not found')
      const items = await this.prisma.materialIssueOrderItem.findMany({
        where: { orderId: order.id },
        orderBy: { createdAt: 'asc' },
        include: {
          material: { select: { code: true, name: true, specification: true, unit: { select: { symbol: true, name: true } } } },
          unit: { select: { symbol: true, name: true } },
        },
      })
      const itemWhIds = Array.from(new Set(items.map(i => i.warehouseId).filter(Boolean))) as string[]
      const itemWhs = itemWhIds.length ? await this.prisma.warehouse.findMany({ where: { id: { in: itemWhIds } } }) : []
      const itemWhMap = new Map(itemWhs.map(w => [w.id, w]))
      const [wo, mo, wh] = await Promise.all([
        this.prisma.workOrder.findUnique({ where: { id: order.workOrderId } }),
        this.prisma.manufacturingOrder.findUnique({ where: { id: order.moId } }),
        order.warehouseId ? this.prisma.warehouse.findUnique({ where: { id: order.warehouseId } }) : Promise.resolve(null),
      ])
      return {
        id: order.id,
        orderNo: order.orderNo,
        workOrderId: order.workOrderId,
        workOrderNo: wo?.orderNo ?? null,
        moId: order.moId,
        moOrderNo: mo?.orderNo ?? null,
        warehouseId: order.warehouseId ?? null,
        warehouseCode: wh?.code ?? null,
        warehouseName: wh?.name ?? null,
        status: order.status as any,
        remark: order.remark ?? null,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: items.map(i => {
          const iw = i.warehouseId ? (itemWhMap.get(i.warehouseId) ?? null) : null
          const unitLabel = i.unit?.symbol ?? i.unit?.name ?? i.material?.unit?.symbol ?? i.material?.unit?.name ?? null
          return {
            id: i.id,
            orderId: i.orderId,
            materialId: i.materialId,
            materialCode: i.material?.code ?? null,
            materialName: i.material?.name ?? null,
            specification: i.material?.specification ?? null,
            unitId: i.unitId,
            unit: unitLabel,
            requiredQuantity: Number(i.requiredQuantity || 0),
            issuedQuantity: Number(i.issuedQuantity || 0),
            pendingQuantity: Number(i.pendingQuantity || 0),
            warehouseId: i.warehouseId ?? null,
            warehouseCode: iw?.code ?? null,
            warehouseName: iw?.name ?? null,
            remark: i.remark ?? null,
            createdAt: i.createdAt,
            updatedAt: i.updatedAt,
          }
        }),
      }
    } catch {
      const byId = store.list().find(o => o.id === orderId)
      if (byId) return byId
      const byWo = store.list().find(o => o.workOrderId === orderId)
      if (byWo) return byWo
      const created = await this.createPersistedForWorkOrder(orderId)
      return created
    }
  }

  async issueItem(orderId: string, itemId: string, quantity: number, userId: string): Promise<MaterialIssueOrder> {
    const order = await this.getById(orderId)
    const item = order.items.find(i => i.id === itemId)
    if (!item) throw new Error('订单项不存在')
    const outstanding = Math.max(0, item.requiredQuantity - item.issuedQuantity)
    const toIssue = Math.min(outstanding, Math.max(0, Number.isFinite(quantity) ? Number(quantity) : 0))
    if (toIssue <= 0) return order
    await this.prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { productId: item.materialId },
        include: { variantStocks: { where: { warehouseId: item.warehouseId ?? order.warehouseId ?? null } } },
      })
      let remain = toIssue
      for (const v of variants) {
        const stocks = (v as unknown as { variantStocks: { id: string; quantity: number; reservedQuantity: number }[] }).variantStocks
        for (const s of stocks) {
          const available = Math.max(0, Number(s.quantity || 0) - Number(s.reservedQuantity || 0))
          if (available <= 0) continue
          const take = Math.min(available, remain)
          if (take <= 0) continue
          await tx.variantStock.update({ where: { id: s.id }, data: { quantity: Number(s.quantity || 0) - take } })
          remain -= take
          if (remain <= 0) break
        }
        if (remain <= 0) break
      }
      const issuedNow = toIssue - remain
      if (issuedNow > 0) {
        item.issuedQuantity += issuedNow
        item.pendingQuantity = Math.max(0, item.requiredQuantity - item.issuedQuantity)
        await tx.materialIssueOrderItem.update({ where: { id: itemId }, data: { issuedQuantity: item.issuedQuantity, pendingQuantity: item.pendingQuantity } })
        if (item.pendingQuantity <= 0) {
          await tx.workOrderMaterial.updateMany({ where: { workOrderId: order.workOrderId, materialId: item.materialId, unitId: item.unitId }, data: { isIssued: true, updatedBy: userId, updatedAt: new Date() } })
        }
      }
      const totalReq = order.items.reduce((sum, i) => sum + i.requiredQuantity, 0)
      const totalIss = order.items.reduce((sum, i) => sum + i.issuedQuantity, 0)
      const status = totalIss >= totalReq && order.items.length > 0 ? 'issued' : totalIss > 0 ? 'partially_issued' : 'prepared'
      order.status = status as any
      await tx.materialIssueOrder.update({ where: { id: order.id! }, data: { status: order.status } })
    })
    store.save(order)
    return order
  }
}

export default MaterialIssueService