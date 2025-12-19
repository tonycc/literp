import { BaseService } from '../../../shared/services/base.service';
import type { 
  SalesReceiptInfo, 
  CreateSalesReceiptDto, 
  UpdateSalesReceiptDto, 
  SalesReceiptQueryParams 
} from '@zyerp/shared';
import { SalesReceiptStatus } from '@zyerp/shared';
import { Prisma } from '@prisma/client';
import { AppError } from '../../../shared/middleware/error';

export class SalesReceiptService extends BaseService {
  constructor() {
    super();
  }

  // 生成出库单号
  private async generateReceiptNo(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const prefix = `SR${year}${month}${day}`;

    const lastReceipt = await this.prisma.salesReceipt.findFirst({
      where: {
        receiptNo: {
          startsWith: prefix
        }
      },
      orderBy: {
        receiptNo: 'desc'
      }
    });

    if (lastReceipt) {
      const lastSequence = parseInt(lastReceipt.receiptNo.slice(-4));
      return `${prefix}${String(lastSequence + 1).padStart(4, '0')}`;
    }

    return `${prefix}0001`;
  }

  // 获取列表
  async getList(params: SalesReceiptQueryParams) {
    const { keyword, customerName, status, startDate, endDate, salesOrderId } = params;
    const { skip, take, page, pageSize } = this.getPaginationConfig(params.page, params.pageSize);
    
    const where: Prisma.SalesReceiptWhereInput = {};

    if (keyword) {
      where.OR = [
        { receiptNo: { contains: keyword } },
        { salesOrderNo: { contains: keyword } },
        { customerName: { contains: keyword } }
      ];
    }

    if (customerName) {
      where.customerName = { contains: customerName };
    }

    if (status) {
      where.status = status;
    }

    if (salesOrderId) {
      where.salesOrderId = salesOrderId;
    }

    if (startDate || endDate) {
      where.receiptDate = {};
      if (startDate) where.receiptDate.gte = new Date(startDate);
      if (endDate) where.receiptDate.lte = new Date(endDate);
    }

    const [total, items] = await Promise.all([
      this.prisma.salesReceipt.count({ where }),
      this.prisma.salesReceipt.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true
        }
      })
    ]);

    return this.buildPaginatedResponse(items as unknown as SalesReceiptInfo[], total, page, pageSize);
  }

  // 获取详情
  async getById(id: string): Promise<SalesReceiptInfo> {
    const receipt = await this.prisma.salesReceipt.findUnique({
      where: { id },
      include: {
        items: true,
        salesOrder: true
      }
    });

    if (!receipt) {
      throw new AppError('出库单不存在', 404, 'SALES_RECEIPT_NOT_FOUND');
    }

    return receipt as unknown as SalesReceiptInfo;
  }

  // 创建出库单
  async create(data: CreateSalesReceiptDto, userId: string): Promise<SalesReceiptInfo> {
    const receiptNo = await this.generateReceiptNo();

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 创建出库单
      const receipt = await tx.salesReceipt.create({
        data: {
          receiptNo,
          salesOrderId: data.salesOrderId,
          salesOrderNo: data.salesOrderNo,
          customerName: data.customerName,
          status: SalesReceiptStatus.DRAFT,
          receiptDate: new Date(data.receiptDate),
          handler: data.handler,
          remarks: data.remarks,
          createdBy: userId,
          updatedBy: userId,
          items: {
            create: data.items.map(item => ({
              salesOrderItemId: item.salesOrderItemId,
              productId: item.productId,
              productName: item.productName,
              productCode: item.productCode,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount,
              warehouseId: item.warehouseId,
              remarks: item.remarks
            }))
          }
        },
        include: {
          items: true
        }
      });

      return receipt;
    });

    return result as unknown as SalesReceiptInfo;
  }

  // 更新出库单
  async update(id: string, data: UpdateSalesReceiptDto, userId: string): Promise<SalesReceiptInfo> {
    const receipt = await this.prisma.salesReceipt.findUnique({
      where: { id }
    });

    if (!receipt) {
      throw new AppError('出库单不存在', 404, 'SALES_RECEIPT_NOT_FOUND');
    }

    if (receipt.status !== SalesReceiptStatus.DRAFT) {
      throw new AppError('只能修改草稿状态的出库单', 400, 'SALES_RECEIPT_INVALID_STATUS');
    }

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 更新主表
      await tx.salesReceipt.update({
        where: { id },
        data: {
          receiptDate: data.receiptDate ? new Date(data.receiptDate) : undefined,
          handler: data.handler,
          remarks: data.remarks,
          updatedBy: userId
        }
      });

      // 2. 更新明细（如果有）
      if (data.items) {
        // 删除旧明细
        await tx.salesReceiptItem.deleteMany({
          where: { receiptId: id }
        });

        // 创建新明细
        await tx.salesReceiptItem.createMany({
          data: data.items.map(item => ({
            receiptId: id,
            salesOrderItemId: item.salesOrderItemId,
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            warehouseId: item.warehouseId,
            remarks: item.remarks
          }))
        });
      }

      return tx.salesReceipt.findUnique({
        where: { id },
        include: { items: true }
      });
    });

    return result as unknown as SalesReceiptInfo;
  }

  // 删除出库单
  async delete(id: string): Promise<void> {
    const receipt = await this.prisma.salesReceipt.findUnique({
      where: { id }
    });

    if (!receipt) {
      throw new AppError('出库单不存在', 404, 'SALES_RECEIPT_NOT_FOUND');
    }

    if (receipt.status !== SalesReceiptStatus.DRAFT) {
      throw new AppError('只能删除草稿状态的出库单', 400, 'SALES_RECEIPT_INVALID_STATUS');
    }

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.salesReceiptItem.deleteMany({
        where: { receiptId: id }
      });

      await tx.salesReceipt.delete({
        where: { id }
      });
    });
  }

  // 确认出库（核心逻辑）
  async confirm(id: string, userId: string): Promise<SalesReceiptInfo> {
    const receipt = await this.prisma.salesReceipt.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!receipt) {
      throw new AppError('出库单不存在', 404, 'SALES_RECEIPT_NOT_FOUND');
    }

    if (receipt.status !== SalesReceiptStatus.DRAFT) {
      throw new AppError('只能确认草稿状态的出库单', 400, 'SALES_RECEIPT_INVALID_STATUS');
    }

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 更新出库单状态
      const updatedReceipt = await tx.salesReceipt.update({
        where: { id },
        data: {
          status: SalesReceiptStatus.CONFIRMED,
          updatedBy: userId
        },
        include: { items: true }
      });

      // 2. 扣减库存
      for (const item of receipt.items) {
        // 查找产品及其变体
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { productVariants: true }
        });

        if (!product || product.productVariants.length === 0) {
          throw new AppError(`商品 ${item.productName} 不存在或无变体信息`, 400, 'PRODUCT_VARIANT_MISSING');
        }

        // 优先使用默认变体，否则使用第一个
        const variantId = product.productVariants[0].id;
        
        // 扣减库存 (VariantStock)
        if (!item.warehouseId) {
          throw new AppError(`商品 ${item.productName} 未指定出库仓库`, 400, 'WAREHOUSE_REQUIRED');
        }

        const stock = await tx.variantStock.findUnique({
            where: {
                variantId_warehouseId: {
                    variantId,
                    warehouseId: item.warehouseId
                }
            }
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new AppError(`商品 ${item.productName} 在指定仓库库存不足`, 400, 'INSUFFICIENT_STOCK');
        }

        await tx.variantStock.update({
          where: { id: stock.id },
          data: {
            quantity: { decrement: item.quantity }
          }
        });
      }

      return updatedReceipt;
    });

    return result as unknown as SalesReceiptInfo;
  }

  // 作废出库单
  async cancel(id: string, userId: string): Promise<SalesReceiptInfo> {
    const receipt = await this.prisma.salesReceipt.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!receipt) {
      throw new AppError('出库单不存在', 404, 'SALES_RECEIPT_NOT_FOUND');
    }

    if (receipt.status !== SalesReceiptStatus.CONFIRMED) {
      throw new AppError('只能作废已确认的出库单', 400, 'SALES_RECEIPT_INVALID_STATUS');
    }

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 更新状态
      const updatedReceipt = await tx.salesReceipt.update({
        where: { id },
        data: {
          status: SalesReceiptStatus.CANCELLED,
          updatedBy: userId
        },
        include: { items: true }
      });

      // 2. 回滚库存
      for (const item of receipt.items) {
         const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: { productVariants: true }
         });

         if (product && product.productVariants.length > 0) {
             const variantId = product.productVariants[0].id;
             
             if (!item.warehouseId) {
                 // 理论上确认后的单据必须有仓库ID，这里作为防御性编程
                 continue;
             }
             
             await tx.variantStock.upsert({
                 where: {
                     variantId_warehouseId: {
                         variantId,
                         warehouseId: item.warehouseId
                     }
                 },
                 update: { quantity: { increment: item.quantity } },
                 create: {
                     variantId,
                     warehouseId: item.warehouseId,
                     quantity: item.quantity
                 }
             });
         }
      }

      return updatedReceipt;
    });

    return result as unknown as SalesReceiptInfo;
  }
}

export const salesReceiptService = new SalesReceiptService();
