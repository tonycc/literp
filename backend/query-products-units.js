const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function queryProductsAndUnits() {
  try {
    console.log('查询产品数据...');
    
    // 查询产品
    const products = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        code: true,
        name: true,
        type: true
      }
    });
    
    console.log('✅ 找到产品:', products.length, '个');
    products.forEach(product => {
      console.log(`  - ID: ${product.id}, 编码: ${product.code}, 名称: ${product.name}, 类型: ${product.type}`);
    });
    
    console.log('\n查询单位数据...');
    
    // 查询单位
    const units = await prisma.unit.findMany({
      take: 5,
      select: {
        id: true,
        symbol: true,
        name: true,
        category: true
      }
    });
    
    console.log('✅ 找到单位:', units.length, '个');
    units.forEach(unit => {
      console.log(`  - ID: ${unit.id}, 符号: ${unit.symbol}, 名称: ${unit.name}, 类别: ${unit.category}`);
    });
    
    return { products, units };
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

queryProductsAndUnits();