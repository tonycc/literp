import { BaseService } from '../../../shared/services/base.service';
import type {
  ProductionPlanPreviewRequest,
  ProductionPlanPreviewResult,
  ProductionPlanProductPlan,
  MaterialRequirement,
} from '@zyerp/shared';

export class ProductionPlanService extends BaseService {
  /**
   * 生产计划预览（基于销售订单）
   */
  async preview(data: ProductionPlanPreviewRequest): Promise<ProductionPlanPreviewResult> {
    const { salesOrderId, warehouseId, includeRouting = true, selectedItemIds, includeChildProducts, expandMaterialsRecursively } = data;

    // 获取销售订单及其明细
    const order = await this.prisma.salesOrder.findUnique({
      where: { id: salesOrderId },
      include: {
        items: {
          include: {
            product: { include: { unit: true } },
            unit: true,
            warehouse: true,
          }
        }
      }
    });

    if (!order) {
      throw new Error('销售订单不存在');
    }

    // 针对每个订单产品，获取默认BOM并计算需求
    const productPlanMap: Map<string, ProductionPlanProductPlan> = new Map();
    const materialMap: Map<string, MaterialRequirement> = new Map();

    const scopeItems = Array.isArray(selectedItemIds) && selectedItemIds.length > 0
      ? order.items.filter((it) => selectedItemIds.includes(it.id))
      : order.items;

    for (const item of scopeItems) {
      const p = item.product;
      if (!p) continue;

      // 获取默认BOM（或最新有效BOM）
      const bom = await this.prisma.productBom.findFirst({
        where: { productId: p.id, isDefault: true },
        include: {
          routing: true,
          items: {
            include: {
              material: { include: { unit: true } },
              unit: true,
            },
            orderBy: { sequence: 'asc' }
          },
          baseUnit: true,
        }
      });

      const baseQty = bom?.baseQuantity ?? 1;
      const planQty = item.quantity ?? 0;
      const ratio = baseQty > 0 ? planQty / baseQty : planQty;

      // 获取工序（用于计算外协判断），即使不展示也需要用于业务逻辑
      const ops = bom?.routingId ? await this.getRoutingOperations(bom.routingId!) : undefined;

      const topUnit = (item.unit?.symbol ?? p.unit?.symbol ?? item.unit?.name ?? p.unit?.name) ?? null;
      const existingTop = productPlanMap.get(p.id);
      if (existingTop) {
        existingTop.quantity += planQty;
        existingTop.operations = includeRouting ? ops : undefined;
        existingTop.bomId = bom?.id ?? existingTop.bomId ?? null;
        existingTop.bomCode = bom?.code ?? existingTop.bomCode ?? null;
        existingTop.baseQuantity = baseQty;
        existingTop.routingId = bom?.routingId ?? existingTop.routingId ?? null;
        existingTop.routingCode = bom?.routing?.code ?? existingTop.routingCode ?? null;
        existingTop.unit = topUnit;
        existingTop.source = existingTop.source === 'child_bom' ? 'bom_child' : 'bom';
        existingTop.parentProductId = null;
      } else {
        productPlanMap.set(p.id, {
          productId: p.id,
          productCode: p.code,
          productName: p.name,
          quantity: planQty,
          unit: topUnit,
          bomId: bom?.id ?? null,
          bomCode: bom?.code ?? null,
          baseQuantity: baseQty,
          routingId: bom?.routingId ?? null,
          routingCode: bom?.routing?.code ?? null,
          operations: includeRouting ? ops : undefined,
          source: 'bom',
          parentProductId: null,
        });
      }

      // 累加物料需求
      if (bom?.items && bom.items.length > 0) {
        const hasOutsource = (ops || []).some((o: any) => this.isOutsourceType(o.workcenterType));
        if (includeChildProducts) {
          for (const bi of bom.items) {
            if (bi.childBomId) {
              const childBom = await this.prisma.productBom.findUnique({
                where: { id: bi.childBomId },
                include: { product: { include: { unit: true } }, routing: true, baseUnit: true }
              });
              if (childBom?.productId) {
                const childQty = (bi.quantity ?? 0) * ratio;
                const childOps = childBom?.routingId ? await this.getRoutingOperations(childBom.routingId!) : undefined;
                const childUnit = (childBom.baseUnit?.symbol ?? childBom.baseUnit?.name ?? childBom.product?.unit?.symbol ?? childBom.product?.unit?.name) ?? null;
                const existingChild = productPlanMap.get(childBom.productId);
                if (existingChild) {
                  existingChild.quantity += childQty;
                  existingChild.operations = includeRouting ? childOps : undefined;
                  existingChild.bomId = childBom.id ?? existingChild.bomId ?? null;
                  existingChild.bomCode = childBom.code ?? existingChild.bomCode ?? null;
                  existingChild.baseQuantity = childBom.baseQuantity ?? existingChild.baseQuantity ?? null;
                  existingChild.routingId = childBom.routingId ?? existingChild.routingId ?? null;
                  existingChild.routingCode = childBom.routing?.code ?? existingChild.routingCode ?? null;
                  existingChild.unit = childUnit;
                  existingChild.source = existingChild.source === 'bom' ? 'bom_child' : 'child_bom';
                  if (!existingChild.parentProductId) existingChild.parentProductId = p.id;
                } else {
                  productPlanMap.set(childBom.productId, {
                    productId: childBom.productId,
                    productCode: childBom.product?.code ?? '',
                    productName: childBom.product?.name ?? '',
                    quantity: childQty,
                    unit: childUnit,
                    bomId: childBom.id ?? null,
                    bomCode: childBom.code ?? null,
                    baseQuantity: childBom.baseQuantity ?? null,
                    routingId: childBom.routingId ?? null,
                    routingCode: childBom.routing?.code ?? null,
                    operations: includeRouting ? childOps : undefined,
                    source: 'child_bom',
                    parentProductId: p.id,
                  });
                }
              }
            }
          }
        }
        if (expandMaterialsRecursively) {
          for (const bi of bom.items) {
            if (bi.childBomId) {
              const nextQty = (bi.quantity ?? 0) * ratio;
              await this.accumulateMaterialsFromBom(
                bi.childBomId,
                nextQty,
                materialMap,
                (warehouseId ?? item.warehouse?.id ?? p.defaultWarehouseId) ?? undefined
              );
            } else {
              const mid = bi.materialId;
              const required = (bi.quantity ?? 0) * ratio;
              const existing = materialMap.get(mid);
              const unitStr = (bi.unit?.symbol ?? bi.unit?.name ?? bi.material.unit?.symbol ?? bi.material.unit?.name) ?? null;
              if (existing) {
                existing.requiredQuantity += required;
                existing.needOutsource = Boolean(existing.needOutsource) || hasOutsource;
              } else {
                materialMap.set(mid, {
                  materialId: mid,
                  materialCode: bi.material.code,
                  materialName: bi.material.name,
                  specification: bi.material.specification ?? null,
                  unitId: bi.unitId ?? bi.material.unit?.id ?? null,
                  unit: unitStr,
                  requiredQuantity: required,
                  availableStock: 0,
                  shortageQuantity: 0,
                  warehouseId: warehouseId ?? (item.warehouse?.id ?? p.defaultWarehouseId ?? null),
                  needOutsource: hasOutsource,
                });
              }
            }
          }
        } else {
          for (const bi of bom.items) {
            const mid = bi.materialId;
            const required = (bi.quantity ?? 0) * ratio;
            const existing = materialMap.get(mid);
            const unitStr = (bi.unit?.symbol ?? bi.unit?.name ?? bi.material.unit?.symbol ?? bi.material.unit?.name) ?? null;
            if (existing) {
              existing.requiredQuantity += required;
              existing.needOutsource = Boolean(existing.needOutsource) || hasOutsource;
            } else {
              materialMap.set(mid, {
                materialId: mid,
                materialCode: bi.material.code,
                materialName: bi.material.name,
                specification: bi.material.specification ?? null,
                unitId: bi.unitId ?? bi.material.unit?.id ?? null,
                unit: unitStr,
                requiredQuantity: required,
                availableStock: 0,
                shortageQuantity: 0,
                warehouseId: warehouseId ?? (item.warehouse?.id ?? p.defaultWarehouseId ?? null),
                needOutsource: hasOutsource,
              });
            }
          }
        }
      }
    }

    // 计算可用库存与缺口
    const materials = Array.from(materialMap.values());
    for (const m of materials) {
      // 优先按产品聚合所有仓库库存，避免因仓库不匹配导致显示为 0
      const product = await this.prisma.product.findUnique({ where: { id: m.materialId }, include: { productVariants: { include: { variantStocks: true } } } });
      const allStocks = (product?.productVariants || []).flatMap(v => v.variantStocks || []);
      const totalAvailable = allStocks.reduce((sum, s) => sum + (s.quantity ?? 0) - (s.reservedQuantity ?? 0), 0);

      let available = totalAvailable;
      if (m.warehouseId) {
        // 在指定仓库存在记录时，按该仓库计算；否则回退到总库存
        const whStocks = allStocks.filter(s => s.warehouseId === m.warehouseId);
        if (whStocks.length > 0) {
          available = whStocks.reduce((sum, s) => sum + (s.quantity ?? 0) - (s.reservedQuantity ?? 0), 0);
        }
      }

      m.availableStock = available > 0 ? Number(available.toFixed(6)) : 0;
      const shortage = m.requiredQuantity - m.availableStock;
      m.shortageQuantity = shortage > 0 ? Number(shortage.toFixed(6)) : 0;
    }

    return {
      orderId: order.id,
      orderNo: (order as any).orderNo ?? undefined,
      products: Array.from(productPlanMap.values()),
      materialRequirements: materials,
      generatedAt: new Date().toISOString(),
      notes: materials.length === 0 ? '该订单对应的默认BOM无物料项或未设置默认BOM' : undefined,
    };
  }

