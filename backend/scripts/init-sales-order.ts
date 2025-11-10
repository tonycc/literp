import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 初始化销售订单数据（产品：铰链）');

  // 1) 查找“铰链”相关产品（优先名称包含“铰链”，其次类别CAT004）
  const hingeProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { name: { contains: '铰链' } },
        { category: { is: { code: 'CAT004' } } },
      ],
      status: 'active',
      isActive: true,
    },
    include: {
      unit: true,
      defaultWarehouse: true,
    },
  });

  let product = hingeProduct;

  // 2) 若未找到则创建一个示例产品 H1000 铰链
  if (!product) {
    console.log('未找到“铰链”产品，正在创建示例产品 H1000 铰链...');
    const unit = await prisma.unit.findFirst({ where: { symbol: 'pcs' } });
    const category = await prisma.productCategory.findUnique({ where: { code: 'CAT004' } });
    const warehouse = await prisma.warehouse.findFirst({ where: { code: 'WH001' } });

    if (!unit) throw new Error('未找到计量单位 pcs');
    if (!category) throw new Error('未找到产品类别 CAT004（铰链）');

    const created = await prisma.product.create({
      data: {
        code: 'H1000-001',
        name: 'H1000 铰链',
        type: 'finished_product',
        specification: '35mm*11.5mm',
        categoryId: category.id,
        unitId: unit.id,
        defaultWarehouseId: warehouse?.id,
        status: 'active',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
        description: '成品 - H1000 铰链',
      },
      include: { unit: true, defaultWarehouse: true },
    });
    product = created;
    console.log(`✅ 已创建示例产品：${created.code} - ${created.name}`);
  }

  // 安全获取仓库、单位
  const unitId = product.unitId;
  let warehouseId = product.defaultWarehouseId || null;
  if (!warehouseId) {
    const anyWarehouse = await prisma.warehouse.findFirst();
    warehouseId = anyWarehouse?.id || null;
  }

  // 3) 创建一张销售订单与一条明细
  const now = new Date();
  const orderNo = `SO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-001`;

  const quantity = 10; // 示例数量
  const price = 20;    // 示例单价（CNY）
  const amount = quantity * price;

  const order = await prisma.salesOrder.create({
    data: {
      orderNo,
      customerName: '示例客户',
      status: 'confirmed',
      orderDate: now,
      totalAmount: amount,
      currency: 'CNY',
      remark: '初始化示例订单（铰链）',
      createdBy: 'system',
      updatedBy: 'system',
      items: {
        create: [
          {
            productId: product.id,
            unitId,
            warehouseId: warehouseId ?? undefined,
            quantity,
            price,
            amount,
            remark: '示例订单明细',
          },
        ],
      },
    },
    include: {
      items: {
        include: { product: true, unit: true, warehouse: true },
      },
    },
  });

  console.log('✅ 销售订单创建成功：');
  console.log({
    id: order.id,
    orderNo: order.orderNo,
    customerName: order.customerName,
    status: order.status,
    totalAmount: order.totalAmount,
    itemCount: order.items.length,
    itemExample: {
      product: order.items[0]?.product?.name,
      unit: order.items[0]?.unit?.symbol,
      warehouse: order.items[0]?.warehouse?.name,
      quantity: order.items[0]?.quantity,
      price: order.items[0]?.price,
      amount: order.items[0]?.amount,
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ 初始化销售订单失败：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });