import { BaseService } from '../../../shared/services/base.service';
import type { Prisma } from '@prisma/client';

interface CustomerPriceListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  customerId?: string;
  productCode?: string;
  status?: string;
  salesManager?: string;
  effectiveDateStart?: string;
  effectiveDateEnd?: string;
  expiryDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CustomerPriceListService extends BaseService {
  private computePrices(priceIncludingTax: number, vatRate: number) {
    const priceExcludingTax = priceIncludingTax / (1 + vatRate / 100);
    const taxAmount = priceIncludingTax - priceExcludingTax;
    return {
      priceExcludingTax: Number(priceExcludingTax.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
    };
  }

  async getList(params: CustomerPriceListParams) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      customerId,
      productCode,
      status,
      salesManager,
      effectiveDateStart,
      effectiveDateEnd,
      expiryDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const pagination = this.getPaginationConfig(page, pageSize);
    const where: any = {};
    if (keyword) {
      where.OR = [
        { productName: { contains: keyword } },
        { productCode: { contains: keyword } },
        { customerProductCode: { contains: keyword } },
        { specification: { contains: keyword } },
        { salesManager: { contains: keyword } },
      ];
    }
    if (customerId) where.customerId = customerId;
    if (productCode) where.productCode = { contains: productCode };
    if (status) where.status = status;
    if (salesManager) where.salesManager = { contains: salesManager };
    if (effectiveDateStart || effectiveDateEnd) {
      where.effectiveDate = {};
      if (effectiveDateStart) where.effectiveDate.gte = new Date(effectiveDateStart);
      if (effectiveDateEnd) where.effectiveDate.lte = new Date(effectiveDateEnd);
    }
    if (expiryDate) where.expiryDate = new Date(expiryDate);

    const [total, rows] = await Promise.all([
      this.prisma.customerPriceList.count({ where }),
      this.prisma.customerPriceList.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [sortBy]: sortOrder },
        include: { customer: { select: { name: true } } },
      }),
    ]);

    const creatorIds = Array.from(new Set(rows.map(r => r.createdBy).filter(Boolean)));
    const creators = creatorIds.length > 0 ? await this.prisma.user.findMany({ where: { id: { in: creatorIds } }, select: { id: true, username: true } }) : [];
    const creatorMap = new Map(creators.map(u => [u.id, u.username]));

    const formatted = rows.map((r: any) => ({
      ...r,
      customerName: r.customer?.name || '',
      createdByName: creatorMap.get(r.createdBy) || r.createdBy || '',
    }));

    return this.buildPaginatedResponse(formatted, total, pagination.page, pagination.pageSize);
  }

  async getById(id: string) {
    const row = await this.prisma.customerPriceList.findUnique({ where: { id } });
    if (!row) throw new Error('客户价格表不存在');
    return row;
  }

  async create(data: Record<string, unknown>, userId: string) {
    this.validateRequiredFields(data, [
      'customerId','productName','productCode','unit','priceIncludingTax','vatRate','effectiveDate','status','salesManager'
    ]);
    const priceIncludingTax = Number(data.priceIncludingTax);
    const vatRate = Number(data.vatRate);
    const { priceExcludingTax, taxAmount } = this.computePrices(priceIncludingTax, vatRate);
    const payload = this.normalizePayload(data, userId, true, priceExcludingTax, taxAmount) as unknown as Prisma.CustomerPriceListCreateInput;
    const created = await this.prisma.customerPriceList.create({ data: payload });
    return created;
  }

  async update(id: string, data: Record<string, unknown>, userId: string) {
    const partial: Record<string, unknown> = { ...data };
    if (partial.priceIncludingTax !== undefined || partial.vatRate !== undefined) {
      const priceIncludingTax = Number(partial.priceIncludingTax ?? 0);
      const vatRate = Number(partial.vatRate ?? 13);
      const { priceExcludingTax, taxAmount } = this.computePrices(priceIncludingTax, vatRate);
      partial.priceExcludingTax = priceExcludingTax;
      partial.taxAmount = taxAmount;
    }
    const payload = this.normalizePayload(partial, userId, false) as unknown as Prisma.CustomerPriceListUpdateInput;
    const updated = await this.prisma.customerPriceList.update({ where: { id }, data: payload });
    return updated;
  }

  async delete(id: string) {
    await this.prisma.customerPriceList.delete({ where: { id } });
  }

  private normalizePayload(data: Record<string, unknown>, userId: string, isCreate: boolean, priceExcludingTax?: number, taxAmount?: number) {
    const pick = <T extends Record<string, unknown>>(obj: T, keys: string[]) => keys.reduce<Record<string, unknown>>((acc, k) => {
      if (obj[k] !== undefined) acc[k] = obj[k];
      return acc;
    }, {});
    const base = pick(data, [
      'customerId','productId','productName','productCode','customerProductCode','specification','unit','priceIncludingTax','vatRate','priceExcludingTax','taxAmount','effectiveDate','expiryDate','status','salesManager','submittedBy'
    ]);
    const effectiveDate = typeof base.effectiveDate === 'string' ? new Date(base.effectiveDate as string) : (base.effectiveDate as Date | undefined);
    const expiryDate = typeof base.expiryDate === 'string' ? new Date(base.expiryDate as string) : (base.expiryDate as Date | undefined);
    return {
      ...base,
      priceExcludingTax: priceExcludingTax ?? base.priceExcludingTax ?? 0,
      taxAmount: taxAmount ?? base.taxAmount ?? 0,
      effectiveDate,
      expiryDate: expiryDate ?? null,
      createdBy: isCreate ? userId : undefined,
      updatedBy: userId,
      createdAt: isCreate ? new Date() : undefined,
      updatedAt: new Date(),
    };
  }
}