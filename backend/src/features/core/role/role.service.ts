/**
 * 角色服务
 */

import type { Role, Permission } from '@zyerp/shared';
import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/middleware/error';

export interface CreateRoleData {
  name: string;
  code?: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleData {
  name?: string;
  code?: string;
  description?: string;
  permissionIds?: string[];
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoleListResponse {
  data: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class RoleService {
  /**
   * 获取角色列表
   */
  async getRoles(params: RoleListParams = {}): Promise<RoleListResponse> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } }
      ]
    } : {};

    // 构建排序条件
    const orderBy = { [sortBy]: sortOrder };

    // 查询角色列表
    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          rolePermissions: {
            include: {
              permission: true
            }
          },
          userRoles: true
        }
      }),
      prisma.role.count({ where })
    ]);

    // 格式化角色数据
    const formattedRoles = roles.map(role => this.formatRole(role));

    return {
      data: formattedRoles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 根据ID获取角色
   */
  async getRoleById(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return role ? this.formatRole(role) : null;
  }

  /**
   * 根据代码获取角色
   */
  async getRoleByCode(code: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { code },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    return role ? this.formatRole(role) : null;
  }

  /**
   * 创建角色
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    const { permissionIds = [], ...roleData } = data;

    // 如果没有提供code，生成一个基于name的默认code
    if (!roleData.code) {
      roleData.code = this.generateRoleCode(roleData.name);
    }

    // 检查角色代码是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { code: roleData.code }
    });

    if (existingRole) {
      throw new AppError('角色代码已存在', 409, 'ROLE_CODE_EXISTS');
    }

    // 创建角色
    const role = await prisma.role.create({
      data: roleData as { name: string; code: string; description?: string },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // 分配权限
    if (permissionIds.length > 0) {
      await this.assignPermissions(role.id, permissionIds);
    }

    // 重新获取角色数据（包含权限）
    const roleWithPermissions = await this.getRoleById(role.id);
    return roleWithPermissions!;
  }

  /**
   * 生成角色代码
   */
  private generateRoleCode(name: string): string {
    // 首先尝试使用拼音转换或简单的英文转换
    let code = name
      .trim()
      .replace(/\s+/g, '_') // 空格转下划线
      .replace(/[^\w\u4e00-\u9fa5]/g, '') // 保留字母、数字、下划线和中文字符
      .toUpperCase();

    // 如果生成的代码为空或只包含下划线，使用时间戳作为后缀
    if (!code || /^_*$/.test(code)) {
      code = 'ROLE_' + Date.now();
    }

    // 如果代码只包含中文字符，添加前缀
    if (/^[\u4e00-\u9fa5_]+$/.test(code)) {
      code = 'ROLE_' + code;
    }

    return code;
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    const { permissionIds, ...roleData } = data;

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      throw new AppError('角色不存在', 404, 'ROLE_NOT_FOUND');
    }

    // 如果更新代码，检查是否与其他角色冲突
    if (data.code && data.code !== existingRole.code) {
      const codeExists = await prisma.role.findUnique({
        where: { code: data.code }
      });

      if (codeExists) {
        throw new AppError('角色代码已存在', 409, 'ROLE_CODE_EXISTS');
      }
    }

    // 更新角色基本信息
    await prisma.role.update({
      where: { id },
      data: roleData
    });

    // 更新权限分配
    if (permissionIds !== undefined) {
      await this.assignPermissions(id, permissionIds);
    }

    // 返回更新后的角色
    const updatedRole = await this.getRoleById(id);
    return updatedRole!;
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string): Promise<void> {
    // 检查角色是否存在
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true
      }
    });

    if (!role) {
      throw new AppError('角色不存在', 404, 'ROLE_NOT_FOUND');
    }

    // 检查是否有用户使用此角色
    if (role.userRoles.length > 0) {
      throw new AppError('无法删除已分配给用户的角色', 400, 'ROLE_IN_USE');
    }

    // 删除角色（级联删除角色权限关联）
    await prisma.role.delete({
      where: { id }
    });
  }

  /**
   * 为角色分配权限
   */
  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    // 删除现有权限分配
    await prisma.rolePermission.deleteMany({
      where: { roleId }
    });

    // 创建新的权限分配
    if (permissionIds.length > 0) {
      // 去重权限ID，避免重复分配导致唯一约束冲突
      const uniquePermissionIds = [...new Set(permissionIds)];
      
      // 验证权限ID是否存在
      const existingPermissions = await prisma.permission.findMany({
        where: {
          id: {
            in: uniquePermissionIds
          }
        },
        select: { id: true }
      });

      const existingPermissionIds = existingPermissions.map(p => p.id);
      const invalidPermissionIds = uniquePermissionIds.filter(id => !existingPermissionIds.includes(id));

      if (invalidPermissionIds.length > 0) {
        throw new AppError(
          `无效的权限ID: ${invalidPermissionIds.join(', ')}`, 
          400, 
          'INVALID_PERMISSION_IDS'
        );
      }

      const rolePermissions = uniquePermissionIds.map(permissionId => ({
        roleId,
        permissionId
      }));

      await prisma.rolePermission.createMany({
        data: rolePermissions
      });
    }

    // 返回更新后的角色
    const updatedRole = await this.getRoleById(roleId);
    if (!updatedRole) {
      throw new AppError('Role not found after permission assignment', 404, 'ROLE_NOT_FOUND');
    }
    
    return updatedRole;
  }

  /**
   * 获取角色的权限列表
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true
      }
    });

    return rolePermissions.map(rp => ({
      id: rp.permission.id,
      name: rp.permission.name,
      code: rp.permission.code,
      description: rp.permission.description || undefined,
      resource: rp.permission.resource,
      action: rp.permission.action
    }));
  }

  /**
   * 格式化角色数据
   */
  private formatRole(role: any): Role {
    return {
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description || undefined,
      permissions: role.rolePermissions?.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        code: rp.permission.code,
        description: rp.permission.description || undefined,
        resource: rp.permission.resource,
        action: rp.permission.action
      })) || [],
      userCount: role.userRoles?.length || 0,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString()
    };
  }
}

export const roleService = new RoleService();