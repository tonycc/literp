import { BaseService } from '../../../shared/services/base.service'

interface SupplierPriceListParams {
  page?: number
  pageSize?: number
  supplierId?: string
  supplierName?: string
  productName?: string
  productCode?: string
  vatRate?: number
  startDate?: string
  endDate?: string
}

interface SupplierPriceInput {
  supplierId: string
  variantId?: string | null
  productName: string
  productCode: string
  unitId?: string | null
  unit?: string | null
  taxInclusivePrice: number
  vatRate: number
  currency?: string | null
  effectiveDate?: Date | null
  expiryDate?: Date | null
  minOrderQty?: number | null
  purchaseManager?: string | null
  remark?: string | null
}

export class SupplierPriceService extends BaseService {
  private parseDate(input?: unknown): Date | null {
    if (!input) return null
    if (input instanceof Date) return input
    if (typeof input === 'string') {
      const normalized = input.includes('T') ? input : `${input}T00:00:00.000Z`
      const d = new Date(normalized)
      if (!Number.isNaN(d.getTime())) return d
    }
    return null
  }
  async getList(params: SupplierPriceListParams) {
    const { page = 1, pageSize = 10, supplierId, productName, productCode, vatRate, startDate, endDate } = params || {}
    const pagination = this.getPaginationConfig(page, pageSize)
    const where: Record<string, unknown> = {}
    if (supplierId) where.supplierId = supplierId
    if (productName) where.productName = { contains: productName }
    if (productCode) where.productCode = { contains: productCode }
    if (typeof vatRate === 'number') where.vatRate = vatRate
    if (startDate || endDate) {
      // @ts-ignore
      where.effectiveDate = {}
      // @ts-ignore
      if (startDate) where.effectiveDate.gte = new Date(startDate)
      // @ts-ignore
      if (endDate) where.effectiveDate.lte = new Date(endDate)
    }

    const [total, list] = await Promise.all([
      // @ts-ignore
      this.prisma.supplierPrice.count({ where }),
      // @ts-ignore
      this.prisma.supplierPrice.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return this.buildPaginatedResponse(list, total, pagination.page, pagination.pageSize)
  }

  async getById(id: string) {
    // @ts-ignore
    const item = await this.prisma.supplierPrice.findUnique({ where: { id } })
    if (!item) throw new Error('价格记录不存在')
    return item
  }

  async create(data: SupplierPriceInput, userId: string) {
    const taxExclusivePrice = Number((data.taxInclusivePrice / (1 + data.vatRate)).toFixed(2))
    const payload = {
      supplierId: data.supplierId,
      variantId: data.variantId ?? null,
      productName: data.productName,
      productCode: data.productCode,
      unitId: data.unitId ?? null,
      unit: data.unit ?? null,
      taxInclusivePrice: data.taxInclusivePrice,
      vatRate: data.vatRate,
      taxExclusivePrice,
      currency: data.currency ?? 'CNY',
      effectiveDate: this.parseDate(data.effectiveDate) ?? null,
      expiryDate: this.parseDate(data.expiryDate) ?? null,
      minOrderQty: typeof data.minOrderQty === 'number' ? data.minOrderQty : null,
      purchaseManager: data.purchaseManager ?? null,
      remark: data.remark ?? null,
      submittedBy: userId,
      submittedAt: new Date(),
      createdBy: userId,
      updatedBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    // @ts-ignore
    const created = await this.prisma.supplierPrice.create({ data: payload })
    return created
  }

  async update(id: string, data: Partial<SupplierPriceInput>, userId: string) {
    const partial: Record<string, unknown> = { updatedBy: userId, updatedAt: new Date() }
    if (data.supplierId) partial.supplierId = data.supplierId
    if (data.variantId !== undefined) partial.variantId = data.variantId ?? null
    if (data.productName) partial.productName = data.productName
    if (data.productCode) partial.productCode = data.productCode
    if (data.unitId !== undefined) partial.unitId = data.unitId ?? null
    if (data.unit !== undefined) partial.unit = data.unit ?? null
    if (typeof data.taxInclusivePrice === 'number') partial.taxInclusivePrice = data.taxInclusivePrice
    if (typeof data.vatRate === 'number') partial.vatRate = data.vatRate
    if (typeof data.taxInclusivePrice === 'number' && typeof data.vatRate === 'number') {
      const taxExclusivePrice = Number((data.taxInclusivePrice / (1 + data.vatRate)).toFixed(2))
      partial.taxExclusivePrice = taxExclusivePrice
    }
    if (data.currency) partial.currency = data.currency
    if (data.effectiveDate !== undefined) partial.effectiveDate = this.parseDate(data.effectiveDate) ?? null
    if (data.expiryDate !== undefined) partial.expiryDate = this.parseDate(data.expiryDate) ?? null
    if (data.minOrderQty !== undefined) partial.minOrderQty = typeof data.minOrderQty === 'number' ? data.minOrderQty : null
    if (data.purchaseManager !== undefined) partial.purchaseManager = data.purchaseManager ?? null
    if (data.remark !== undefined) partial.remark = data.remark ?? null

    // @ts-ignore
    const updated = await this.prisma.supplierPrice.update({ where: { id }, data: partial })
    return updated
  }

  async delete(id: string) {
    // @ts-ignore
    await this.prisma.supplierPrice.delete({ where: { id } })
    return null
  }
}