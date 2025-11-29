/**
 * 用户服务
 */

import bcrypt from 'bcryptjs';
import type { User } from '@zyerp/shared';
import type { Prisma } from '@prisma/client';
import { AppError } from '../../../shared/middleware/error';
import { BaseService } from '../../../shared/services/base.service';

type DbUser = Prisma.UserGetPayload<{
  include: {
    userRoles: {
      include: {
        role: {
          include: {
            rolePermissions: { include: { permission: true } }
          }
        }
      }
    };
    userDepartments: { include: { department: true } };
  };
}>;

export class UserService extends BaseService {
  /**
   * 创建用户
   */
  async createUser(data: {
    username: string;
    email: string;
    password: string;
    roleIds?: string[];
    departmentId?: string;
  }): Promise<User> {
    const { username, email, password, roleIds = [], departmentId } = data;

    // 检查用户是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      throw new AppError('User already exists', 409, 'USER_EXISTS');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        userRoles: {
          create: roleIds.map(roleId => ({
            roleId
          }))
        },
        ...(departmentId && {
          userDepartments: {
            create: {
              departmentId,
              position: 'employee',
              isMain: true
            }
          }
        })
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userDepartments: {
          include: {
            department: true
          }
        }
      }
    });

    return this.formatUser(user as DbUser);
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userDepartments: {
          include: {
            department: true
          }
        }
      }
    });

    return user ? this.formatUser(user as DbUser) : null;
  }

  /**
   * 根据用户名获取用户
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userDepartments: {
          include: {
            department: true
          }
        }
      }
    });

    return user ? this.formatUser(user as DbUser) : null;
  }

  /**
   * 根据邮箱获取用户
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userDepartments: {
          include: {
            department: true
          }
        }
      }
    });

    return user ? this.formatUser(user as DbUser) : null;
  }

  /**
   * 根据手机号获取用户
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { phone },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userDepartments: {
          include: {
            department: true
          }
        }
      }
    });

    return user ? this.formatUser(user as DbUser) : null;
  }

  /**
   * 验证密码
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: String(user.id) },
      select: { password: true }
    });

    if (!dbUser) {
      return false;
    }

    return bcrypt.compare(password, dbUser.password);
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, data: Partial<{
    username: string;
    email: string;
    password: string;
    isActive: boolean;
    departmentId: string;
    roleIds: string[];
  }>): Promise<User> {
    const { departmentId, ...updateData } = data;

    const prismaData: Prisma.UserUpdateInput = {};
    if (typeof updateData.username === 'string') prismaData.username = updateData.username;
    if (typeof updateData.email === 'string') prismaData.email = updateData.email;
    if (typeof updateData.isActive === 'boolean') prismaData.isActive = updateData.isActive;
    if (typeof updateData.password === 'string' && updateData.password.length > 0) {
      prismaData.password = await bcrypt.hash(updateData.password, 12);
    }

    if (departmentId) {
      await this.prisma.userDepartment.deleteMany({ where: { userId: id, isMain: true } });
      await this.prisma.userDepartment.create({
        data: { userId: id, departmentId, position: 'employee', isMain: true }
      });
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...prismaData,
        ...(Array.isArray(data.roleIds)
          ? {
              userRoles: {
                deleteMany: {},
                create: data.roleIds.map((roleId) => ({ roleId })),
              },
            }
          : {}),
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userDepartments: {
          include: {
            department: true
          }
        }
      }
    });

    return this.formatUser(user as DbUser);
  }

  /**
   * 获取用户列表（分页）
   */
  async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    const skip = (page - 1) * limit;
    
    // 构建查询条件
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    
    // 构建排序条件
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    orderBy[sortBy] = sortOrder;
    
    // 获取总数
    const total = await this.prisma.user.count({ where });
    
    // 获取用户列表
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userDepartments: {
          include: {
            department: true
          }
        }
      }
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: users.map(user => this.formatUser(user as DbUser)),
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id }
    });
  }

  /**
   * 格式化用户数据
   */
  private formatUser(user: DbUser): User {
    const roles = user.userRoles?.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      code: ur.role.code ?? '',
      description: ur.role.description ?? undefined,
      permissions: ur.role.rolePermissions?.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        code: rp.permission.code,
        description: rp.permission.description ?? undefined,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })) || [],
      createdAt: ur.role.createdAt,
      updatedAt: ur.role.updatedAt,
    })) || [];

    const mainDepartment = user.userDepartments?.find((ud) => ud.isMain)?.department;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      roles,
      mainDepartment: mainDepartment ? {
        id: mainDepartment.id,
        name: mainDepartment.name,
        code: mainDepartment.code ?? undefined,
        description: mainDepartment.description ?? undefined,
        parentId: mainDepartment.parentId ?? undefined,
        managerId: mainDepartment.managerId ?? undefined,
        level: mainDepartment.level,
        sort: mainDepartment.sort,
        isActive: mainDepartment.isActive,
        createdAt: mainDepartment.createdAt,
        updatedAt: mainDepartment.updatedAt,
      } : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();
