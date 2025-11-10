import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 开始初始化产品库存数据（全部设为 10）...');

  const products = await prisma.product.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      unitId: true,
      defaultWarehouseId: true,
    },
    orderBy: { code: 'asc' },
  });

  console.log(`➡️  共计产品 ${products.length} 条，准备初始化库存...`);

  let updated = 0;
  let created = 0;

  // 兼容尚未重新生成 Prisma Client 的情况，使用 any 访问新模型
  const productStockClient = (prisma as any).productStock;
  if (!productStockClient) {
    console.warn('⚠️ 检测到 Prisma Client 尚未包含 productStock 模型，请先运行 `npm run db:generate` 再执行初始化。');
    return;
  }

  for (const p of products) {
    const stock = await productStockClient.upsert({
      where: { productId: p.id },
      update: {
        quantity: 10,
        reservedQuantity: 0,
        unitId: p.unitId,
        warehouseId: p.defaultWarehouseId ?? null,
      },
      create: {
        productId: p.id,
        quantity: 10,
        reservedQuantity: 0,
        unitId: p.unitId,
        warehouseId: p.defaultWarehouseId ?? null,
      },
    });

    // 简单的统计：如果 upsert 后 updatedAt 比 createdAt 晚，认为是更新，否则认为是创建
    if ((stock as any).createdAt && (stock as any).updatedAt && (stock as any).updatedAt > (stock as any).createdAt) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  console.log(`✅ 初始化完成：新建 ${created} 条，更新 ${updated} 条`);
}

main()
  .catch((e) => {
    console.error('❌ 初始化库存失败：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 已断开数据库连接');
  });