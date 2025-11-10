/**
 * Role Service
 * Role management service
 */

import { PrismaClient, Role } from '@prisma/client'

export interface CreateRoleData {
  name: string
  description?: string
  permissions: string[]
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: string[]
}

export class RoleService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    })
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    // Validate permissions is an array
    if (!Array.isArray(data.permissions)) {
      throw new Error('Permissions must be an array')
    }

    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      },
    })
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    if (data.permissions && !Array.isArray(data.permissions)) {
      throw new Error('Permissions must be an array')
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      },
    })
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    })
  }

  /**
   * Check if role has specific permission
   */
  async hasPermission(roleId: string, permission: string): Promise<boolean> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { permissions: true },
    })

    if (!role) {
      return false
    }

    return role.permissions.includes(permission)
  }
}
