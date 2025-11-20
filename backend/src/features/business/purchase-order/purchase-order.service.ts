import { BaseService } from '../../../shared/services/base.service';

interface PurchaseOrderItemInput {
  productId: string;
  quantity: number;
  price?: number;
  amount?: number;
  unitId?: string | null;
  warehouseId?: string | null;
  specification?: string | null;
  batchNumber?: string | null;
  remark?: string | null;
}

interface PurchaseOrderInput {
  supplierId?: string | null;
  supplierName?: string | null;
  orderDate?: string | Date;
  expectedDeliveryDate?: string | Date | null;
  status?: string;
  currency?: string;
  remark?: string | null;
  items?: PurchaseOrderItemInput[];
}

interface PurchaseOrderListParams {
  page?: number;
  pageSize?: number;
  orderNumber?: string;
  supplierName?: string;
  productName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export class PurchaseOrderService extends BaseService {
  async getPurchaseOrders(params: PurchaseOrderListParams) {
    const { page = 1, pageSize = 10, orderNumber, supplierName, productName, status, startDate, endDate } = params || {};

    const pagination = this.getPaginationConfig(page, pageSize);

    const where: Record<string, unknown> = {};

    if (orderNumber) {
      where.orderNo = { contains: orderNumber };
    }

    if (supplierName) {
      where.supplierName = { contains: supplierName };
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      // @ts-ignore
      where.orderDate = {};
      // @ts-ignore
      if (startDate) where.orderDate.gte = new Date(startDate);
      // @ts-ignore
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    if (productName) {
      // 通过明细中的产品名称进行筛选
      // @ts-ignore
      where.items = {
        some: {
          product: {
            name: { contains: productName },
          },
        },
      };
    }

    const [total, orders] = await Promise.all([
      this.prisma.purchaseOrder.count({ where }),
      this.prisma.purchaseOrder.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { orderDate: 'desc' },
        include: {
          items: {
            include: {
              product: true,
              unit: true,
              warehouse: true,
            },
          },
        },
      }),
    ]);

    return this.buildPaginatedResponse(orders, total, pagination.page, pagination.pageSize);
  }

  async getPurchaseOrderById(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true, unit: true, warehouse: true },
        },
      },
    });

    if (!order) {
      throw new Error('采购订单不存在');
    }

    return order;
  }

  private async generateOrderNo(): Promise<string> {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const prefix = `PO${y}${m}${d}`;

    const last = await this.prisma.purchaseOrder.findFirst({
      where: { orderNo: { startsWith: prefix } },
      orderBy: { orderNo: 'desc' },
      select: { orderNo: true },
    });

    let next = 1;
    if (last?.orderNo) {
      const m2 = last.orderNo.match(new RegExp(`^${prefix}(\\d+)$`));
      if (m2 && m2[1]) next = parseInt(m2[1], 10) + 1;
    }
    return `${prefix}${String(next).padStart(4, '0')}`;
  }

  async createPurchaseOrder(data: PurchaseOrderInput, userId: string) {
    const orderNo = await this.generateOrderNo();
    const orderDate = data.orderDate ? new Date(data.orderDate) : new Date();

    const items = Array.isArray(data.items) ? data.items : [];
    const normalizedItems = items
      .filter((it): it is PurchaseOrderItemInput => !!it && typeof it.productId === 'string' && typeof it.quantity === 'number')
      .map((it) => {
        const price = typeof it.price === 'number' ? it.price : 0;
        const amount = typeof it.amount === 'number' ? it.amount : price * it.quantity;
        return {
          productId: it.productId,
          unitId: it.unitId ?? null,
          warehouseId: it.warehouseId ?? null,
          quantity: it.quantity,
          price,
          amount,
          specification: it.specification ?? null,
          batchNumber: it.batchNumber ?? null,
          remark: it.remark ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

    const totalAmount = normalizedItems.reduce((sum, it) => sum + (it.amount || 0), 0);

    const created = await this.prisma.$transaction(async (tx) => {
      const supplierNameValue = data.supplierName ?? (
        data.supplierId
          ? (await tx.supplier.findUnique({ where: { id: data.supplierId }, select: { name: true } }))?.name ?? null
          : null
      );
      const order = await tx.purchaseOrder.create({
        data: {
          orderNo,
          supplierId: data.supplierId ?? null,
          supplierName: supplierNameValue,
          status: data.status ?? 'draft',
          orderDate,
          expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
          totalAmount,
          currency: data.currency ?? 'CNY',
          remark: data.remark ?? null,
          createdBy: userId,
          updatedBy: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      if (normalizedItems.length > 0) {
        await tx.purchaseOrderItem.createMany({
          data: normalizedItems.map((it) => ({ ...it, orderId: order.id })),
        });
      }

      return tx.purchaseOrder.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true, unit: true, warehouse: true } } },
      });
    });

    return created;
  }

  async updatePurchaseOrder(id: string, data: PurchaseOrderInput, userId: string) {
    const items = Array.isArray(data.items) ? data.items : [];
    const normalizedItems = items
      .filter((it): it is PurchaseOrderItemInput => !!it && typeof it.productId === 'string' && typeof it.quantity === 'number')
      .map((it) => {
        const price = typeof it.price === 'number' ? it.price : 0;
        const amount = typeof it.amount === 'number' ? it.amount : price * it.quantity;
        return {
          productId: it.productId,
          unitId: it.unitId ?? null,
          warehouseId: it.warehouseId ?? null,
          quantity: it.quantity,
          price,
          amount,
          specification: it.specification ?? null,
          batchNumber: it.batchNumber ?? null,
          remark: it.remark ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

    const totalAmount = normalizedItems.reduce((sum, it) => sum + (it.amount || 0), 0);

    const updated = await this.prisma.$transaction(async (tx) => {
      const supplierNameValue =
        data.supplierName !== undefined
          ? data.supplierName
          : data.supplierId !== undefined
            ? ((data.supplierId
                ? (await tx.supplier.findUnique({ where: { id: data.supplierId }, select: { name: true } }))?.name
                : null) ?? null)
            : undefined;
      await tx.purchaseOrder.update({
        where: { id },
        data: {
          supplierId: data.supplierId ?? undefined,
          supplierName: supplierNameValue,
          status: data.status ?? undefined,
          orderDate: data.orderDate ? new Date(data.orderDate) : undefined,
          expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
          totalAmount: normalizedItems.length > 0 ? totalAmount : undefined,
          currency: data.currency ?? undefined,
          remark: data.remark ?? undefined,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });

      if (Array.isArray(data.items)) {
        await tx.purchaseOrderItem.deleteMany({ where: { orderId: id } });
        if (normalizedItems.length > 0) {
          await tx.purchaseOrderItem.createMany({ data: normalizedItems.map((it) => ({ ...it, orderId: id })) });
        }
      }

      return tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: { include: { product: true, unit: true, warehouse: true } } },
      });
    });

    return updated;
  }

  async deletePurchaseOrder(id: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.purchaseOrderItem.deleteMany({ where: { orderId: id } });
      await tx.purchaseOrder.delete({ where: { id } });
    });
  }
}