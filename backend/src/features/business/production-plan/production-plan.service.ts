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
    const { salesOrderId, warehouseId, includeRouting = true } = data;

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
    const products: ProductionPlanProductPlan[] = [];
    const materialMap: Map<string, MaterialRequirement> = new Map();

    for (const item of order.items) {
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

      const productPlan: ProductionPlanProductPlan = {
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        quantity: planQty,
        unit: (item.unit?.symbol ?? p.unit?.symbol ?? item.unit?.name ?? p.unit?.name) ?? null,
        bomId: bom?.id ?? null,
        bomCode: bom?.code ?? null,
        baseQuantity: baseQty,
        routingId: bom?.routingId ?? null,
        routingCode: bom?.routing?.code ?? null,
        operations: includeRouting ? ops : undefined,
      };
      products.push(productPlan);

      // 累加物料需求
      if (bom?.items && bom.items.length > 0) {
        // 判定该产品是否含外协工序
        const hasOutsource = (ops || []).some((o: any) => this.isOutsourceType(o.workcenterType));
        for (const bi of bom.items) {
          const mid = bi.materialId;
          const required = (bi.quantity ?? 0) * ratio;
          const existing = materialMap.get(mid);
          const unitStr = (bi.unit?.symbol ?? bi.unit?.name ?? bi.material.unit?.symbol ?? bi.material.unit?.name) ?? null;

          if (existing) {
            existing.requiredQuantity += required;
            // 若任一关联产品为外协，则物料标记需外协
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

    // 计算可用库存与缺口
    const materials = Array.from(materialMap.values());
    for (const m of materials) {
      // 优先按产品聚合所有仓库库存，避免因仓库不匹配导致显示为 0
      const allStocks = await this.prisma.productStock.findMany({
        where: { productId: m.materialId }
      });
      const totalAvailable = allStocks.reduce((sum, s) => sum + (s.quantity ?? 0) - (s.reservedQuantity ?? 0), 0);

      let available = totalAvailable;
      if (m.warehouseId) {
        // 在指定仓库存在记录时，按该仓库计算；否则回退到总库存
        const whStocks = await this.prisma.productStock.findMany({
          where: { productId: m.materialId, warehouseId: m.warehouseId }
        });
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
      products,
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
}

export const productionPlanService = new ProductionPlanService();