  private async getRoutingOperations(routingId: string) {
    const ops = await this.prisma.routingWorkcenter.findMany({
      where: { routingId },
      orderBy: { sequence: 'asc' },
      include: {
        operation: true,
        workcenter: true,
      }
    });
    return ops.map((op: any) => ({
      id: op.id,
      routingId: op.routingId!,
      workcenterId: op.workcenterId ?? '',
      workcenterType: op.workcenter?.type ?? undefined,
      operationId: op.operationId,
      name: op.name,
      sequence: op.sequence,
      timeMode: op.timeMode,
      timeCycleManual: op.timeCycleManual,
      wageRate: op.operation?.wageRate ?? 0,
      batch: op.batch,
      batchSize: op.batchSize,
      worksheetType: op.worksheetType ?? undefined,
      worksheetLink: op.worksheetLink ?? undefined,
      description: op.description ?? undefined,
    }));
  }

  private async accumulateMaterialsFromBom(bomId: string, quantity: number, materialMap: Map<string, MaterialRequirement>, warehouseId?: string) {
    const bom = await this.prisma.productBom.findUnique({
      where: { id: bomId },
      include: {
        routing: true,
        items: {
          include: {
            material: { include: { unit: true } },
            unit: true,
          },
          orderBy: { sequence: 'asc' }
        },
        baseUnit: true,
      }
    });
    const ops = bom?.routingId ? await this.getRoutingOperations(bom.routingId!) : undefined;
    const hasOutsource = (ops || []).some((o: any) => this.isOutsourceType(o.workcenterType));
    const baseQty = bom?.baseQuantity ?? 1;
    const ratio = baseQty > 0 ? quantity / baseQty : quantity;
    for (const bi of bom?.items || []) {
      if (bi.childBomId) {
        const nextQty = (bi.quantity ?? 0) * ratio;
        await this.accumulateMaterialsFromBom(bi.childBomId, nextQty, materialMap, warehouseId);
      } else {
        const mid = bi.materialId;
        const required = (bi.quantity ?? 0) * ratio;
        const existing = materialMap.get(mid);
        const unitStr = (bi.unit?.symbol ?? bi.unit?.name ?? bi.material.unit?.symbol ?? bi.material.unit?.name) ?? null;
        if (existing) {
          existing.requiredQuantity += required;
          existing.needOutsource = Boolean(existing.needOutsource) || hasOutsource;
        } else {
          materialMap.set(mid, {
            materialId: mid,
            materialCode: bi.material.code,
            materialName: bi.material.name,
            specification: bi.material.specification ?? null,
            unitId: bi.unitId ?? bi.material.unit?.id ?? null,
            unit: unitStr,
            requiredQuantity: required,
            availableStock: 0,
            shortageQuantity: 0,
            warehouseId: warehouseId ?? null,
            needOutsource: hasOutsource,
          });
        }
      }
    }
  }

