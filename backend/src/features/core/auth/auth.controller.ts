/**
 * 认证控制器
 */

import { Request, Response, NextFunction } from 'express';
import { LoginRequest, RefreshTokenRequest, createSuccessResponse } from '@zyerp/shared';
import { authService } from './auth.service';
import { AppError } from '../../../shared/middleware/error';

export class AuthController {
  /**
   * 用户登录
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData: LoginRequest = req.body;

      // 基本验证
      if (!loginData.username || !loginData.password) {
        throw new AppError('Email and password are required', 400, 'MISSING_CREDENTIALS');
      }

      const result = await authService.login(loginData);
      
      res.json(createSuccessResponse(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;
      
      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN');
      }

      const result = await authService.refreshToken({ refreshToken });
      
      res.json(createSuccessResponse(result, 'Token refreshed successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户登出
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new AppError('Authorization header is required', 400, 'MISSING_AUTH_HEADER');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new AppError('Token is required', 400, 'MISSING_TOKEN');
      }

      await authService.logout(token);
      
      res.json(createSuccessResponse(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      // 从 JWT 载荷中读取 userId（生成令牌时字段名为 userId）
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new AppError('User not authenticated', 401, 'NOT_AUTHENTICATED');
      }

      const user = await authService.getCurrentUser(userId);
      
      res.json(createSuccessResponse(user, 'User retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();