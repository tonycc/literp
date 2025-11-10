import { BaseService } from '../../../shared/services/base.service';

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
}