  /**
   * 判断工作中心类型是否属于外协
   */
  private isOutsourceType(type?: string): boolean {
    if (!type) return false;
    const t = String(type).toLowerCase();
    if (t.includes('outsource') || t.includes('outsourcing') || t.includes('external') || t.includes('outside')) return true;
    // 中文常用别名
    if (type.includes('外协') || type.includes('委外') || type.includes('外包')) return true;
    return false;
  }

  async create(data: ProductionPlanPreviewRequest & { name: string; plannedStart: string; plannedFinish: string; finishedWarehouseId: string; issueWarehouseId: string; ownerId: string }, userId: string) {
    const preview = await this.preview(data);
    const created = await this.prisma.productionPlan.create({
      data: {
        orderId: preview.orderId,
        orderNo: preview.orderNo ?? null,
        name: data.name ?? null,
        status: 'draft',
        productsJson: JSON.stringify(preview.products),
        materialsJson: JSON.stringify(preview.materialRequirements),
        notes: preview.notes ?? null,
        plannedStart: data.plannedStart ? new Date(data.plannedStart) : null,
        plannedFinish: data.plannedFinish ? new Date(data.plannedFinish) : null,
        finishedWarehouseId: data.finishedWarehouseId ?? null,
        issueWarehouseId: data.issueWarehouseId ?? null,
        ownerId: data.ownerId ?? null,
        createdBy: userId,
        updatedBy: userId,
      }
    });
    return created;
  }

