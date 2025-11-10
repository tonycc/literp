const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBomCreation() {
  try {
    console.log('开始测试BOM创建...');
    
    // 首先检查是否有产品和单位数据
    const products = await prisma.product.findMany({
      take: 1
    });
    
    const units = await prisma.unit.findMany({
      take: 1
    });
    
    const users = await prisma.user.findMany({
      take: 1
    });
    
    console.log('数据库中的数据:');
    console.log('产品数量:', products.length);
    console.log('单位数量:', units.length);
    console.log('用户数量:', users.length);
    
    if (products.length === 0) {
      console.log('❌ 没有产品数据，无法创建BOM');
      return;
    }
    
    if (units.length === 0) {
      console.log('❌ 没有单位数据，无法创建BOM');
      return;
    }
    
    if (users.length === 0) {
      console.log('❌ 没有用户数据，无法创建BOM');
      return;
    }
    
    const product = products[0];
    const unit = units[0];
    const user = users[0];
    
    console.log('使用的测试数据:');
    console.log('产品:', product.code, '-', product.name);
    console.log('单位:', unit.name, '(', unit.symbol, ')');
    console.log('用户:', user.username);
    
    // 尝试创建BOM
    const bomData = {
      code: 'TEST-BOM-' + Date.now(),
      name: '测试BOM',
      productId: product.id,
      type: 'production',
      version: 'V1.0',
      status: 'draft',
      isDefault: false,
      baseQuantity: 1.0,
      baseUnitId: unit.id,
      effectiveDate: new Date(),
      createdBy: user.id,
      updatedBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('创建BOM数据:', JSON.stringify(bomData, null, 2));
    
    const newBom = await prisma.productBom.create({
      data: bomData
    });
    
    console.log('✅ BOM创建成功!');
    console.log('BOM ID:', newBom.id);
    console.log('BOM编码:', newBom.code);
    
  } catch (error) {
    console.error('❌ BOM创建失败:', error);
    console.error('错误详情:', error.message);
    if (error.meta) {
      console.error('错误元数据:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testBomCreation();