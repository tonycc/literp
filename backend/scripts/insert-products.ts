import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始插入产品数据...');

  // 获取基础数据
  const categories = await prisma.productCategory.findMany();
  const units = await prisma.unit.findMany();
  const warehouses = await prisma.warehouse.findMany();

  // 创建映射
  const categoryMap = new Map(categories.map(c => [c.code, c.id]));
  const unitMap = new Map(units.map(u => [u.symbol, u.id]));
  const warehouseMap = new Map(warehouses.map(w => [w.code, w.id]));

  // 产品数据
  const products = [
    {
      name: 'H1000 铰链',
      type: 'finished_product',
      specification: '35mm*11.5mm',
      categoryCode: 'CAT004', // 铰链
      unitSymbol: 'pcs',
      warehouseCode: 'WH001'
    },
    {
      name: 'H1000 转轴',
      type: 'raw_material',
      specification: '35mm*11.5mm',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: 'H1000 新款弹簧',
      type: 'raw_material',
      specification: '35mm*11.5mm',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: 'H1000 新款弹簧座',
      type: 'raw_material',
      specification: '35mm*11.5mm',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '内六角凹端紧定螺钉',
      type: 'raw_material',
      specification: 'M5*8',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '内六角平端紧定螺钉',
      type: 'raw_material',
      specification: 'M5*8',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '内六角沉头螺钉',
      type: 'raw_material',
      specification: 'M6*16',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '十字槽沉头螺钉',
      type: 'raw_material',
      specification: 'M6*16',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '沉头自攻螺钉',
      type: 'raw_material',
      specification: 'ST5*45',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: 'H1000 转轴套（介子）',
      type: 'raw_material',
      specification: '1*1',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: 'H1000 护套',
      type: 'raw_material',
      specification: '1*1',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: 'H1000 挡水片',
      type: 'raw_material',
      specification: '1*1',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: 'H1000 胶垫',
      type: 'raw_material',
      specification: '86*50*1.0mm',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: 'H1000 胶垫',
      type: 'raw_material',
      specification: '2.0mm',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '装饰帽（M6 沉头内六角）',
      type: 'raw_material',
      specification: '1*1',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '胶塞（8#）',
      type: 'raw_material',
      specification: '8#',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '内六角扳手',
      type: 'raw_material',
      specification: '4mm',
      categoryCode: 'CAT001', // 配件
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '37 纸箱',
      type: 'raw_material',
      specification: '37*22*19',
      categoryCode: 'CAT002', // 包装材料
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: 'H1000 白盒',
      type: 'raw_material',
      specification: '10*5.8*6.8',
      categoryCode: 'CAT002', // 包装材料
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '14*12 中珍珠棉袋',
      type: 'raw_material',
      specification: '14*12 cm',
      categoryCode: 'CAT002', // 包装材料
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '5*7 密口胶袋',
      type: 'raw_material',
      specification: '5*7cm',
      categoryCode: 'CAT002', // 包装材料
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '10*7 密口胶袋',
      type: 'raw_material',
      specification: '10*7 cm',
      categoryCode: 'CAT002', // 包装材料
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '火柴盒',
      type: 'raw_material',
      specification: '5.8*8',
      categoryCode: 'CAT002', // 包装材料
      unitSymbol: 'pcs',
      warehouseCode: 'WH002'
    },
    {
      name: '活动夹座',
      type: 'semi_finished_product',
      specification: '1*1',
      categoryCode: 'CAT003', // 电镀半成品
      unitSymbol: 'pcs',
      warehouseCode: 'WH003'
    },
    {
      name: '活动夹板',
      type: 'semi_finished_product',
      specification: '1*1',
      categoryCode: 'CAT003', // 电镀半成品
      unitSymbol: 'pcs',
      warehouseCode: 'WH003'
    }
  ];

  // 生成产品编码的函数
  function generateProductCode(name: string, index: number): string {
    // 提取产品名称的首字母或关键字
    if (name.includes('H1000')) {
      return `H1000-${String(index + 1).padStart(3, '0')}`;
    } else if (name.includes('螺钉')) {
      return `SCR-${String(index + 1).padStart(3, '0')}`;
    } else if (name.includes('胶')) {
      return `RUB-${String(index + 1).padStart(3, '0')}`;
    } else if (name.includes('袋') || name.includes('盒') || name.includes('箱')) {
      return `PKG-${String(index + 1).padStart(3, '0')}`;
    } else if (name.includes('夹')) {
      return `CLP-${String(index + 1).padStart(3, '0')}`;
    } else {
      return `PRD-${String(index + 1).padStart(3, '0')}`;
    }
  }

  // 插入产品数据
  const createdProducts = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const code = generateProductCode(product.name, i);
    
    try {
      const createdProduct = await prisma.product.create({
        data: {
          code,
          name: product.name,
          type: product.type,
          specification: product.specification,
          categoryId: categoryMap.get(product.categoryCode),
          unitId: unitMap.get(product.unitSymbol)!,
          defaultWarehouseId: warehouseMap.get(product.warehouseCode),
          status: 'active',
          isActive: true,
          createdBy: 'system',
          updatedBy: 'system',
          description: `${product.type === 'finished_product' ? '成品' : product.type === 'semi_finished_product' ? '半成品' : '原材料'} - ${product.name}`,
        },
      });
      
      createdProducts.push(createdProduct);
      console.log(`✅ 创建产品: ${createdProduct.code} - ${createdProduct.name}`);
    } catch (error) {
      console.error(`❌ 创建产品失败: ${product.name}`, error);
    }
  }

  console.log(`\n🎉 产品数据插入完成！共创建 ${createdProducts.length} 个产品`);
  
  // 统计信息
  const stats = {
    finished_product: createdProducts.filter(p => p.type === 'finished_product').length,
    semi_finished_product: createdProducts.filter(p => p.type === 'semi_finished_product').length,
    raw_material: createdProducts.filter(p => p.type === 'raw_material').length,
  };
  
  console.log('\n📊 产品类型统计:');
  console.log(`- 成品: ${stats.finished_product} 个`);
  console.log(`- 半成品: ${stats.semi_finished_product} 个`);
  console.log(`- 原材料: ${stats.raw_material} 个`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });