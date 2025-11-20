import { BaseService } from '../../../shared/services/base.service';

interface SalesOrderItemInput {
  productId: string;
  quantity: number;
  price?: number;
  amount?: number;
  unitId?: string | null;
  warehouseId?: string | null;
  remark?: string | null;
}

interface SalesOrderInput {
  customerName?: string | null;
  orderDate?: string | Date;
  status?: string;
  currency?: string;
  remark?: string | null;
  deliveryDate?: string | Date;
  salesManager?: string | null;
  paymentMethod?: string | null;
  items?: SalesOrderItemInput[];
}

interface SalesOrderListParams {
  page?: number;
  pageSize?: number;
  orderNumber?: string;
  customerName?: string;
  productName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export class SalesOrderService extends BaseService {
  async getSalesOrders(params: SalesOrderListParams) {
    const { page = 1, pageSize = 10, orderNumber, customerName, productName, status, startDate, endDate } = params || {};

    const pagination = this.getPaginationConfig(page, pageSize);

    const where: any = {};

    if (orderNumber) {
      where.orderNo = { contains: orderNumber };
    }

    if (customerName) {
      where.customerName = { contains: customerName };
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate);
      if (endDate) where.orderDate.lte = new Date(endDate);
    }

    if (productName) {
      // 通过明细中的产品名称进行筛选
      where.items = {
        some: {
          product: {
            name: { contains: productName }
          }
        }
      };
    }

    const [total, orders] = await Promise.all([
      this.prisma.salesOrder.count({ where }),
      this.prisma.salesOrder.findMany({
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
            }
          }
        }
      })
    ]);

    return this.buildPaginatedResponse(orders, total, pagination.page, pagination.pageSize);
  }

  async getSalesOrderById(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            unit: true,
            warehouse: true,
          }
        }
      }
    });

    if (!order) {
      throw new Error('销售订单不存在');
    }

    return order;
  }

  async getSalesOrderItems(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      select: {
        id: true,
        items: {
          include: {
            product: true,
            unit: true,
            warehouse: true,
          }
        }
      }
    });

    if (!order) {
      throw new Error('销售订单不存在');
    }

    return order.items;
  }

  private async generateOrderNo(): Promise<string> {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const prefix = `SO${y}${m}${d}`;

    const last = await this.prisma.salesOrder.findFirst({
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

  async createSalesOrder(data: SalesOrderInput, userId: string) {
    const orderNo = await this.generateOrderNo();
    const orderDate = data.orderDate ? new Date(data.orderDate) : new Date();

    const items = Array.isArray(data.items) ? data.items : [];
    const normalizedItems = items
      .filter((it): it is SalesOrderItemInput => !!it && typeof it.productId === 'string' && typeof it.quantity === 'number')
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
          remark: it.remark ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

    const totalAmount = normalizedItems.reduce((sum, it) => sum + (it.amount || 0), 0);

    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          orderNo,
          customerName: data.customerName ?? null,
          status: data.status ?? 'draft',
          orderDate,
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
          salesManager: data.salesManager ?? null,
          paymentMethod: data.paymentMethod ?? null,
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
        await tx.salesOrderItem.createMany({
          data: normalizedItems.map((it) => ({ ...it, orderId: order.id })),
        });
      }

      return tx.salesOrder.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true, unit: true, warehouse: true } } },
      });
    });

    return created;
  }

  async updateSalesOrder(id: string, data: SalesOrderInput, userId: string) {
    const items = Array.isArray(data.items) ? data.items : [];
    const normalizedItems = items
      .filter((it): it is SalesOrderItemInput => !!it && typeof it.productId === 'string' && typeof it.quantity === 'number')
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
          remark: it.remark ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

    const totalAmount = normalizedItems.reduce((sum, it) => sum + (it.amount || 0), 0);

    const updated = await this.prisma.$transaction(async (tx) => {
      // 更新主表
      await tx.salesOrder.update({
        where: { id },
        data: {
          customerName: data.customerName ?? undefined,
          status: data.status ?? undefined,
          orderDate: data.orderDate ? new Date(data.orderDate) : undefined,
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
          salesManager: data.salesManager ?? undefined,
          paymentMethod: data.paymentMethod ?? undefined,
          totalAmount: normalizedItems.length > 0 ? totalAmount : undefined,
          currency: data.currency ?? undefined,
          remark: data.remark ?? undefined,
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });

      // 全量替换明细
      if (Array.isArray(data.items)) {
        await tx.salesOrderItem.deleteMany({ where: { orderId: id } });
        if (normalizedItems.length > 0) {
          await tx.salesOrderItem.createMany({ data: normalizedItems.map((it) => ({ ...it, orderId: id })) });
        }
      }

      return tx.salesOrder.findUnique({
        where: { id },
        include: { items: { include: { product: true, unit: true, warehouse: true } } },
      });
    });

    return updated;
  }

  async deleteSalesOrder(id: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.salesOrderItem.deleteMany({ where: { orderId: id } });
      await tx.salesOrder.delete({ where: { id } });
    });
  }
}