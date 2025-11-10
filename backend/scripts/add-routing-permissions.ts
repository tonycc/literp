/**
 * 添加工艺路线管理相关权限的脚本
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addRoutingPermissions() {
  console.log('🌱 开始添加工艺路线管理相关权限...');

  // 创建工艺路线管理权限
  const routingPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: 'routing:create' },
      update: {},
      create: {
        name: '创建工艺路线',
        code: 'routing:create',
        description: '创建工艺路线',
        resource: 'routing',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'routing:delete' },
      update: {},
      create: {
        name: '删除工艺路线',
        code: 'routing:delete',
        description: '删除工艺路线',
        resource: 'routing',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'routing:read' },
      update: {},
      create: {
        name: '查看工艺路线',
        code: 'routing:read',
        description: '查看工艺路线',
        resource: 'routing',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'routing:update' },
      update: {},
      create: {
        name: '更新工艺路线',
        code: 'routing:update',
        description: '更新工艺路线',
        resource: 'routing',
        action: 'update',
      },
    }),
  ]);
  console.log('✅ 工艺路线管理权限创建完成');

  // 为管理员角色分配工艺路线管理权限
  const adminRole = await prisma.role.findUnique({ where: { code: 'admin' } });
  if (adminRole) {
    await Promise.all([
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'routing:create' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'routing:create' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'routing:delete' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'routing:delete' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'routing:read' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'routing:read' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'routing:update' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'routing:update' } },
        },
      }),
    ]);
    console.log('✅ 管理员角色权限分配完成');
  }

  console.log('🎉 工艺路线管理权限添加完成！');
}

addRoutingPermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });