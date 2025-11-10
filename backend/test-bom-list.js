const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBomList() {
  try {
    console.log('开始测试BOM列表查询...');
    
    // 直接查询数据库
    const boms = await prisma.productBom.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            code: true,
            name: true
          }
        },
        baseUnit: {
          select: {
            name: true,
            symbol: true
          }
        },
        routing: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });
    
    console.log('查询结果:', JSON.stringify(boms, null, 2));
    console.log('BOM数量:', boms.length);
    
  } catch (error) {
    console.error('测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBomList();