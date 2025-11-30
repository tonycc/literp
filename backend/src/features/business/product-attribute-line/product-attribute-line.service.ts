import { BaseService } from '../../../shared/services/base.service'

export class ProductAttributeLineService extends BaseService {
  async list(productId: string, params: any) {
    const page = Number(params?.page || 1)
    const pageSize = Number(params?.pageSize || 20)
    const where = { productId }
    const [lines, total] = await this.prisma.$transaction([
      this.prisma.productAttributeLine.findMany({
        where,
        include: { attribute: true, values: { include: { attributeValue: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.productAttributeLine.count({ where }),
    ])
    const data = lines.map(l => ({ id: l.id, attributeId: l.attributeId, attributeName: l.attribute.name, values: l.values.map(v => v.attributeValue.name) }))
    return { success: true, data: { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }, timestamp: new Date() }
  }

  private toCode(s: string) {
    return s.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
  }

  async saveLines(productId: string, payload: Array<{ attributeName: string; values: string[] }>) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 获取当前产品的所有属性线
      const currentLines = await tx.productAttributeLine.findMany({ where: { productId }, include: { attribute: true } })
      const payloadNames = new Set(payload.map(p => p.attributeName.trim()))
      
      // 2. 删除不在 payload 中的属性线 (新增逻辑)
      for (const line of currentLines) {
        if (!payloadNames.has(line.attribute.name)) {
          await tx.productAttributeLine.delete({ where: { id: line.id } })
        }
      }

      // 4. 更新或创建 payload 中的属性线
      for (const item of payload) {
        const code = this.toCode(item.attributeName)
        // 优先通过 code 查找，如果找不到再通过 name 查找（防止重复创建）
        let attribute = await tx.attribute.findUnique({ where: { code } })
        if (!attribute) {
          attribute = await tx.attribute.findFirst({ where: { name: item.attributeName } })
        }
        if (!attribute) {
          attribute = await tx.attribute.create({ data: { name: item.attributeName, code } })
        }

        let line = await tx.productAttributeLine.findUnique({ where: { productId_attributeId: { productId, attributeId: attribute.id } } })
        if (!line) {
          line = await tx.productAttributeLine.create({ data: { productId, attributeId: attribute.id } })
        }

        const existing = await tx.productAttributeLineValue.findMany({ where: { lineId: line.id } })
        const existingIds = new Set(existing.map(e => e.attributeValueId))
        const targetIds: string[] = []

        for (const v of item.values) {
          let val = await tx.attributeValue.findFirst({ where: { attributeId: attribute.id, name: v } })
          if (!val) {
            val = await tx.attributeValue.create({ data: { attributeId: attribute.id, name: v } })
          }
          targetIds.push(val.id)
          if (!existingIds.has(val.id)) {
            await tx.productAttributeLineValue.create({ data: { lineId: line.id, attributeValueId: val.id } })
          }
        }

        for (const e of existing) {
          if (!targetIds.includes(e.attributeValueId)) {
            await tx.productAttributeLineValue.delete({ where: { id: e.id } })
          }
        }
      }
      return { success: true, data: true, timestamp: new Date() }
    })
  }

  async createLine(productId: string, attributeName: string, values: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const code = this.toCode(attributeName)
      let attribute = await tx.attribute.findUnique({ where: { code } })
      if (!attribute) {
        attribute = await tx.attribute.findFirst({ where: { name: attributeName } })
      }
      if (!attribute) attribute = await tx.attribute.create({ data: { name: attributeName, code } })

      let line = await tx.productAttributeLine.findUnique({ where: { productId_attributeId: { productId, attributeId: attribute.id } } })
      if (!line) line = await tx.productAttributeLine.create({ data: { productId, attributeId: attribute.id } })

      for (const v of values) {
        let val = await tx.attributeValue.findFirst({ where: { attributeId: attribute.id, name: v } })
        if (!val) val = await tx.attributeValue.create({ data: { attributeId: attribute.id, name: v } })
        await tx.productAttributeLineValue.upsert({
          where: { lineId_attributeValueId: { lineId: line.id, attributeValueId: val.id } },
          update: {},
          create: { lineId: line.id, attributeValueId: val.id },
        })
      }
      return { success: true, data: true, timestamp: new Date() }
    })
  }

  async updateLine(productId: string, lineId: string, attributeName?: string, values?: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const line = await tx.productAttributeLine.findUnique({ include: { attribute: true }, where: { id: lineId } })
      if (!line || line.productId !== productId) throw new Error('Attribute line not found')

      if (attributeName && attributeName !== line.attribute.name) {
        const code = this.toCode(attributeName)
        let attribute = await tx.attribute.findUnique({ where: { code } })
        if (!attribute) {
          attribute = await tx.attribute.findFirst({ where: { name: attributeName } })
        }
        if (!attribute) attribute = await tx.attribute.create({ data: { name: attributeName, code } })
        await tx.productAttributeLine.update({ where: { id: lineId }, data: { attributeId: attribute.id } })
      }

      if (values) {
        const updatedLine = await tx.productAttributeLine.findUnique({ where: { id: lineId } })
        const existing = await tx.productAttributeLineValue.findMany({ where: { lineId: updatedLine!.id } })
        const existingIds = new Set(existing.map(e => e.attributeValueId))
        const targetIds: string[] = []
        
        const currentAttrId = attributeName && attributeName !== line.attribute.name
          ? (await tx.productAttributeLine.findUnique({ include: { attribute: true }, where: { id: lineId } }))!.attributeId
          : line.attributeId

        for (const v of values) {
          let val = await tx.attributeValue.findFirst({ where: { attributeId: currentAttrId, name: v } })
          if (!val) val = await tx.attributeValue.create({ data: { attributeId: currentAttrId, name: v } })
          targetIds.push(val.id)
          if (!existingIds.has(val.id)) {
            await tx.productAttributeLineValue.create({ data: { lineId: lineId, attributeValueId: val.id } })
          }
        }
        for (const e of existing) {
          if (!targetIds.includes(e.attributeValueId)) {
            await tx.productAttributeLineValue.delete({ where: { id: e.id } })
          }
        }
      }
      return { success: true, data: true, timestamp: new Date() }
    })
  }

  async deleteLine(productId: string, lineId: string) {
    return this.prisma.$transaction(async (tx) => {
      const line = await tx.productAttributeLine.findUnique({ where: { id: lineId } })
      if (!line || line.productId !== productId) {
        throw new Error('Attribute line not found')
      }
      await tx.productAttributeLine.delete({ where: { id: lineId } })
      return { success: true, data: true, timestamp: new Date() }
    })
  }
}