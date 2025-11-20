import { PrismaClient } from '@prisma/client'
import { ProductVariantsService } from '../src/features/business/product-variants/product-variants.service'

const prisma = new PrismaClient()

async function ensureUnit() {
  let unit = await prisma.unit.findFirst()
  if (!unit) {
    unit = await prisma.unit.create({ data: { name: '件', symbol: 'EA', category: 'general', precision: 2 } })
  }
  return unit.id
}

async function ensureWarehouse() {
  let wh = await prisma.warehouse.findFirst()
  if (!wh) {
    wh = await prisma.warehouse.create({ data: { code: 'WH1', name: '主仓', type: 'MAIN' } })
  }
  return wh.id
}

function randCode(prefix: string) { return `${prefix}${Date.now()}` }

async function main() {
  const unitId = await ensureUnit()
  const warehouseId = await ensureWarehouse()
  const code = randCode('PTEST')
  const product = await prisma.product.create({ data: { code, name: '测试产品', type: 'finished_product', unitId, defaultWarehouseId: warehouseId, status: 'active', acquisitionMethod: 'production', createdBy: 'system', updatedBy: 'system' } })
  const attrColorCode = '颜色'.toUpperCase()
  const attrSizeCode = '尺寸'.toUpperCase()
  const color = await prisma.attribute.upsert({ where: { code: attrColorCode }, update: {}, create: { name: '颜色', code: attrColorCode } })
  const size = await prisma.attribute.upsert({ where: { code: attrSizeCode }, update: {}, create: { name: '尺寸', code: attrSizeCode } })
  const red = await prisma.attributeValue.upsert({ where: { attributeId_name: { attributeId: color.id, name: '红色' } }, update: {}, create: { attributeId: color.id, name: '红色' } })
  const blue = await prisma.attributeValue.upsert({ where: { attributeId_name: { attributeId: color.id, name: '蓝色' } }, update: {}, create: { attributeId: color.id, name: '蓝色' } })
  const m = await prisma.attributeValue.upsert({ where: { attributeId_name: { attributeId: size.id, name: 'M' } }, update: {}, create: { attributeId: size.id, name: 'M' } })
  const svc = new ProductVariantsService()
  await svc.generateVariants(product.id, { 颜色: ['红色', '蓝色'], 尺寸: ['M'] } as any, 'system')
  const listAll = await svc.getVariants(product.id, { page: 1, pageSize: 50 } as any)
  const listRed = await svc.getVariants(product.id, { page: 1, pageSize: 50, attributes: { 颜色: '红色' } } as any)
  console.log(JSON.stringify({ totalAll: (listAll as any).pagination?.total ?? (listAll as any).total, totalRed: (listRed as any).pagination?.total ?? (listRed as any).total }, null, 2))
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })

