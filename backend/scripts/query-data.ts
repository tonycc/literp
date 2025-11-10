import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 查询产品类别数据...');
  const categories = await prisma.productCategory.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
  console.log('产品类别:', categories);

  console.log('\n📊 查询计量单位数据...');
  const units = await prisma.unit.findMany({
    select: {
      id: true,
      name: true,
      symbol: true,
    },
  });
  console.log('计量单位:', units);

  console.log('\n📊 查询仓库数据...');
  const warehouses = await prisma.warehouse.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
  });
  console.log('仓库:', warehouses);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });