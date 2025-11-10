/**
 * 添加工作中心管理相关权限的脚本
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addWorkcenterPermissions() {
  console.log('🌱 开始添加工作中心管理相关权限...');

  // 创建工作中心管理权限
  const workcenterPermissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: 'workcenter:create' },
      update: {},
      create: {
        name: '创建工作中心',
        code: 'workcenter:create',
        description: '创建工作中心',
        resource: 'workcenter',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'workcenter:delete' },
      update: {},
      create: {
        name: '删除工作中心',
        code: 'workcenter:delete',
        description: '删除工作中心',
        resource: 'workcenter',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'workcenter:read' },
      update: {},
      create: {
        name: '查看工作中心',
        code: 'workcenter:read',
        description: '查看工作中心',
        resource: 'workcenter',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'workcenter:update' },
      update: {},
      create: {
        name: '更新工作中心',
        code: 'workcenter:update',
        description: '更新工作中心',
        resource: 'workcenter',
        action: 'update',
      },
    }),
  ]);
  console.log('✅ 工作中心管理权限创建完成');

  // 为管理员角色分配工作中心管理权限
  const adminRole = await prisma.role.findUnique({ where: { code: 'admin' } });
  if (adminRole) {
    await Promise.all([
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'workcenter:create' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'workcenter:create' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'workcenter:delete' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'workcenter:delete' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'workcenter:read' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'workcenter:read' } },
        },
      }),
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: (await prisma.permission.findUnique({ where: { code: 'workcenter:update' } }))!.id,
          }
        },
        update: {},
        create: {
          role: { connect: { code: 'admin' } },
          permission: { connect: { code: 'workcenter:update' } },
        },
      }),
    ]);
    console.log('✅ 管理员角色权限分配完成');
  }

  console.log('🎉 工作中心管理权限添加完成！');
}

addWorkcenterPermissions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });