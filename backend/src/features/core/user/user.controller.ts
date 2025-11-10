/**
 * 用户控制器
 */

import type { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { AppError } from '../../../shared/middleware/error';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';

export class UserController extends BaseController {
  /**
   * 创建用户
   */
  @ErrorHandler
  async createUser(req: Request, res: Response, next: NextFunction) {
    const { username, email, password, roleIds } = req.body;

    // 基本验证
    if (!username || !email || !password) {
      throw new AppError('Username, email and password are required', 400, 'MISSING_FIELDS');
    }

    const user = await userService.createUser({
      username,
      email,
      password,
      roleIds
    });

    this.success(res, user, 'User created successfully');
  }

  /**
   * 获取用户列表
   */
  @ErrorHandler
  async getUsers(req: Request, res: Response, next: NextFunction) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await userService.getUsers({
      page: pageNum,
      limit: limitNum,
      search: search as string,
      isActive: isActive ? isActive === 'true' : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    this.success(res, result, 'Users retrieved successfully');
  }

  /**
   * 根据ID获取用户
   */
  @ErrorHandler
  async getUserById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
    }

    const user = await userService.getUserById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    this.success(res, user, 'User retrieved successfully');
  }

  /**
   * 更新用户
   */
  @ErrorHandler
  async updateUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
    }

    const user = await userService.updateUser(id, updateData);
    this.success(res, user, 'User updated successfully');
  }

  /**
   * 删除用户
   */
  @ErrorHandler
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id) {
      throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
    }

    await userService.deleteUser(id);
    this.success(res, null, 'User deleted successfully');
  }

  /**
   * 更新用户状态
   */
  @ErrorHandler
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
      throw new AppError('User ID is required', 400, 'MISSING_USER_ID');
    }

    if (typeof isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean', 400, 'INVALID_STATUS');
    }

    const user = await userService.updateUser(id, { isActive });
    this.success(res, user, 'User status updated successfully');
  }
}

export const userController = new UserController();