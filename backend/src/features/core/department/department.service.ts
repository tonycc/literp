/**
 * 部门服务
 */

import type { 
  Department, 
  DepartmentTreeNode,
  DepartmentStats,
  DepartmentPosition,
  AssignUserToDepartmentData,
  UpdateUserDepartmentData,
  DepartmentMember,
  DepartmentMemberListParams,
  DepartmentMemberListResponse,
  ID
} from '@zyerp/shared';

export interface CreateDepartmentData {
  name: string;
  code?: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  sort?: number;
  isActive?: boolean;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  sort?: number;
  isActive?: boolean;
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartmentListResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/middleware/error';

export class DepartmentService {
  /**
   * 获取部门列表
   */
  async getDepartments(params: DepartmentListParams = {}): Promise<DepartmentListResponse> {
    const {
      page = 1,
      limit = 10,
      search = '',
      parentId,
      isActive,
      sortBy = 'sort',
      sortOrder = 'asc'
    } = params;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 构建排序条件
    const orderBy = { [sortBy]: sortOrder };

    // 查询部门列表
    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          parent: {
            select: { id: true, name: true }
          },
          manager: {
            select: { id: true, username: true, email: true }
          },
          children: {
            select: { id: true }
          },
          users: {
            select: { id: true }
          },
          userDepartments: {
            select: { id: true }
          }
        }
      }),
      prisma.department.count({ where })
    ]);

    // 格式化部门数据
    const formattedDepartments = departments.map(dept => this.formatDepartment(dept));

    return {
      data: formattedDepartments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 获取部门树形结构
   */
  async getDepartmentTree(): Promise<DepartmentTreeNode[]> {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { sort: 'asc' },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        manager: {
          select: { id: true, username: true, email: true }
        },
        children: {
          select: { id: true }
        },
        users: {
          select: { id: true }
        },
        userDepartments: {
          select: { id: true }
        }
      }
    });

    return this.buildDepartmentTree(departments);
  }

  /**
   * 根据ID获取部门详情
   */
  async getDepartmentById(id: string | number): Promise<Department | null> {
    const department = await prisma.department.findUnique({
      where: { id: String(id) },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        manager: {
          select: { id: true, username: true, email: true }
        },
        children: {
          select: { id: true, name: true }
        },
        users: {
          select: { id: true, username: true, email: true }
        },
        userDepartments: {
          select: { id: true }
        }
      }
    });

    return department ? this.formatDepartment(department) : null;
  }

  /**
   * 根据编码获取部门
   */
  async getDepartmentByCode(code: string): Promise<Department | null> {
    const department = await prisma.department.findUnique({
      where: { code },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        manager: {
          select: { id: true, username: true, email: true }
        },
        children: {
          select: { id: true }
        },
        users: {
          select: { id: true }
        }
      }
    });

    return department ? this.formatDepartment(department) : null;
  }

  /**
   * 创建部门
   */
  async createDepartment(data: CreateDepartmentData): Promise<Department> {
    const { name, code, description, parentId, managerId, sort = 0, isActive = true } = data;

    // 检查部门编码是否已存在
    if (code) {
      const existingDept = await this.getDepartmentByCode(code);
      if (existingDept) {
        throw new AppError('Department code already exists', 409, 'DEPARTMENT_CODE_EXISTS');
      }
    }

    // 检查上级部门是否存在
    if (parentId) {
      const parentDept = await this.getDepartmentById(parentId);
      if (!parentDept) {
        throw new AppError('Parent department not found', 404, 'PARENT_DEPARTMENT_NOT_FOUND');
      }
    }

    // 检查负责人是否存在
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: String(managerId) }
      });
      if (!manager) {
        throw new AppError('Manager not found', 404, 'MANAGER_NOT_FOUND');
      }
    }

    // 计算部门层级
    const level = await this.calculateDepartmentLevel(parentId ? String(parentId) : null);

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        parentId: parentId ? String(parentId) : null,
        managerId: managerId ? String(managerId) : null,
        level,
        sort: sort || 0,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        manager: {
          select: { id: true, username: true, email: true }
        },
        children: {
          select: { id: true }
        },
        users: {
          select: { id: true }
        }
      }
    });

    return this.formatDepartment(department);
  }

  /**
   * 更新部门
   */
  async updateDepartment(id: string, data: UpdateDepartmentData): Promise<Department> {
    const { name, code, description, parentId, managerId, sort, isActive } = data;

    // 检查部门是否存在
    const existingDept = await this.getDepartmentById(id);
    if (!existingDept) {
      throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }

    // 检查部门编码冲突
    if (code && code !== existingDept.code) {
      const codeConflict = await this.getDepartmentByCode(code);
      if (codeConflict) {
        throw new AppError('Department code already exists', 409, 'DEPARTMENT_CODE_EXISTS');
      }
    }

    // 检查上级部门
    if (parentId !== undefined) {
      if (parentId === id) {
        throw new AppError('Department cannot be its own parent', 400, 'INVALID_PARENT');
      }
      
      if (parentId) {
        const parentDept = await this.getDepartmentById(parentId);
        if (!parentDept) {
          throw new AppError('Parent department not found', 404, 'PARENT_DEPARTMENT_NOT_FOUND');
        }
        
        // 检查是否会形成循环依赖
        const isCircular = await this.checkCircularDependency(id, String(parentId));
        if (isCircular) {
          throw new AppError('Circular dependency detected', 400, 'CIRCULAR_DEPENDENCY');
        }
      }
    }

    // 检查负责人
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: String(managerId) }
      });
      if (!manager) {
        throw new AppError('Manager not found', 404, 'MANAGER_NOT_FOUND');
      }
    }

    // 计算新的层级（如果上级部门发生变化）
    let newLevel: number | undefined;
    if (parentId !== undefined) {
      newLevel = await this.calculateDepartmentLevel(parentId ? String(parentId) : null);
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId: parentId ? String(parentId) : null }),
        ...(managerId !== undefined && { managerId: managerId ? String(managerId) : null }),
        ...(newLevel !== undefined && { level: newLevel }),
        ...(sort !== undefined && { sort }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      },
      include: {
        parent: {
          select: { id: true, name: true }
        },
        manager: {
          select: { id: true, username: true, email: true }
        },
        children: {
          select: { id: true }
        },
        users: {
          select: { id: true }
        }
      }
    });

    // 如果上级部门发生变化，需要更新所有子部门的层级
    if (parentId !== undefined) {
      await this.updateChildrenLevels(id);
    }

    return this.formatDepartment(department);
  }

  /**
   * 删除部门
   */
  async deleteDepartment(id: string): Promise<void> {
    // 检查部门是否存在
    const department = await this.getDepartmentById(id);
    if (!department) {
      throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    }

    // 检查是否有子部门
    const children = await prisma.department.findMany({
      where: { parentId: id }
    });
    if (children.length > 0) {
      throw new AppError('Cannot delete department with child departments', 400, 'HAS_CHILD_DEPARTMENTS');
    }

    // 检查是否有用户
    const users = await prisma.user.findMany({
      where: { departmentId: id }
    });
    if (users.length > 0) {
      throw new AppError('Cannot delete department with users', 400, 'HAS_USERS');
    }

    await prisma.department.delete({
      where: { id }
    });
  }

  /**
   * 获取部门成员列表
   */
  async getDepartmentMembers(params: DepartmentMemberListParams): Promise<DepartmentMemberListResponse> {
    const {
      departmentId,
      page = 1,
      limit = 10,
      search = '',
      position,
      isMain
    } = params;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      departmentId
    };

    if (position) {
      where.position = position;
    }

    if (isMain !== undefined) {
      where.isMain = isMain;
    }

    if (search) {
      where.user = {
        OR: [
          { username: { contains: search } },
          { email: { contains: search } }
        ]
      };
    }

    // 查询部门成员
    const [members, total] = await Promise.all([
      prisma.userDepartment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
           { isMain: 'desc' },
           { createdAt: 'desc' }
         ],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
      prisma.userDepartment.count({ where })
    ]);

    // 格式化成员数据
     const formattedMembers: DepartmentMember[] = members.map(member => ({
       id: member.id,
       userId: member.userId,
       departmentId: member.departmentId,
       position: member.position as DepartmentPosition,
       isMain: member.isMain,
       createdAt: member.createdAt,
       updatedAt: member.updatedAt,
       user: {
         ...member.user,
         avatar: member.user.avatar || undefined
       }
     }));

    return {
      data: formattedMembers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 分配用户到部门
   */
  async assignUserToDepartment(data: AssignUserToDepartmentData): Promise<DepartmentMember> {
     const { userId, departmentId, position, isMain = false } = data;
     const userIdStr = String(userId);
     const departmentIdStr = String(departmentId);

     // 检查用户是否存在
     const user = await prisma.user.findUnique({
       where: { id: userIdStr },
       select: { id: true, username: true, email: true, avatar: true }
     });
     if (!user) {
       throw new AppError('User not found', 404, 'USER_NOT_FOUND');
     }

     // 检查部门是否存在
     const department = await this.getDepartmentById(departmentIdStr);
     if (!department) {
       throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
     }

     // 检查用户是否已在该部门
     const existingAssignment = await prisma.userDepartment.findUnique({
       where: {
         userId_departmentId: {
           userId: userIdStr,
           departmentId: departmentIdStr
         }
       }
     });
     if (existingAssignment) {
       throw new AppError('User already assigned to this department', 409, 'USER_ALREADY_ASSIGNED');
     }

     // 如果设置为主部门，需要先取消其他主部门
     if (isMain) {
       await prisma.userDepartment.updateMany({
         where: { userId: userIdStr, isMain: true },
         data: { isMain: false }
       });
     }

     // 创建用户部门关联
     const userDepartment = await prisma.userDepartment.create({
       data: {
         userId: userIdStr,
         departmentId: departmentIdStr,
         position,
         isMain
       },
       include: {
         user: {
           select: {
             id: true,
             username: true,
             email: true,
             avatar: true
           }
         }
       }
     });

     return {
       id: userDepartment.id,
       userId: userDepartment.userId,
       departmentId: userDepartment.departmentId,
       position: userDepartment.position as DepartmentPosition,
       isMain: userDepartment.isMain,
       createdAt: userDepartment.createdAt,
       updatedAt: userDepartment.updatedAt,
       user: {
         ...userDepartment.user,
         avatar: userDepartment.user.avatar || undefined
       }
     };
   }

  /**
   * 更新用户部门职位
   */
  async updateUserDepartment(userId: ID, departmentId: ID, data: UpdateUserDepartmentData): Promise<DepartmentMember> {
    const { position, isMain } = data;
    const userIdStr = String(userId);
    const departmentIdStr = String(departmentId);

    // 检查用户部门关联是否存在
    const existingAssignment = await prisma.userDepartment.findUnique({
      where: {
        userId_departmentId: {
          userId: userIdStr,
          departmentId: departmentIdStr
        }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true
          }
        }
      }
    });
    if (!existingAssignment) {
      throw new AppError('User department assignment not found', 404, 'ASSIGNMENT_NOT_FOUND');
    }

    // 如果设置为主部门，需要先取消其他主部门
    if (isMain === true) {
      await prisma.userDepartment.updateMany({
        where: { 
          userId: userIdStr, 
          isMain: true,
          NOT: {
            AND: [
              { userId: userIdStr },
              { departmentId: departmentIdStr }
            ]
          }
        },
        data: { isMain: false }
      });
    }

    // 更新用户部门关联
    const userDepartment = await prisma.userDepartment.update({
      where: {
        userId_departmentId: {
          userId: userIdStr,
          departmentId: departmentIdStr
        }
      },
      data: {
        ...(position !== undefined && { position }),
        ...(isMain !== undefined && { isMain })
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    return {
      id: userDepartment.id,
      userId: userDepartment.userId,
      departmentId: userDepartment.departmentId,
      position: userDepartment.position as DepartmentPosition,
      isMain: userDepartment.isMain,
      createdAt: userDepartment.createdAt,
      updatedAt: userDepartment.updatedAt,
      user: {
        ...userDepartment.user,
        avatar: userDepartment.user.avatar || undefined
      }
    };
  }

  /**
   * 移除用户部门关联
   */
  async removeUserFromDepartment(userDepartmentId: string): Promise<void> {
    // 检查用户部门关联是否存在
    const existingAssignment = await prisma.userDepartment.findUnique({
      where: { id: userDepartmentId }
    });
    if (!existingAssignment) {
      throw new AppError('User department assignment not found', 404, 'ASSIGNMENT_NOT_FOUND');
    }

    // 删除用户部门关联
    await prisma.userDepartment.delete({
      where: { id: userDepartmentId }
    });
  }

  /**
   * 获取用户的部门列表
   */
  async getUserDepartments(userId: string): Promise<DepartmentMember[]> {
    const userIdStr = String(userId);
    const userDepartments = await prisma.userDepartment.findMany({
      where: { userId: userIdStr },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true
          }
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { isMain: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return userDepartments.map(ud => ({
      id: ud.id,
      userId: ud.userId,
      departmentId: ud.departmentId,
      position: ud.position as DepartmentPosition,
      isMain: ud.isMain,
      createdAt: ud.createdAt,
      updatedAt: ud.updatedAt,
      user: {
        ...ud.user,
        avatar: ud.user.avatar || undefined
      }
    }));
  }

  /**
   * 获取部门统计信息
   */
  async getDepartmentStats(): Promise<DepartmentStats> {
    const [totalDepartments, activeDepartments, totalUsers] = await Promise.all([
      prisma.department.count(),
      prisma.department.count({ where: { isActive: true } }),
      prisma.user.count({ where: { departmentId: { not: null } } })
    ]);

    // 获取部门用户分布
    const departmentDistribution = await prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        users: {
          select: { id: true }
        }
      }
    });

    const distribution = departmentDistribution.map(dept => ({
      departmentId: dept.id,
      departmentName: dept.name,
      userCount: dept.users.length,
      percentage: totalUsers > 0 ? (dept.users.length / totalUsers) * 100 : 0
    }));

    // 计算最大层级深度
    const maxDepth = await this.calculateMaxDepth();

    return {
      totalDepartments,
      activeDepartments,
      totalUsers,
      maxDepth,
      departmentDistribution: distribution
    };
  }

  /**
   * 格式化部门数据
   */
  private formatDepartment(department: any): Department {
    return {
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description,
      parentId: department.parentId,
      managerId: department.managerId,
      level: department.level,
      sort: department.sort,
      isActive: department.isActive,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      parent: department.parent,
      children: department.children,
      manager: department.manager,
      userCount: (department.userDepartments?.length ?? department.users?.length ?? 0),
      childrenCount: department.children?.length || 0
    };
  }

  /**
   * 构建部门树形结构
   */
  private buildDepartmentTree(departments: any[], parentId: string | null = null, level = 0): DepartmentTreeNode[] {
    const children = departments
      .filter(dept => dept.parentId === parentId)
      .map(dept => ({
        ...this.formatDepartment(dept),
        children: this.buildDepartmentTree(departments, dept.id, level + 1),
        level,
        path: this.buildPath(departments, dept.id)
      }));

    return children;
  }

  /**
   * 构建部门路径
   */
  private buildPath(departments: any[], departmentId: string): string[] {
    const path: string[] = [];
    let currentId = departmentId;

    while (currentId) {
      const dept = departments.find(d => d.id === currentId);
      if (dept) {
        path.unshift(dept.name);
        currentId = dept.parentId;
      } else {
        break;
      }
    }

    return path;
  }

  /**
   * 检查循环依赖
   */
  private async checkCircularDependency(departmentId: string, parentId: string): Promise<boolean> {
    let currentId: string | null = parentId;
    
    while (currentId) {
      if (currentId === departmentId) {
        return true;
      }
      
      const parent: { parentId: string | null } | null = await prisma.department.findUnique({
        where: { id: currentId },
        select: { parentId: true }
      });
      
      currentId = parent?.parentId || null;
    }
    
    return false;
  }

  /**
   * 计算最大层级深度
   */
  private async calculateMaxDepth(): Promise<number> {
    const departments = await prisma.department.findMany({
      select: { id: true, parentId: true }
    });

    let maxDepth = 0;

    for (const dept of departments) {
      const depth = this.calculateDepartmentDepth(departments, dept.id);
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  /**
   * 计算部门深度
   */
  private calculateDepartmentDepth(departments: any[], departmentId: string): number {
    let depth = 1;
    let currentId = departmentId;

    while (currentId) {
      const dept = departments.find(d => d.id === currentId);
      if (dept?.parentId) {
        depth++;
        currentId = dept.parentId;
      } else {
        break;
      }
    }

    return depth;
  }

  /**
   * 计算部门层级
   */
  private async calculateDepartmentLevel(parentId: string | null): Promise<number> {
    if (!parentId) {
      return 1; // 没有上级部门的为一级部门
    }

    const parent = await prisma.department.findUnique({
      where: { id: parentId },
      select: { level: true }
    });

    if (!parent) {
      return 1; // 如果找不到上级部门，默认为一级
    }

    return parent.level + 1; // 上级部门层级 + 1
  }

  /**
   * 递归更新子部门的层级
   */
  private async updateChildrenLevels(departmentId: string): Promise<void> {
    const children = await prisma.department.findMany({
      where: { parentId: departmentId },
      select: { id: true }
    });

    for (const child of children) {
      const newLevel = await this.calculateDepartmentLevel(departmentId);
      await prisma.department.update({
        where: { id: child.id },
        data: { level: newLevel }
      });
      
      // 递归更新子部门的子部门
      await this.updateChildrenLevels(child.id);
    }
  }
}

export const departmentService = new DepartmentService();
