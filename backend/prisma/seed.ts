/**
 * 数据库种子数据
 * 自动生成于: 2025-10-31T07:24:41.794Z
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据...');

  // 创建权限
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { code: 'dashboard:read' },
      update: {},
      create: {
        name: '查看仪表板',
        code: 'dashboard:read',
        description: '查看仪表板',
        resource: 'dashboard',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'department:create' },
      update: {},
      create: {
        name: '创建部门',
        code: 'department:create',
        description: '创建部门',
        resource: 'department',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'department:delete' },
      update: {},
      create: {
        name: '删除部门',
        code: 'department:delete',
        description: '删除部门',
        resource: 'department',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'department:read' },
      update: {},
      create: {
        name: '查看部门',
        code: 'department:read',
        description: '查看部门',
        resource: 'department',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'department:update' },
      update: {},
      create: {
        name: '更新部门',
        code: 'department:update',
        description: '更新部门',
        resource: 'department',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'permission:create' },
      update: {},
      create: {
        name: '创建权限',
        code: 'permission:create',
        description: '创建权限',
        resource: 'permission',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'permission:delete' },
      update: {},
      create: {
        name: '删除权限',
        code: 'permission:delete',
        description: '删除权限',
        resource: 'permission',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'permission:read' },
      update: {},
      create: {
        name: '查看权限',
        code: 'permission:read',
        description: '查看权限',
        resource: 'permission',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'permission:update' },
      update: {},
      create: {
        name: '更新权限',
        code: 'permission:update',
        description: '更新权限',
        resource: 'permission',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'product_category:create' },
      update: {},
      create: {
        name: '创建产品类别',
        code: 'product_category:create',
        description: '创建产品类别',
        resource: 'product_category',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'product_category:delete' },
      update: {},
      create: {
        name: '删除产品类别',
        code: 'product_category:delete',
        description: '删除产品类别',
        resource: 'product_category',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'product_category:read' },
      update: {},
      create: {
        name: '查看产品类别',
        code: 'product_category:read',
        description: '查看产品类别',
        resource: 'product_category',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'product_category:update' },
      update: {},
      create: {
        name: '更新产品类别',
        code: 'product_category:update',
        description: '更新产品类别',
        resource: 'product_category',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'role:create' },
      update: {},
      create: {
        name: '创建角色',
        code: 'role:create',
        description: '创建角色',
        resource: 'role',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'role:delete' },
      update: {},
      create: {
        name: '删除角色',
        code: 'role:delete',
        description: '删除角色',
        resource: 'role',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'role:read' },
      update: {},
      create: {
        name: '查看角色',
        code: 'role:read',
        description: '查看角色',
        resource: 'role',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'role:update' },
      update: {},
      create: {
        name: '更新角色',
        code: 'role:update',
        description: '更新角色',
        resource: 'role',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'system:admin' },
      update: {},
      create: {
        name: '系统管理',
        code: 'system:admin',
        description: '系统管理',
        resource: 'system',
        action: 'admin',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'user:create' },
      update: {},
      create: {
        name: '创建用户',
        code: 'user:create',
        description: '创建用户',
        resource: 'user',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'user:delete' },
      update: {},
      create: {
        name: '删除用户',
        code: 'user:delete',
        description: '删除用户',
        resource: 'user',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'user:read' },
      update: {},
      create: {
        name: '查看用户',
        code: 'user:read',
        description: '查看用户',
        resource: 'user',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { code: 'user:update' },
      update: {},
      create: {
        name: '更新用户',
        code: 'user:update',
        description: '更新用户',
        resource: 'user',
        action: 'update',
      },
    }),
  ]);
  console.log('✅ 权限创建完成');

  // 创建角色
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { code: 'admin' },
      update: {},
      create: {
        name: '系统管理员',
        code: 'admin',
        description: '拥有系统所有权限的超级管理员',
      },
    }),
    prisma.role.upsert({
      where: { code: 'dept_manager' },
      update: {},
      create: {
        name: '部门管理员',
        code: 'dept_manager',
        description: '负责部门管理和部门内用户管理',
      },
    }),
    prisma.role.upsert({
      where: { code: 'hr_manager' },
      update: {},
      create: {
        name: 'HR管理员',
        code: 'hr_manager',
        description: '负责人力资源管理，包括用户、部门管理',
      },
    }),
    prisma.role.upsert({
      where: { code: 'user' },
      update: {},
      create: {
        name: '普通用户',
        code: 'user',
        description: '普通员工，只能查看基础信息',
      },
    }),
  ]);
  console.log('✅ 角色创建完成');

  // 分配角色权限
  await Promise.all([
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'dashboard:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'dashboard:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:create' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'department:create' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:delete' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'department:delete' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'department:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'department:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'permission:create' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'permission:create' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'permission:delete' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'permission:delete' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'permission:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'permission:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'permission:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'permission:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'product_category:create' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'product_category:create' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'product_category:delete' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'product_category:delete' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'product_category:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'product_category:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'product_category:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'product_category:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'role:create' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'role:create' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'role:delete' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'role:delete' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'role:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'role:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'role:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'role:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'system:admin' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'system:admin' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:create' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'user:create' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:delete' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'user:delete' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'user:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'admin' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'admin' } },
        permission: { connect: { code: 'user:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'dept_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'dashboard:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'dept_manager' } },
        permission: { connect: { code: 'dashboard:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'dept_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'dept_manager' } },
        permission: { connect: { code: 'department:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'dept_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'dept_manager' } },
        permission: { connect: { code: 'department:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'dept_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'dept_manager' } },
        permission: { connect: { code: 'user:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'dashboard:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'dashboard:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:create' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'department:create' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:delete' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'department:delete' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'department:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'department:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'department:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'role:create' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'role:create' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'role:delete' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'role:delete' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'role:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'role:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'role:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'role:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:create' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'user:create' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:delete' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'user:delete' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'user:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'hr_manager' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:update' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'hr_manager' } },
        permission: { connect: { code: 'user:update' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'user' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'dashboard:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'user' } },
        permission: { connect: { code: 'dashboard:read' } },
      },
    }),
    prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: (await prisma.role.findUnique({ where: { code: 'user' } }))!.id,
          permissionId: (await prisma.permission.findUnique({ where: { code: 'user:read' } }))!.id,
        }
      },
      update: {},
      create: {
        role: { connect: { code: 'user' } },
        permission: { connect: { code: 'user:read' } },
      },
    }),
  ]);
  console.log('✅ 角色权限分配完成');

  // 创建部门
  // 1. 创建顶级部门
  await Promise.all([
    prisma.department.upsert({
      where: { code: 'CEO' },
      update: {},
      create: {
        name: '总经理办公室',
        code: 'CEO',
        description: '公司最高管理层',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { code: 'FINANCE' },
      update: {},
      create: {
        name: '财务部',
        code: 'FINANCE',
        description: '负责财务管理和会计核算',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { code: 'HR' },
      update: {},
      create: {
        name: '人事部',
        code: 'HR',
        description: '负责人力资源管理',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { code: 'MARKET' },
      update: {},
      create: {
        name: '市场部',
        code: 'MARKET',
        description: '负责市场推广和销售',
        isActive: true,
      },
    }),
    prisma.department.upsert({
      where: { code: 'TECH' },
      update: {},
      create: {
        name: '技术部',
        code: 'TECH',
        description: '负责技术研发和产品开发',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ 顶级部门创建完成');

  // 2. 创建子部门
  await Promise.all([
    prisma.department.upsert({
      where: { code: 'TECH_BE' },
      update: {},
      create: {
        name: '后端开发组',
        code: 'TECH_BE',
        description: '负责后端服务开发',
        isActive: true,
        parent: { connect: { code: 'TECH' } },
      },
    }),
    prisma.department.upsert({
      where: { code: 'TECH_FE' },
      update: {},
      create: {
        name: '前端开发组',
        code: 'TECH_FE',
        description: '负责前端界面开发',
        isActive: true,
        parent: { connect: { code: 'TECH' } },
      },
    }),
    prisma.department.upsert({
      where: { code: 'TECH_QA' },
      update: {},
      create: {
        name: '测试组',
        code: 'TECH_QA',
        description: '负责产品质量保证',
        isActive: true,
        parent: { connect: { code: 'TECH' } },
      },
    }),
  ]);
  console.log('✅ 子部门创建完成');

  console.log('✅ 部门数据创建完成');

  // 创建用户
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@zyerp.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@zyerp.com',
        password: '$2a$12$D5QzXzPr7QRmrWC66cEZcOh/NrG1rAGiN76DLCcAZ45kjhwMsn63a', // 已加密的密码
        phone: null,
        avatar: null,
        isActive: true,
        lastLoginAt: null,

        userRoles: {
          create: [
        { role: { connect: { code: 'admin' } } }
          ],
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'deptmanager@zyerp.com' },
      update: {},
      create: {
        username: 'deptmanager',
        email: 'deptmanager@zyerp.com',
        password: '$2a$12$biUiWKpVVDZ3atEwBPteA.zNo0V6s8yOxGUanFWXapcd/gf6dG7IO', // 已加密的密码
        phone: null,
        avatar: null,
        isActive: true,
        lastLoginAt: null,

        userRoles: {
          create: [
        { role: { connect: { code: 'dept_manager' } } }
          ],
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'test@zyerp.com' },
      update: {},
      create: {
        username: 'testuser',
        email: 'test@zyerp.com',
        password: '$2a$12$G0B6RpJVtXGnDeQ0zf2eN.LlITkWoRC9PmxZTWco7.31t5wqUgFvO', // 已加密的密码
        phone: null,
        avatar: null,
        isActive: true,
        lastLoginAt: null,

        userRoles: {
          create: [
        { role: { connect: { code: 'user' } } }
          ],
        },
      },
    }),
  ]);
  console.log('✅ 用户创建完成');

  // 创建产品类别
  const productCategories = await Promise.all([
    prisma.productCategory.upsert({
      where: { code: 'CAT001' },
      update: {},
      create: {
        name: '配件',
        code: 'CAT001',
        description: '产品配件',
        sortOrder: 1,
        isActive: true,
        level: 1,
        path: 'CAT001',
        createdBy: 'cmheh6r9h0024ydim4269eyky',
        updatedBy: 'cmheh6r9h0024ydim4269eyky',
        version: 1,

      },
    }),
    prisma.productCategory.upsert({
      where: { code: 'CAT002' },
      update: {},
      create: {
        name: '包装材料',
        code: 'CAT002',
        description: '产品包装材料',
        sortOrder: 1,
        isActive: true,
        level: 1,
        path: 'CAT002',
        createdBy: 'cmheh6r9h0024ydim4269eyky',
        updatedBy: 'cmheh6r9h0024ydim4269eyky',
        version: 1,

      },
    }),
    prisma.productCategory.upsert({
      where: { code: 'CAT003' },
      update: {},
      create: {
        name: '电镀半成品',
        code: 'CAT003',
        description: '电镀半成品',
        sortOrder: 1,
        isActive: true,
        level: 1,
        path: 'CAT003',
        createdBy: 'cmheh6r9h0024ydim4269eyky',
        updatedBy: 'cmheh6r9h0024ydim4269eyky',
        version: 1,

      },
    }),
    prisma.productCategory.upsert({
      where: { code: 'CAT004' },
      update: {},
      create: {
        name: '铰链',
        code: 'CAT004',
        description: '铰链成品',
        sortOrder: 1,
        isActive: true,
        level: 1,
        path: 'CAT004',
        createdBy: 'cmheh6r9h0024ydim4269eyky',
        updatedBy: 'cmheh6r9h0024ydim4269eyky',
        version: 1,

      },
    }),
  ]);
  console.log('✅ 产品类别数据创建完成');

  // 创建计量单位
  const unitsData = [
    {
      name: '个',
      symbol: 'pcs',
      category: '数量',
      baseUnitId: null,
      conversionRate: null,
      precision: 2,
      isActive: true,
    },
    // 在这里添加更多单位
  ];

  console.log('Creating units...');
  const unitPromises = unitsData.map((unit) =>
    prisma.unit.upsert({
      where: { name: unit.name },
      update: {},
      create: unit,
    }),
  );
  await Promise.all(unitPromises);
  console.log('Units created successfully.');

  // 创建仓库
  const warehouses = await Promise.all([
    prisma.warehouse.upsert({
      where: { code: 'WH001' },
      update: {},
      create: {
        name: '主仓库',
        code: 'WH001',
        type: 'default',
        address: '北京市朝阳区工业园区1号',
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { code: 'WH002' },
      update: {},
      create: {
        name: '原料仓库',
        code: 'WH002',
        type: 'default',
        address: '北京市朝阳区工业园区2号',
        isActive: true,
      },
    }),
    prisma.warehouse.upsert({
      where: { code: 'WH003' },
      update: {},
      create: {
        name: '半成品仓库',
        code: 'WH003',
        type: 'default',
        address: '北京市朝阳区工业园区3号',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ 仓库数据创建完成');

  console.log('🎉 所有数据播种完成！');

  // 输出默认账户信息
  console.log('\n📋 默认账户信息：');
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
    console.log(`👤 用户名: ${user.username}, 邮箱: ${user.email}, 角色: ${user.userRoles.map(ur => ur.role.name).join(', ')}`);
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
