import { BaseService } from '../../../shared/services/base.service';
import type { CustomerListParams, CreateCustomerData, UpdateCustomerData } from '@zyerp/shared';
import type { Prisma } from '@prisma/client';

export class CustomerService extends BaseService {
  async getCustomerOptions(params: { keyword?: string; activeOnly?: boolean }) {
    const keyword = params.keyword?.trim();
    const where: any = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
      ];
    }
    if (params.activeOnly) {
      where.status = 'active';
    }
    try {
      const rows = await this.prisma.customer.findMany({
        where,
        select: { id: true, code: true, name: true },
        take: 50,
        orderBy: { name: 'asc' },
      });
      return rows;
    } catch (e) {
      // 兼容数据库未迁移出 customers 表的情况：回退到从销售订单去重客户名
      const soWhere: any = {};
      if (keyword) {
        soWhere.customerName = { contains: keyword };
      }
      const rows = await this.prisma.salesOrder.findMany({
        where: soWhere,
        select: { customerName: true },
        distinct: ['customerName'],
        take: 50,
        orderBy: { customerName: 'asc' },
      });
      return rows
        .map((r) => String(r.customerName || '').trim())
        .filter((n) => n.length > 0)
        .map((name) => ({ id: name, code: '', name }));
    }
  }

  async getCustomers(params: CustomerListParams) {
    const { page = 1, pageSize = 10, keyword, category, status, creditLevel, industry, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const pagination = this.getPaginationConfig(page, pageSize);
    const where: any = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
        { contactPerson: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;
    if (creditLevel) where.creditLevel = creditLevel;
    if (industry) where.industry = { contains: industry };

    const [total, rows] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return this.buildPaginatedResponse(rows, total, pagination.page, pagination.pageSize);
  }

  async getCustomerById(id: string) {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    if (!row) throw new Error('客户不存在');
    return row;
  }

  async createCustomer(data: CreateCustomerData, userId: string) {
    this.validateRequiredFields(data as unknown as Record<string, unknown>, [
      'code', 'name', 'category', 'contactPerson', 'phone'
    ]);
    const payload = this.normalizePayload(data as unknown as Record<string, unknown>, userId, true) as unknown as Prisma.CustomerCreateInput;
    const created = await this.prisma.customer.create({ data: payload });
    return created;
  }

  async updateCustomer(id: string, data: UpdateCustomerData | Record<string, unknown>, userId: string) {
    const payload = this.normalizePayload(data as unknown as Record<string, unknown>, userId, false) as unknown as Prisma.CustomerUpdateInput;
    const updated = await this.prisma.customer.update({ where: { id }, data: payload });
    return updated;
  }

  async deleteCustomer(id: string) {
    await this.prisma.customer.delete({ where: { id } });
  }

  private normalizePayload(data: Record<string, unknown>, userId: string, isCreate: boolean) {
    const pick = <T extends Record<string, unknown>>(obj: T, keys: string[]) => keys.reduce<Record<string, unknown>>((acc, k) => {
      if (obj[k] !== undefined) acc[k] = obj[k];
      return acc;
    }, {});
    const base = pick(data, [
      'code','name','category','contactPerson','phone','email','address','creditLevel','creditLimit','status','taxNumber','bankAccount','bankName','website','industry','remark','businessLicense','legalRepresentative'
    ]);
    const establishedDate = typeof data.establishedDate === 'string' ? new Date(data.establishedDate) : (data.establishedDate as Date | undefined);
    const registeredCapital = data.registeredCapital !== undefined ? Number(data.registeredCapital) : undefined;
    return {
      ...base,
      address: (base.address as string | undefined) ?? '',
      creditLevel: (base.creditLevel as string | undefined) ?? 'A',
      establishedDate: establishedDate ?? null,
      registeredCapital: registeredCapital ?? null,
      createdBy: isCreate ? userId : undefined,
      updatedBy: userId,
      createdAt: isCreate ? new Date() : undefined,
      updatedAt: new Date(),
    };
  }
}