import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function ensureAttribute(name: string, values: string[]) {
  const code = name.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
  let attr = await prisma.attribute.findUnique({ where: { code } })
  if (!attr) {
    attr = await prisma.attribute.create({ data: { name, code } })
  }
  for (const v of values) {
    const found = await prisma.attributeValue.findFirst({ where: { attributeId: attr.id, name: v } })
    if (!found) {
      await prisma.attributeValue.create({ data: { attributeId: attr.id, name: v } })
    }
  }
}

async function main() {
  await ensureAttribute('颜色', ['红色', '蓝色', '绿色'])
  await ensureAttribute('尺寸', ['S', 'M', 'L'])
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
