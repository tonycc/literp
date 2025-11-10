/**
 * 角色控制器
 */

import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse } from '@zyerp/shared';
import { roleService } from './role.service';
import { AppError } from '../../../shared/middleware/error';

export class RoleController {
  /**
   * 获取角色列表
   */
  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const result = await roleService.getRoles({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json(createSuccessResponse(result, 'Roles retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据ID获取角色
   */
  async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Role ID is required', 400, 'MISSING_ROLE_ID');
      }

      const role = await roleService.getRoleById(id);
      
      if (!role) {
        throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
      }

      res.json(createSuccessResponse(role, 'Role retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建角色
   */
  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, description, permissionIds } = req.body;

      // 基本验证
      if (!name) {
        throw new AppError('Name is required', 400, 'MISSING_FIELDS');
      }

      // 如果提供了code，检查角色代码是否已存在
      if (code) {
        const existingRole = await roleService.getRoleByCode(code);
        if (existingRole) {
          throw new AppError('Role code already exists', 409, 'ROLE_CODE_EXISTS');
        }
      }

      const role = await roleService.createRole({
        name,
        code,
        description,
        permissionIds
      });

      res.status(201).json(createSuccessResponse(role, 'Role created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新角色
   */
  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, code, description, permissionIds } = req.body;

      if (!id) {
        throw new AppError('Role ID is required', 400, 'MISSING_ROLE_ID');
      }

      // 检查角色是否存在
      const existingRole = await roleService.getRoleById(id);
      if (!existingRole) {
        throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
      }

      // 如果更新代码，检查是否与其他角色冲突
      if (code && code !== existingRole.code) {
        const roleWithCode = await roleService.getRoleByCode(code);
        if (roleWithCode && roleWithCode.id !== id) {
          throw new AppError('Role code already exists', 409, 'ROLE_CODE_EXISTS');
        }
      }

      const role = await roleService.updateRole(id, {
        name,
        code,
        description,
        permissionIds
      });

      res.json(createSuccessResponse(role, 'Role updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除角色
   */
  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Role ID is required', 400, 'MISSING_ROLE_ID');
      }

      // 检查角色是否存在
      const existingRole = await roleService.getRoleById(id);
      if (!existingRole) {
        throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
      }

      await roleService.deleteRole(id);

      res.json(createSuccessResponse(null, 'Role deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 为角色分配权限
   */
  async assignPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      if (!id) {
        throw new AppError('Role ID is required', 400, 'MISSING_ROLE_ID');
      }

      if (!Array.isArray(permissionIds)) {
        throw new AppError('Permission IDs must be an array', 400, 'INVALID_PERMISSION_IDS');
      }

      // 检查角色是否存在
      const existingRole = await roleService.getRoleById(id);
      if (!existingRole) {
        throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
      }

      const role = await roleService.assignPermissions(id, permissionIds);

      res.json(createSuccessResponse(role, 'Permissions assigned successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取角色的权限
   */
  async getRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Role ID is required', 400, 'MISSING_ROLE_ID');
      }

      // 检查角色是否存在
      const existingRole = await roleService.getRoleById(id);
      if (!existingRole) {
        throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
      }

      const permissions = await roleService.getRolePermissions(id);

      res.json(createSuccessResponse(permissions, 'Role permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const roleController = new RoleController();