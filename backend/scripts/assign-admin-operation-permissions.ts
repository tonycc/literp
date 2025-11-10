/**
 * 为管理员分配工序权限脚本
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignOperationPermissionsToAdmin() {
  console.log('🔧 为管理员分配工序权限...');

  try {
    // 获取管理员角色
    const adminRole = await prisma.role.findUnique({
      where: { code: 'admin' },
      include: { rolePermissions: { include: { permission: true } } }
    });

    if (!adminRole) {
      console.log('❌ 未找到管理员角色');
      return;
    }

    // 检查是否已经有工序权限
    const existingOperationPermissions = adminRole.rolePermissions.filter(rp => 
      rp.permission.resource === 'operation'
    );

    if (existingOperationPermissions.length > 0) {
      console.log('✅ 管理员角色已拥有工序权限');
      console.log('📋 现有工序权限:', existingOperationPermissions.map(rp => rp.permission.code).join(', '));
      return;
    }

    // 获取所有工序权限
    const operationPermissions = await prisma.permission.findMany({
      where: {
        resource: 'operation'
      }
    });

    if (operationPermissions.length === 0) {
      console.log('❌ 未找到工序相关权限');
      return;
    }

    console.log(`📋 找到 ${operationPermissions.length} 个工序权限`);
    operationPermissions.forEach(p => {
      console.log(`  - ${p.code}: ${p.name}`);
    });

    // 为管理员分配这些权限
    const assignments = await Promise.all(
      operationPermissions.map(permission => 
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: permission.id,
            }
          },
          update: {},
          create: {
            role: { connect: { code: 'admin' } },
            permission: { connect: { id: permission.id } },
          },
        })
      )
    );

    console.log(`✅ 为管理员角色分配了 ${assignments.length} 个工序权限`);

    // 验证权限分配
    const updatedAdminRole = await prisma.role.findUnique({
      where: { code: 'admin' },
      include: { rolePermissions: { include: { permission: true } } }
    });

    const updatedOperationPermissions = updatedAdminRole!.rolePermissions.filter(rp => 
      rp.permission.resource === 'operation'
    );

    console.log('📋 管理员角色的工序权限:', updatedOperationPermissions.map(rp => rp.permission.code).join(', '));

  } catch (error) {
    console.error('❌ 分配权限失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignOperationPermissionsToAdmin();