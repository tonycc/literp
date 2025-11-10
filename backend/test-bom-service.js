const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 模拟BomCrudService的createBom方法
async function testBomService() {
  try {
    console.log('开始测试BOM服务层...');
    
    // 获取测试数据
    const product = await prisma.product.findFirst();
    const unit = await prisma.unit.findFirst();
    const user = await prisma.user.findFirst();
    
    if (!product || !unit || !user) {
      console.log('❌ 缺少必要的测试数据');
      return;
    }
    
    // 模拟前端发送的数据
    const bomData = {
      code: 'TEST-BOM-SERVICE-' + Date.now(),
      name: '测试BOM服务',
      productId: product.id,
      type: 'production',
      version: 'V1.0',
      status: 'draft',
      isDefault: false,
      baseQuantity: 1,
      baseUnitId: unit.id,
      effectiveDate: new Date().toISOString(), // 前端通常发送ISO字符串
      description: '这是一个测试BOM',
      remark: '测试备注'
    };
    
    console.log('测试数据:', JSON.stringify(bomData, null, 2));
    
    // 模拟服务层的验证逻辑
    console.log('开始验证...');
    
    // 验证必需字段
    if (!bomData.code) {
      throw new Error('BOM编码不能为空');
    }
    if (!bomData.name) {
      throw new Error('BOM名称不能为空');
    }
    if (!bomData.productId) {
      throw new Error('产品ID不能为空');
    }
    if (!bomData.type) {
      throw new Error('BOM类型不能为空');
    }
    if (!bomData.version) {
      throw new Error('版本不能为空');
    }
    if (!bomData.status) {
      throw new Error('状态不能为空');
    }
    if (bomData.baseQuantity === undefined || bomData.baseQuantity === null) {
      throw new Error('基准数量不能为空');
    }
    if (!bomData.baseUnitId) {
      throw new Error('基准单位ID不能为空');
    }
    if (!bomData.effectiveDate) {
      throw new Error('生效日期不能为空');
    }
    
    console.log('✅ 基本验证通过');
    
    // 处理日期字段
    let effectiveDate;
    if (typeof bomData.effectiveDate === 'string') {
      effectiveDate = new Date(bomData.effectiveDate);
    } else if (bomData.effectiveDate instanceof Date) {
      effectiveDate = bomData.effectiveDate;
    } else {
      throw new Error('生效日期格式不正确');
    }
    
    let expiryDate = null;
    if (bomData.expiryDate) {
      if (typeof bomData.expiryDate === 'string') {
        expiryDate = new Date(bomData.expiryDate);
      } else if (bomData.expiryDate instanceof Date) {
        expiryDate = bomData.expiryDate;
      } else {
        throw new Error('失效日期格式不正确');
      }
    }
    
    console.log('✅ 日期处理完成');
    console.log('生效日期:', effectiveDate);
    console.log('失效日期:', expiryDate);
    
    // 检查产品是否存在
    const productExists = await prisma.product.findUnique({
      where: { id: bomData.productId }
    });
    
    if (!productExists) {
      throw new Error('产品不存在');
    }
    
    console.log('✅ 产品存在验证通过');
    
    // 检查BOM编码是否已存在
    const existingBom = await prisma.productBom.findUnique({
      where: { code: bomData.code }
    });
    
    if (existingBom) {
      throw new Error('BOM编码已存在');
    }
    
    console.log('✅ BOM编码唯一性验证通过');
    
    // 如果设置为默认BOM，需要将该产品的其他BOM设置为非默认
    if (bomData.isDefault) {
      await prisma.productBom.updateMany({
        where: { productId: bomData.productId },
        data: { isDefault: false }
      });
      console.log('✅ 默认BOM设置完成');
    }
    
    // 创建BOM
    const newBom = await prisma.productBom.create({
      data: {
        code: bomData.code,
        name: bomData.name,
        productId: bomData.productId,
        type: bomData.type,
        version: bomData.version,
        status: bomData.status,
        isDefault: bomData.isDefault || false,
        baseQuantity: bomData.baseQuantity,
        baseUnitId: bomData.baseUnitId,
        routingId: bomData.routingId || null,
        effectiveDate: effectiveDate,
        expiryDate: expiryDate,
        description: bomData.description || null,
        remark: bomData.remark || null,
        createdBy: user.id,
        updatedBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ BOM创建成功!');
    console.log('BOM ID:', newBom.id);
    console.log('BOM编码:', newBom.code);
    
    return { success: true, data: newBom, message: 'BOM创建成功' };
    
  } catch (error) {
    console.error('❌ BOM服务测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
    return { success: false, message: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

testBomService();