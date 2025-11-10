/**
 * 权限服务
 */

import { PrismaClient } from '@prisma/client';
import { Permission } from '@zyerp/shared';

const prisma = new PrismaClient();

export interface CreatePermissionData {
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
}

export interface UpdatePermissionData {
  name?: string;
  code?: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface PermissionListParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: string;
  action?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PermissionListResponse {
  data: Permission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PermissionService {
  /**
   * 获取权限列表
   */
  async getPermissions(params: PermissionListParams = {}): Promise<PermissionListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      resource,
      action,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (resource) {
      where.resource = { contains: resource, mode: 'insensitive' };
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    // 获取总数
    const total = await prisma.permission.count({ where });

    // 获取权限列表
    const permissions = await prisma.permission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: permissions.map(permission => this.formatPermission(permission)),
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * 根据ID获取权限
   */
  async getPermissionById(id: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: { id }
    });

    return permission ? this.formatPermission(permission) : null;
  }

  /**
   * 根据代码获取权限
   */
  async getPermissionByCode(code: string): Promise<Permission | null> {
    const permission = await prisma.permission.findUnique({
      where: { code }
    });

    return permission ? this.formatPermission(permission) : null;
  }

  /**
   * 创建权限
   */
  async createPermission(data: CreatePermissionData): Promise<Permission> {
    const permission = await prisma.permission.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        resource: data.resource,
        action: data.action
      }
    });

    return this.formatPermission(permission);
  }

  /**
   * 更新权限
   */
  async updatePermission(id: string, data: UpdatePermissionData): Promise<Permission> {
    const permission = await prisma.permission.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.resource && { resource: data.resource }),
        ...(data.action && { action: data.action }),
        updatedAt: new Date()
      }
    });

    return this.formatPermission(permission);
  }

  /**
   * 删除权限
   */
  async deletePermission(id: string): Promise<void> {
    // 先删除角色权限关联
    await prisma.rolePermission.deleteMany({
      where: { permissionId: id }
    });

    // 删除权限
    await prisma.permission.delete({
      where: { id }
    });
  }

  /**
   * 获取所有权限（用于角色分配）
   */
  async getAllPermissions(): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    return permissions.map(permission => this.formatPermission(permission));
  }

  /**
   * 根据资源获取权限
   */
  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    const permissions = await prisma.permission.findMany({
      where: { resource },
      orderBy: { action: 'asc' }
    });

    return permissions.map(permission => this.formatPermission(permission));
  }

  /**
   * 格式化权限数据
   */
  private formatPermission(permission: any): Permission {
    return {
      id: permission.id,
      name: permission.name,
      code: permission.code,
      description: permission.description || undefined,
      resource: permission.resource,
      action: permission.action
    };
  }
}

export const permissionService = new PermissionService();