/**
 * 权限控制器
 */

import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse } from '@zyerp/shared';
import { permissionService } from './permission.service';
import { AppError } from '../../../shared/middleware/error';

export class PermissionController {
  /**
   * 获取权限列表
   */
  async getPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        resource, 
        action, 
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const result = await permissionService.getPermissions({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        resource: resource as string,
        action: action as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json(createSuccessResponse(result, 'Permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据ID获取权限
   */
  async getPermissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Permission ID is required', 400, 'MISSING_PERMISSION_ID');
      }

      const permission = await permissionService.getPermissionById(id);
      
      if (!permission) {
        throw new AppError('Permission not found', 404, 'PERMISSION_NOT_FOUND');
      }

      res.json(createSuccessResponse(permission, 'Permission retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建权限
   */
  async createPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, description, resource, action } = req.body;

      // 基本验证
      if (!name || !code || !resource || !action) {
        throw new AppError('Name, code, resource and action are required', 400, 'MISSING_FIELDS');
      }

      // 检查权限代码是否已存在
      const existingPermission = await permissionService.getPermissionByCode(code);
      if (existingPermission) {
        throw new AppError('Permission code already exists', 409, 'PERMISSION_CODE_EXISTS');
      }

      const permission = await permissionService.createPermission({
        name,
        code,
        description,
        resource,
        action
      });

      res.status(201).json(createSuccessResponse(permission, 'Permission created successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新权限
   */
  async updatePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, code, description, resource, action } = req.body;

      if (!id) {
        throw new AppError('Permission ID is required', 400, 'MISSING_PERMISSION_ID');
      }

      // 检查权限是否存在
      const existingPermission = await permissionService.getPermissionById(id);
      if (!existingPermission) {
        throw new AppError('Permission not found', 404, 'PERMISSION_NOT_FOUND');
      }

      // 如果更新代码，检查是否与其他权限冲突
      if (code && code !== existingPermission.code) {
        const permissionWithCode = await permissionService.getPermissionByCode(code);
        if (permissionWithCode && permissionWithCode.id !== id) {
          throw new AppError('Permission code already exists', 409, 'PERMISSION_CODE_EXISTS');
        }
      }

      const permission = await permissionService.updatePermission(id, {
        name,
        code,
        description,
        resource,
        action
      });

      res.json(createSuccessResponse(permission, 'Permission updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除权限
   */
  async deletePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Permission ID is required', 400, 'MISSING_PERMISSION_ID');
      }

      // 检查权限是否存在
      const existingPermission = await permissionService.getPermissionById(id);
      if (!existingPermission) {
        throw new AppError('Permission not found', 404, 'PERMISSION_NOT_FOUND');
      }

      await permissionService.deletePermission(id);

      res.json(createSuccessResponse(null, 'Permission deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取所有权限（用于角色分配）
   */
  async getAllPermissions(_req: Request, res: Response, next: NextFunction) {
    try {
      const permissions = await permissionService.getAllPermissions();

      res.json(createSuccessResponse(permissions, 'All permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据资源获取权限
   */
  async getPermissionsByResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { resource } = req.params;

      if (!resource) {
        throw new AppError('Resource is required', 400, 'MISSING_RESOURCE');
      }

      const permissions = await permissionService.getPermissionsByResource(resource);

      res.json(createSuccessResponse(permissions, 'Permissions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const permissionController = new PermissionController();