  async getList(params: { page?: number; pageSize?: number; status?: string; orderNo?: string; orderId?: string; startDate?: string; endDate?: string }) {
    const page = typeof params.page === 'number' ? params.page : Number(params.page || 1);
    const pageSize = typeof params.pageSize === 'number' ? params.pageSize : Number(params.pageSize || 10);
    const pagination = this.getPaginationConfig(page, pageSize);
    const where: Record<string, unknown> = {};
    if (params.status) where.status = params.status;
    if (params.orderNo) where.orderNo = params.orderNo;
    if (params.orderId) where.orderId = params.orderId;
    if (params.startDate || params.endDate) {
      const createdAt: Record<string, Date> = {};
      if (params.startDate) createdAt.gte = new Date(params.startDate);
      if (params.endDate) createdAt.lte = new Date(params.endDate);
      where.createdAt = createdAt as any;
    }
    const [total, rows] = await Promise.all([
      this.prisma.productionPlan.count({ where: where as any }),
      this.prisma.productionPlan.findMany({ where: where as any, skip: pagination.skip, take: pagination.take, orderBy: { createdAt: 'desc' } })
    ]);
    const data = rows.map(r => ({
      id: r.id,
      orderId: r.orderId,
      orderNo: r.orderNo ?? undefined,
      name: r.name ?? undefined,
      status: r.status as any,
      createdAt: r.createdAt as any,
      updatedAt: r.updatedAt as any,
      createdBy: r.createdBy,
      updatedBy: r.updatedBy,
      plannedStart: r.plannedStart as any,
      plannedFinish: r.plannedFinish as any,
      finishedWarehouseId: r.finishedWarehouseId ?? undefined,
      issueWarehouseId: r.issueWarehouseId ?? undefined,
      ownerId: r.ownerId ?? undefined,
      products: JSON.parse(r.productsJson),
      materialRequirements: JSON.parse(r.materialsJson),
      notes: r.notes ?? undefined,
    }));
    return this.buildPaginatedResponse(data, total, page, pageSize);
  }

