import { BaseService } from '../../../shared/services/base.service'

export class ProductAttributeService extends BaseService {
  async getAttributes(params: any) {
    const page = Number(params?.page || 1)
    const pageSize = Number(params?.pageSize || 50)
    const keyword = String(params?.keyword || '')
    const where: any = keyword
      ? { OR: [{ name: { contains: keyword, mode: 'insensitive' } }, { code: { contains: keyword, mode: 'insensitive' } }] }
      : {}
    const [items, total] = await this.prisma.$transaction([
      this.prisma.attribute.findMany({
        where,
        include: { values: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.attribute.count({ where }),
    ])
    const data = items.map(a => ({ id: a.id, name: a.name, code: a.code, isActive: a.isActive, sortOrder: a.sortOrder, description: a.description || undefined, isGlobal: (a as any).isGlobal === true, values: a.values.map(v => v.name) }))
    return {
      success: true,
      data: { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      message: '获取成功',
      timestamp: new Date(),
    }
  }

  async createAttribute(data: any) {
    const name = String(data?.name || '').trim()
    if (!name) return { success: false, message: 'name required', timestamp: new Date() } as any
    const code = String(data?.code || name).trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
    const created = await this.prisma.attribute.create({ data: {
      name,
      code,
      description: data?.description || null,
      sortOrder: Number(data?.sortOrder ?? 0),
      isActive: data?.isActive ?? true,
      isGlobal: !!data?.isGlobal,
    }})
    return { success: true, data: created, message: '创建成功', timestamp: new Date() }
  }

  async updateAttribute(id: string, data: any) {
    const payload: any = {}
    if (data?.name) payload.name = String(data.name)
    if (data?.code) payload.code = String(data.code)
    if (data?.description !== undefined) payload.description = data.description || null
    if (data?.sortOrder !== undefined) payload.sortOrder = Number(data.sortOrder)
    if (data?.isActive !== undefined) payload.isActive = !!data.isActive
    if (data?.isGlobal !== undefined) payload.isGlobal = !!data.isGlobal
    const updated = await this.prisma.attribute.update({ where: { id }, data: payload })
    return { success: true, data: updated, message: '更新成功', timestamp: new Date() }
  }

  async deleteAttribute(id: string) {
    await this.prisma.attribute.delete({ where: { id } })
    return { success: true, data: true, message: '删除成功', timestamp: new Date() }
  }

  async getAttributeValues(attributeId: string, params: any) {
    const page = Number(params?.page || 1)
    const pageSize = Number(params?.pageSize || 50)
    const where = { attributeId }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.attributeValue.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { sortOrder: 'asc' } }),
      this.prisma.attributeValue.count({ where }),
    ])
    const data = items.map(v => ({ id: v.id, attributeId: v.attributeId, name: v.name, code: v.code || undefined, value: v.value || undefined, isActive: v.isActive, sortOrder: v.sortOrder }))
    return { success: true, data: { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }, timestamp: new Date() }
  }

  async createAttributeValues(attributeId: string, values: Array<{ name: string; code?: string; sortOrder?: number; isActive?: boolean }>) {
    for (const item of values) {
      const name = String(item?.name || '').trim()
      if (!name) continue
      const existing = await this.prisma.attributeValue.findFirst({ where: { attributeId, name } })
      if (existing) {
        await this.prisma.attributeValue.update({ where: { id: existing.id }, data: {
          code: item?.code || existing.code,
          sortOrder: Number(item?.sortOrder ?? existing.sortOrder),
          isActive: item?.isActive ?? existing.isActive,
        }})
      } else {
        await this.prisma.attributeValue.create({ data: {
          attributeId,
          name,
          code: item?.code || null,
          sortOrder: Number(item?.sortOrder ?? 0),
          isActive: item?.isActive ?? true,
        }})
      }
    }
    return { success: true, data: true, message: '保存成功', timestamp: new Date() }
  }

  async updateAttributeValue(valueId: string, data: any) {
    const payload: any = {}
    if (data?.name) payload.name = String(data.name)
    if (data?.code !== undefined) payload.code = data.code || null
    if (data?.value !== undefined) payload.value = data.value || null
    if (data?.sortOrder !== undefined) payload.sortOrder = Number(data.sortOrder)
    if (data?.isActive !== undefined) payload.isActive = !!data.isActive
    await this.prisma.attributeValue.update({ where: { id: valueId }, data: payload })
    return { success: true, data: true, message: '更新成功', timestamp: new Date() }
  }

  async deleteAttributeValue(valueId: string) {
    try {
      await this.prisma.attributeValue.delete({ where: { id: valueId } })
      return { success: true, data: true, message: '删除成功', timestamp: new Date() }
    } catch (error: any) {
      if (error?.code === 'P2003') {
        return { success: false, data: false, message: '删除失败：该属性值已被引用', timestamp: new Date() } as any
      }
      throw error
    }
  }
}
