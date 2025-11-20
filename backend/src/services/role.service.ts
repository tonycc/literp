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
    if (!Array.isArray(data.permissions)) {
      throw new Error('Permissions must be an array')
    }

    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: data.name,
          description: data.description,
        },
      })

      if (data.permissions.length > 0) {
        const perms = await tx.permission.findMany({
          where: { code: { in: data.permissions } },
          select: { id: true },
        })
        if (perms.length > 0) {
          await tx.rolePermission.createMany({
            data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
          })
        }
      }

      return role
    })
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    if (data.permissions && !Array.isArray(data.permissions)) {
      throw new Error('Permissions must be an array')
    }

    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
        },
      })

      if (Array.isArray(data.permissions)) {
        const perms = await tx.permission.findMany({
          where: { code: { in: data.permissions } },
          select: { id: true },
        })
        const current = await tx.rolePermission.findMany({
          where: { roleId: id },
          select: { permissionId: true },
        })
        const currentSet = new Set(current.map((c) => c.permissionId))
        const targetSet = new Set(perms.map((p) => p.id))

        const toDelete = Array.from(currentSet).filter((pid) => !targetSet.has(pid))
        const toAdd = Array.from(targetSet).filter((pid) => !currentSet.has(pid))

        if (toDelete.length > 0) {
          await tx.rolePermission.deleteMany({ where: { roleId: id, permissionId: { in: toDelete } } })
        }
        if (toAdd.length > 0) {
          await tx.rolePermission.createMany({ data: toAdd.map((pid) => ({ roleId: id, permissionId: pid })) })
        }
      }

      return role
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
    const perm = await this.prisma.permission.findUnique({ where: { code: permission }, select: { id: true } })
    if (!perm) return false
    const rp = await this.prisma.rolePermission.findFirst({ where: { roleId, permissionId: perm.id }, select: { id: true } })
    return !!rp
  }
}
