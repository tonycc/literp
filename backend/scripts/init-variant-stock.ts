import { PrismaClient } from '@prisma/client'

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

async function main() {
  const unitIdDefault = await ensureUnit()
  const warehouseIdDefault = await ensureWarehouse()
  const variants = await prisma.productVariant.findMany({ include: { product: true } })
  let updated = 0
  for (const v of variants) {
    const unitId = (v as any).product?.unitId ?? unitIdDefault
    const warehouseId = (v as any).product?.defaultWarehouseId ?? warehouseIdDefault
    await prisma.variantStock.upsert({
      where: { variantId_warehouseId: { variantId: v.id, warehouseId } },
      update: { quantity: 500, unitId },
      create: { variantId: v.id, warehouseId, unitId, quantity: 500, reservedQuantity: 0 },
    })
    updated++
  }
  console.log(JSON.stringify({ success: true, updated }, null, 2))
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })