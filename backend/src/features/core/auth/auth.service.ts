/**
 * 认证服务
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  User 
} from '@zyerp/shared';
import { config } from '../../../config';
import { userService } from '../user/user.service';
import { AppError } from '../../../shared/middleware/error';
import { BaseService } from '../../../shared/services/base.service';

// 自定义 JWT Payload 接口
interface CustomJwtPayload {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

export class AuthService extends BaseService {
  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const { username, password } = data;

    // 查找用户 - 支持用户名、邮箱或手机号登录
    let user = await userService.getUserByEmail(username);
    if (!user) {
      user = await userService.getUserByUsername(username);
    }
    if (!user) {
      // 检查是否为手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (phoneRegex.test(username)) {
        user = await userService.getUserByPhone(username);
      }
    }
    
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // 检查用户是否激活
    if (!user.isActive) {
      throw new AppError('Account is disabled', 401, 'ACCOUNT_DISABLED');
    }

    // 验证密码
    const isValidPassword = await userService.validatePassword(user, password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // 生成令牌
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(config.jwt.expiresIn),
    };
  }

  /**
   * 刷新令牌
   */
  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    const { refreshToken } = data;

    // 验证刷新令牌
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
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
            }
          }
        }
      }
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // 检查用户是否激活
    if (!tokenRecord.user.isActive) {
      throw new AppError('Account is disabled', 401, 'ACCOUNT_DISABLED');
    }

    // 删除旧的刷新令牌
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id }
    });

    // 格式化用户数据
    const user = userService['formatUser'](tokenRecord.user);

    // 生成新的令牌
    const tokens = await this.generateTokens(user);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.parseExpiry(config.jwt.expiresIn),
    };
  }

  /**
   * 登出
   */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  /**
   * 验证访问令牌
   */
  async verifyAccessToken(token: string): Promise<CustomJwtPayload> {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as CustomJwtPayload;
      
      // 检查用户是否仍然存在且激活
      const user = await userService.getUserById(payload.userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or disabled', 401, 'USER_NOT_FOUND');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
      }
      throw error;
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  /**
   * 生成访问令牌和刷新令牌
   */
  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    // 生成访问令牌
    const accessTokenPayload: CustomJwtPayload = {
      userId: String(user.id),
      username: user.username,
      roles: user.roles.map(role => role.name),
      permissions: user.roles.flatMap(role => 
        role.permissions.map(permission => `${permission.resource}:${permission.action}`)
      ),
    };

    const accessToken = jwt.sign(
      accessTokenPayload,
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    // 生成刷新令牌
    const refreshTokenValue = crypto.randomUUID();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setTime(
      refreshTokenExpiry.getTime() + 
      this.parseExpiry(config.jwt.refreshExpiresIn)
    );

    // 保存刷新令牌到数据库
    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: String(user.id),
        expiresAt: refreshTokenExpiry,
      }
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  /**
   * 解析过期时间字符串为毫秒
   */
  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return value;
    }
  }
}

export const authService = new AuthService();