/**
 * 数据库数据导出脚本
 * 将当前数据库中的数据导出为种子文件格式
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ExportedData {
  permissions: any[];
  roles: any[];
  rolePermissions: any[];
  users: any[];
  departments: any[];
  productCategories: any[];
  units: any[];
  warehouses: any[];
}

async function exportData(): Promise<ExportedData> {
  console.log('📊 开始导出数据库数据...');

  // 导出权限数据
  const permissions = await prisma.permission.findMany({
    orderBy: { code: 'asc' }
  });
  console.log(`✅ 导出权限数据: ${permissions.length} 条`);

  // 导出角色数据
  const roles = await prisma.role.findMany({
    orderBy: { code: 'asc' }
  });
  console.log(`✅ 导出角色数据: ${roles.length} 条`);

  // 导出角色权限关联数据
  const rolePermissions = await prisma.rolePermission.findMany({
    include: {
      role: { select: { code: true } },
      permission: { select: { code: true } }
    },
    orderBy: [
      { role: { code: 'asc' } },
      { permission: { code: 'asc' } }
    ]
  });
  console.log(`✅ 导出角色权限关联数据: ${rolePermissions.length} 条`);

  // 导出用户数据
  const users = await prisma.user.findMany({
    include: {
      userRoles: {
        include: {
          role: { select: { code: true } }
        }
      },
      department: { select: { code: true } }
    },
    orderBy: { username: 'asc' }
  });
  console.log(`✅ 导出用户数据: ${users.length} 条`);

  // 导出部门数据
  const departments = await prisma.department.findMany({
    include: {
      parent: { select: { code: true } }
    },
    orderBy: { code: 'asc' }
  });
  console.log(`✅ 导出部门数据: ${departments.length} 条`);

  // 导出产品类目数据
  const productCategories = await prisma.productCategory.findMany({
    orderBy: { code: 'asc' }
  });
  console.log(`✅ 导出产品类别数据: ${productCategories.length} 条`);

  // 导出产品数据
  const products = await prisma.product.findMany({
    include: {
      category: { select: { code: true } }
    },
    orderBy: { code: 'asc' }
  });
  console.log(`✅ 导出产品数据: ${products.length} 条`);

  // 导出计量单位数据
  const units = await prisma.unit.findMany({
    orderBy: { name: 'asc' }
  });
  console.log(`✅ 导出计量单位数据: ${units.length} 条`);

  // 导出仓库数据
  const warehouses = await prisma.warehouse.findMany({
    orderBy: { code: 'asc' }
  });
  console.log(`✅ 导出仓库数据: ${warehouses.length} 条`);

  return {
    permissions,
    roles,
    rolePermissions,
    users,
    departments,
    productCategories,
    units,
    warehouses
  };
}

function generatePermissionCode(permission: any): string {
  return `    prisma.permission.upsert({
      where: { code: '${permission.code}' },
      update: {},
      create: {
        name: '${permission.name}',
        code: '${permission.code}',
        description: '${permission.description}',
        resource: '${permission.resource}',
        action: '${permission.action}',
      },
    }),`;
}

function generateRoleCode(role: any): string {
  return `    prisma.role.upsert({
      where: { code: '${role.code}' },
      update: {},
      create: {
        name: '${role.name}',
        code: '${role.code}',
        description: ${role.description ? `'${role.description}'` : 'null'},
      },
    }),`;
}

function generateUserCode(user: any): string {
  const roleAssignments = user.userRoles.map((ur: any) => `        { role: { connect: { code: '${ur.role.code}' } } }`).join(',\n');
  const departmentConnect = user.department ? `        department: { connect: { code: '${user.department.code}' } },` : '';
  
  return `    prisma.user.upsert({
      where: { email: '${user.email}' },
      update: {},
      create: {
        username: '${user.username}',
        email: '${user.email}',
        password: '${user.password}', // 已加密的密码
        phone: ${user.phone ? `'${user.phone}'` : 'null'},
        avatar: ${user.avatar ? `'${user.avatar}'` : 'null'},
        isActive: ${user.isActive},
        lastLoginAt: ${user.lastLoginAt ? `new Date('${user.lastLoginAt.toISOString()}')` : 'null'},
${departmentConnect}
        userRoles: {
          create: [
${roleAssignments}
          ],
        },
      },
    }),`;
}

function generateDepartmentCode(department: any): string {
  const parentConnect = department.parent ? `        parent: { connect: { code: '${department.parent.code}' } },` : '';
  
  return `    prisma.department.upsert({
      where: { code: '${department.code}' },
      update: {},
      create: {
        name: '${department.name}',
        code: '${department.code}',
        description: ${department.description ? `'${department.description}'` : 'null'},
        isActive: ${department.isActive},
${parentConnect}
      },
    }),`;
}

function generateProductCategoryCode(category: any): string {
  const parentConnect = category.parentCode ? `        parent: { connect: { code: '${category.parentCode}' } },` : '';
  
  return `    prisma.productCategory.upsert({
      where: { code: '${category.code}' },
      update: {},
      create: {
        name: '${category.name}',
        code: '${category.code}',
        description: ${category.description ? `'${category.description}'` : 'null'},
        sortOrder: ${category.sortOrder || 0},
        isActive: ${category.isActive},
        level: ${category.level || 1},
        path: ${category.path ? `'${category.path}'` : 'null'},
        createdBy: '${category.createdBy}',
        updatedBy: '${category.updatedBy}',
        version: ${category.version || 1},
${parentConnect}
      },
    }),`;
}

function generateUnitCode(unit: any): string {
  return `    prisma.unit.upsert({
      where: { name: '${unit.name}' },
      update: {},
      create: {
        name: '${unit.name}',
        symbol: '${unit.symbol}',
        category: '${unit.category}',
        baseUnitId: ${unit.baseUnitId ? `'${unit.baseUnitId}'` : 'null'},
        conversionRate: ${unit.conversionRate || 'null'},
        precision: ${unit.precision || 2},
        isActive: ${unit.isActive},
      },
    }),`;
}

function generateWarehouseCode(warehouse: any): string {
  return `    prisma.warehouse.upsert({
      where: { code: '${warehouse.code}' },
      update: {},
      create: {
        name: '${warehouse.name}',
        code: '${warehouse.code}',
        address: ${warehouse.address ? `'${warehouse.address}'` : 'null'},
        description: ${warehouse.description ? `'${warehouse.description}'` : 'null'},
        isActive: ${warehouse.isActive},
      },
    }),`;
}

function generateRolePermissionCode(rolePermissions: any[]): string {
  const assignments = rolePermissions.map(rp => 
    `    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: '${rp.role.code}' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: '${rp.permission.code}' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: '${rp.role.code}' } },
        permission: { connect: { code: '${rp.permission.code}' } },
      },
    }),`
  ).join('\n');
  
  return `  // 分配角色权限
  await Promise.all([
${assignments}
  ]);`;
}

async function generateSeedFile(data: ExportedData): Promise<string> {
  const template = `/**
 * 数据库种子数据
 * 自动生成于: ${new Date().toISOString()}
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据...');

  // 创建权限
  const permissions = await Promise.all([
${data.permissions.map(generatePermissionCode).join('\n')}
  ]);
  console.log('✅ 权限创建完成');

  // 创建角色
  const roles = await Promise.all([
${data.roles.map(generateRoleCode).join('\n')}
  ]);
  console.log('✅ 角色创建完成');

${generateRolePermissionCode(data.rolePermissions)}
  console.log('✅ 角色权限分配完成');

  // 创建部门
  const departments = await Promise.all([
${data.departments.map(generateDepartmentCode).join('\n')}
  ]);
  console.log('✅ 部门数据创建完成');

  // 创建用户
  const users = await Promise.all([
${data.users.map(generateUserCode).join('\n')}
  ]);
  console.log('✅ 用户创建完成');

  // 创建产品类别
  const productCategories = await Promise.all([
${data.productCategories.map(generateProductCategoryCode).join('\n')}
  ]);
  console.log('✅ 产品类别数据创建完成');

  // 创建计量单位
  const units = await Promise.all([
${data.units.map(generateUnitCode).join('\n')}
  ]);
  console.log('✅ 计量单位数据创建完成');

  // 创建仓库
  const warehouses = await Promise.all([
${data.warehouses.map(generateWarehouseCode).join('\n')}
  ]);
  console.log('✅ 仓库数据创建完成');

  console.log('🎉 所有数据播种完成！');

  // 输出默认账户信息
  console.log('\\n📋 默认账户信息：');
  const defaultUsers = await prisma.user.findMany({
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  defaultUsers.forEach(user => {
    console.log(\`👤 用户名: \${user.username}, 邮箱: \${user.email}, 角色: \${user.userRoles.map(ur => ur.role.name).join(', ')}\`);
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
`;

  return template;
}

async function main() {
  try {
    // 导出数据
    const data = await exportData();

    // 生成新的种子文件内容
    console.log('📝 生成种子文件...');
    const seedContent = await generateSeedFile(data);

    // 备份原种子文件
    const seedPath = path.join(__dirname, '../prisma/seed.ts');
    const backupPath = path.join(__dirname, '../prisma/seed.backup.ts');
    
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, backupPath);
      console.log('✅ 原种子文件已备份为 seed.backup.ts');
    }

    // 写入新的种子文件
    fs.writeFileSync(seedPath, seedContent, 'utf8');
    console.log('✅ 新种子文件已生成');

    console.log('🎉 数据导出完成！');
    console.log('💡 提示：');
    console.log('  - 原种子文件已备份为 seed.backup.ts');
    console.log('  - 新种子文件已生成，包含当前数据库中的所有数据');
    console.log('  - 可以运行 npm run db:seed 来测试新种子文件');

  } catch (error) {
    console.error('❌ 导出失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();