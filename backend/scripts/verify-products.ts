import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 验证产品数据...');

  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
          code: true,
        },
      },
      unit: {
        select: {
          name: true,
          symbol: true,
        },
      },
      defaultWarehouse: {
        select: {
          name: true,
          code: true,
        },
      },
    },
    orderBy: {
      code: 'asc',
    },
  });

  console.log(`\n📊 共找到 ${products.length} 个产品:\n`);

  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.code} - ${product.name}`);
    console.log(`   类型: ${product.type}`);
    console.log(`   规格: ${product.specification || '无'}`);
    console.log(`   类别: ${product.category?.name || '无'} (${product.category?.code || '无'})`);
    console.log(`   单位: ${product.unit.name} (${product.unit.symbol})`);
    console.log(`   仓库: ${product.defaultWarehouse?.name || '无'} (${product.defaultWarehouse?.code || '无'})`);
    console.log(`   状态: ${product.status}`);
    console.log('');
  });

  // 按类型统计
  const typeStats = products.reduce((acc, product) => {
    acc[product.type] = (acc[product.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📈 产品类型统计:');
  Object.entries(typeStats).forEach(([type, count]) => {
    const typeName = type === 'finished_product' ? '成品' : 
                     type === 'semi_finished_product' ? '半成品' : '原材料';
    console.log(`- ${typeName}: ${count} 个`);
  });

  // 按类别统计
  const categoryStats = products.reduce((acc, product) => {
    const categoryName = product.category?.name || '未分类';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📈 产品类别统计:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`- ${category}: ${count} 个`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });