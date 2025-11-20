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
    for (const item of payload) {
      const code = this.toCode(item.attributeName)
      let attribute = await this.prisma.attribute.findUnique({ where: { code } })
      if (!attribute) {
        attribute = await this.prisma.attribute.create({ data: { name: item.attributeName, code } })
      }
      let line = await this.prisma.productAttributeLine.findUnique({ where: { productId_attributeId: { productId, attributeId: attribute.id } } })
      if (!line) {
        line = await this.prisma.productAttributeLine.create({ data: { productId, attributeId: attribute.id } })
      }
      const existing = await this.prisma.productAttributeLineValue.findMany({ where: { lineId: line.id } })
      const existingIds = new Set(existing.map(e => e.attributeValueId))
      const targetIds: string[] = []
      for (const v of item.values) {
        let val = await this.prisma.attributeValue.findFirst({ where: { attributeId: attribute.id, name: v } })
        if (!val) {
          val = await this.prisma.attributeValue.create({ data: { attributeId: attribute.id, name: v } })
        }
        targetIds.push(val.id)
        if (!existingIds.has(val.id)) {
          await this.prisma.productAttributeLineValue.create({ data: { lineId: line.id, attributeValueId: val.id } })
        }
      }
      for (const e of existing) {
        if (!targetIds.includes(e.attributeValueId)) {
          await this.prisma.productAttributeLineValue.delete({ where: { id: e.id } })
        }
      }
    }
    return { success: true, data: true, timestamp: new Date() }
  }

  async createLine(productId: string, attributeName: string, values: string[]) {
    const code = this.toCode(attributeName)
    let attribute = await this.prisma.attribute.findUnique({ where: { code } })
    if (!attribute) attribute = await this.prisma.attribute.create({ data: { name: attributeName, code } })
    let line = await this.prisma.productAttributeLine.findUnique({ where: { productId_attributeId: { productId, attributeId: attribute.id } } })
    if (!line) line = await this.prisma.productAttributeLine.create({ data: { productId, attributeId: attribute.id } })
    for (const v of values) {
      let val = await this.prisma.attributeValue.findFirst({ where: { attributeId: attribute.id, name: v } })
      if (!val) val = await this.prisma.attributeValue.create({ data: { attributeId: attribute.id, name: v } })
      await this.prisma.productAttributeLineValue.upsert({
        where: { lineId_attributeValueId: { lineId: line.id, attributeValueId: val.id } },
        update: {},
        create: { lineId: line.id, attributeValueId: val.id },
      })
    }
    return { success: true, data: true, timestamp: new Date() }
  }

  async updateLine(productId: string, lineId: string, attributeName?: string, values?: string[]) {
    const line = await this.prisma.productAttributeLine.findUnique({ include: { attribute: true }, where: { id: lineId } })
    if (!line || line.productId !== productId) throw new Error('Attribute line not found')
    if (attributeName && attributeName !== line.attribute.name) {
      const code = this.toCode(attributeName)
      let attribute = await this.prisma.attribute.findUnique({ where: { code } })
      if (!attribute) attribute = await this.prisma.attribute.create({ data: { name: attributeName, code } })
      await this.prisma.productAttributeLine.update({ where: { id: lineId }, data: { attributeId: attribute.id } })
    }
    if (values) {
      const updatedLine = await this.prisma.productAttributeLine.findUnique({ where: { id: lineId } })
      const existing = await this.prisma.productAttributeLineValue.findMany({ where: { lineId: updatedLine!.id } })
      const existingIds = new Set(existing.map(e => e.attributeValueId))
      const targetIds: string[] = []
      const currentAttrId = attributeName && attributeName !== line.attribute.name
        ? (await this.prisma.productAttributeLine.findUnique({ include: { attribute: true }, where: { id: lineId } }))!.attributeId
        : line.attributeId
      for (const v of values) {
        let val = await this.prisma.attributeValue.findFirst({ where: { attributeId: currentAttrId, name: v } })
        if (!val) val = await this.prisma.attributeValue.create({ data: { attributeId: currentAttrId, name: v } })
        targetIds.push(val.id)
        if (!existingIds.has(val.id)) {
          await this.prisma.productAttributeLineValue.create({ data: { lineId: lineId, attributeValueId: val.id } })
        }
      }
      for (const e of existing) {
        if (!targetIds.includes(e.attributeValueId)) {
          await this.prisma.productAttributeLineValue.delete({ where: { id: e.id } })
        }
      }
    }
    return { success: true, data: true, timestamp: new Date() }
  }

  async deleteLine(productId: string, lineId: string) {
    const line = await this.prisma.productAttributeLine.findUnique({ where: { id: lineId } })
    if (!line || line.productId !== productId) {
      throw new Error('Attribute line not found')
    }
    await this.prisma.productAttributeLine.delete({ where: { id: lineId } })
    return { success: true, data: true, timestamp: new Date() }
  }
}
