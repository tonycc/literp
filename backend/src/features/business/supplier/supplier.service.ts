import { BaseService } from '../../../shared/services/base.service'
import type { SupplierStatus, SupplierCategory } from '@zyerp/shared'

interface SupplierListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: SupplierStatus
  category?: SupplierCategory
}

interface SupplierInput {
  code: string
  name: string
  shortName?: string | null
  category: SupplierCategory
  status: SupplierStatus
  contactName?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  registeredCapital?: number | null
  creditLevel?: string | null
  remark?: string | null
}

export class SupplierService extends BaseService {
  async getSuppliers(params: SupplierListParams) {
    const { page = 1, pageSize = 10, keyword, status, category } = params || {}
    const pagination = this.getPaginationConfig(page, pageSize)

    const where: Record<string, unknown> = {}

    if (keyword) {
      // name/code 模糊
      // @ts-ignore
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } }
      ]
    }
    if (status) {
      // @ts-ignore
      where.status = status
    }
    if (category) {
      // @ts-ignore
      where.category = category
    }

    const [total, suppliers] = await Promise.all([
      // @ts-ignore
      this.prisma.supplier.count({ where }),
      // @ts-ignore
      this.prisma.supplier.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      })
    ])

    return this.buildPaginatedResponse(suppliers, total, pagination.page, pagination.pageSize)
  }

  async getSupplierById(id: string) {
    // @ts-ignore
    const supplier = await this.prisma.supplier.findUnique({ where: { id } })
    if (!supplier) {
      throw new Error('供应商不存在')
    }
    return supplier
  }

  async createSupplier(data: SupplierInput, userId: string) {
    const payload = {
      code: data.code,
      name: data.name,
      shortName: data.shortName ?? null,
      category: data.category,
      status: data.status,
      contactName: data.contactName ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      address: data.address ?? null,
      registeredCapital: typeof data.registeredCapital === 'number' ? data.registeredCapital : null,
      creditLevel: data.creditLevel ?? null,
      remark: data.remark ?? null,
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // @ts-ignore
    const created = await this.prisma.supplier.create({ data: payload })
    return created
  }

  async updateSupplier(id: string, data: Partial<SupplierInput>, userId: string) {
    const payload = {
      ...(data.code ? { code: data.code } : {}),
      ...(data.name ? { name: data.name } : {}),
      ...(data.shortName !== undefined ? { shortName: data.shortName ?? null } : {}),
      ...(data.category ? { category: data.category } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.contactName !== undefined ? { contactName: data.contactName ?? null } : {}),
      ...(data.phone !== undefined ? { phone: data.phone ?? null } : {}),
      ...(data.email !== undefined ? { email: data.email ?? null } : {}),
      ...(data.address !== undefined ? { address: data.address ?? null } : {}),
      ...(data.registeredCapital !== undefined ? { registeredCapital: typeof data.registeredCapital === 'number' ? data.registeredCapital : null } : {}),
      ...(data.creditLevel !== undefined ? { creditLevel: data.creditLevel ?? null } : {}),
      ...(data.remark !== undefined ? { remark: data.remark ?? null } : {}),
      updatedBy: userId,
      updatedAt: new Date(),
    }

    // @ts-ignore
    const updated = await this.prisma.supplier.update({ where: { id }, data: payload })
    return updated
  }

  async deleteSupplier(id: string) {
    // @ts-ignore
    await this.prisma.supplier.delete({ where: { id } })
    return null
  }
}