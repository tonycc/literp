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
    const data = items.map(a => ({
      id: a.id,
      name: a.name,
      code: a.code,
      isActive: a.isActive,
      sortOrder: a.sortOrder,
      description: a.description || undefined,
      isGlobal: (a as any).isGlobal === true,
      values: a.values.map(v => v.name),
      attributeValues: a.values.map(v => ({
        id: v.id,
        name: v.name,
        code: v.code,
        sortOrder: v.sortOrder,
        isActive: v.isActive
      }))
    }))
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
    
    const values = Array.isArray(data.attributeValues) ? data.attributeValues : []
    
    const created = await this.prisma.attribute.create({ data: {
      name,
      code,
      description: data?.description || null,
      sortOrder: Number(data?.sortOrder ?? 0),
      isActive: data?.isActive ?? true,
      isGlobal: !!data?.isGlobal,
      values: {
        create: values.map((v: any) => ({
          name: String(v.name),
          code: v.code ? String(v.code) : null,
          sortOrder: Number(v.sortOrder || 0),
          isActive: true
        }))
      }
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

    const updated = await this.prisma.$transaction(async (tx) => {
      const attr = await tx.attribute.update({ where: { id }, data: payload })
      
      if (Array.isArray(data.attributeValues)) {
        const newValues = data.attributeValues
        
        // Get existing values
        const existingValues = await tx.attributeValue.findMany({ where: { attributeId: id } })
        const existingIds = new Set(existingValues.map(v => v.id))
        const newIds = new Set(newValues.map((v: any) => v.id).filter((id: string) => id))
        
        // 1. Update existing
        for (const val of newValues) {
          if (val.id && existingIds.has(val.id)) {
            await tx.attributeValue.update({
              where: { id: val.id },
              data: {
                name: String(val.name),
                code: val.code ? String(val.code) : null,
                sortOrder: Number(val.sortOrder || 0),
                isActive: val.isActive ?? true
              }
            })
          } else {
            // 2. Create new
            await tx.attributeValue.create({
              data: {
                attributeId: id,
                name: String(val.name),
                code: val.code ? String(val.code) : null,
                sortOrder: Number(val.sortOrder || 0),
                isActive: val.isActive ?? true
              }
            })
          }
        }
        
        // 3. Delete removed (if not referenced check is needed, but here we force sync)
        // If referenced, this might throw. For now, we let it throw or we can try/catch.
        // The user wants to maintain values. Deleting a value that is used is tricky.
        // But since we are "removing maintain value function" (the safe separate one),
        // and merging it here, we should probably try to delete.
        
        const toDelete = existingValues.filter(v => !newIds.has(v.id))
        for (const v of toDelete) {
          try {
            await tx.attributeValue.delete({ where: { id: v.id } })
          } catch (e: any) {
            if (e?.code === 'P2003') {
              throw new Error(`属性值 "${v.name}" 已被使用，无法删除`)
            }
            throw e
          }
        }
      }
      return attr
    })

    return { success: true, data: updated, message: '更新成功', timestamp: new Date() }
  }

  async deleteAttribute(id: string) {
    try {
      await this.prisma.attribute.delete({ where: { id } })
      return { success: true, data: true, message: '删除成功', timestamp: new Date() }
    } catch (e: any) {
      if (e?.code === 'P2003') {
        throw new Error('该属性或其值已被使用，无法删除')
      }
      throw e
    }
  }

  async getAttributeValues(attributeId: string) {
    const values = await this.prisma.attributeValue.findMany({
      where: { attributeId },
      orderBy: { sortOrder: 'asc' }
    })
    
    return {
      success: true,
      data: values.map(v => ({
        id: v.id,
        attributeId: v.attributeId,
        name: v.name,
        code: v.code,
        sortOrder: v.sortOrder,
        isActive: v.isActive
      })),
      message: '获取属性值成功',
      timestamp: new Date()
    }
  }
}
