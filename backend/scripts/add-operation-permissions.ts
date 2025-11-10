/**
 * 添加工序管理相关权限的脚本
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addOperationPermissions() {
  console.log('🌱 开始添加工序管理相关权限...');

  // 创建工序管理权限
  const operationPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: 'operation:create' },
      update: {},
      create: {
        name: '创建工序',
        code: 'operation:create',
        description: '创建工序',
        resource: 'operation',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'operation:delete' },
      update: {},
      create: {
        name: '删除工序',
        code: 'operation:delete',
        description: '删除工序',
        resource: 'operation',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'operation:read' },
      update: {},
      create: {
        name: '查看工序',
        code: 'operation:read',
        description: '查看工序',
        resource: 'operation',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'operation:update' },
      update: {},
      create: {
        name: '更新工序',
        code: 'operation:update',
        description: '更新工序',
        resource: 'operation',
        action: 'update',
      },
    }),
  ]);
  console.log('✅ 工序管理权限创建完成');

  // 为管理员角色分配工序管理权限
  const adminRole = await prisma.role.findUnique({ where: { code: 'admin' } });
  if (adminRole) {
    await Promise.all([
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'operation:create' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'operation:create' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'operation:delete' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'operation:delete' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'operation:read' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'operation:read' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'operation:update' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'operation:update' } },
        },
      }),
    ]);
    console.log('✅ 管理员角色权限分配完成');
  }

  console.log('🎉 工序管理权限添加完成！');
}

addOperationPermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });