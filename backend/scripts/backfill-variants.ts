import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function toCode(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
}

function buildVariantHash(attrs: Record<string, string>) {
  const keys = Object.keys(attrs).sort()
  if (keys.length === 0) return 'BASE'
  return keys.map(k => `${k}=${attrs[k]}`).join('|')
}

async function upsertAttribute(name: string) {
  const code = toCode(name)
  const existing = await prisma.attribute.findUnique({ where: { code } })
  if (existing) return existing
  return prisma.attribute.create({ data: { name, code } })
}

async function upsertAttributeValue(attributeId: string, name: string) {
  const existing = await prisma.attributeValue.findFirst({ where: { attributeId, name } })
  if (existing) return existing
  return prisma.attributeValue.create({ data: { attributeId, name } })
}

async function ensureMasterVariant(productId: string, productCode: string, attrs: Record<string, string>) {
  const variantHash = buildVariantHash(attrs)
  const code = `${productCode}-BASE`
  const existing = await prisma.productVariant.findFirst({ where: { productId, variantHash } })
  if (existing) return existing
  const created = await prisma.productVariant.create({ data: { productId, code, name: code, variantHash } })
  for (const [attrName, attrValueName] of Object.entries(attrs)) {
    const attribute = await upsertAttribute(attrName)
    const value = await upsertAttributeValue(attribute.id, attrValueName)
    await prisma.variantAttributeValue.upsert({
      where: { variantId_attributeId: { variantId: created.id, attributeId: attribute.id } },
      update: { attributeValueId: value.id },
      create: { variantId: created.id, attributeId: attribute.id, attributeValueId: value.id },
    })
  }
  return created
}

async function main() {
  const products = await prisma.product.findMany()
  for (const p of products) {
    let attrs: Record<string, string> = {}
    if (p.variantAttributes) {
      try {
        const parsed = JSON.parse(p.variantAttributes)
        if (parsed && typeof parsed === 'object') {
          for (const k of Object.keys(parsed)) {
            const v = parsed[k]
            if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
              attrs[k] = String(v)
            }
          }
        }
      } catch {}
    }
    await ensureMasterVariant(p.id, p.code, attrs)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