  async getById(id: string) {
    const r = await this.prisma.productionPlan.findUnique({ where: { id } });
    if (!r) throw new Error('生产计划不存在');
    return {
      id: r.id,
      orderId: r.orderId,
      orderNo: r.orderNo ?? undefined,
      name: r.name ?? undefined,
      status: r.status as any,
      createdAt: r.createdAt as any,
      updatedAt: r.updatedAt as any,
      createdBy: r.createdBy,
      updatedBy: r.updatedBy,
      plannedStart: r.plannedStart as any,
      plannedFinish: r.plannedFinish as any,
      finishedWarehouseId: r.finishedWarehouseId ?? undefined,
      issueWarehouseId: r.issueWarehouseId ?? undefined,
      ownerId: r.ownerId ?? undefined,
      products: JSON.parse(r.productsJson),
      materialRequirements: JSON.parse(r.materialsJson),
      notes: r.notes ?? undefined,
    };
  }

  async confirm(id: string, userId: string) {
    await this.prisma.productionPlan.update({ where: { id }, data: { status: 'confirmed', updatedBy: userId } });
  }

  async cancel(id: string, userId: string) {
    await this.prisma.productionPlan.update({ where: { id }, data: { status: 'cancelled', updatedBy: userId } });
  }

  async generateManufacturingOrders(id: string, userId: string) {
    const plan = await this.prisma.productionPlan.findUnique({ where: { id } });
    if (!plan) throw new Error('生产计划不存在');
    if (plan.status !== 'confirmed') throw new Error('仅已确认的生产计划可生成制造订单');
    const products = JSON.parse(plan.productsJson || '[]') as Array<any>;
    if (!Array.isArray(products) || products.length === 0) throw new Error('生产计划没有可生成的产品');

    const { ManufacturingOrderService } = await import('../manufacturing-order/manufacturing-order.service');
    const moService = new ManufacturingOrderService();

    const payload = {
      orderId: plan.orderId,
      warehouseId: plan.finishedWarehouseId ?? undefined,
      plannedStart: plan.plannedStart ? new Date(plan.plannedStart).toISOString() : undefined,
      plannedFinish: plan.plannedFinish ? new Date(plan.plannedFinish).toISOString() : undefined,
      dueDate: plan.plannedFinish ? new Date(plan.plannedFinish).toISOString() : undefined,
      products: products.map(p => ({
        productId: p.productId,
        productCode: p.productCode,
        productName: p.productName,
        quantity: p.quantity,
        unit: p.unit ?? null,
        bomId: p.bomId ?? null,
        bomCode: p.bomCode ?? null,
        routingId: p.routingId ?? null,
        routingCode: p.routingCode ?? null,
        source: p.source ?? 'bom',
        parentProductId: p.parentProductId ?? null,
      })
      ),
    } as any;

    const created = await moService.createFromPlan(payload, userId);
    return created;
  }

  async remove(id: string, userId: string) {
    void userId
    const plan = await this.prisma.productionPlan.findUnique({ where: { id } })
    if (!plan) throw new Error('生产计划不存在')
    if (plan.status === 'confirmed' || plan.status === 'completed') {
      throw new Error('已确认或已完成的生产计划不可删除')
    }
    await this.prisma.productionPlan.delete({ where: { id } })
  }
}

export const productionPlanService = new ProductionPlanService();
