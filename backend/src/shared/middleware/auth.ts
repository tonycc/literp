/**
 * JWT 认证中间件
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { createErrorResponse } from '@zyerp/shared';
import { config } from '../../config';

// 扩展 Request 接口
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// JWT 认证中间件
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json(createErrorResponse('Access token is required', 'MISSING_TOKEN'));
  }

  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(403).json(createErrorResponse('Invalid or expired token', 'INVALID_TOKEN'));
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

// 可选认证中间件（不强制要求token）
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (!err) {
        req.user = decoded as JwtPayload;
      }
    });
  }

  next();
};

// 角色权限检查中间件
export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('Authentication required', 'AUTH_REQUIRED'));
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json(createErrorResponse('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS'));
    }

    next();
  };
};

// 权限字符串检查中间件（支持any/all模式）
export const requirePermissions = (
  permissions: string[],
  options: { mode?: 'any' | 'all' } = { mode: 'any' }
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(createErrorResponse('Authentication required', 'AUTH_REQUIRED'));
    }

    const userPermissions: string[] = (req.user as any).permissions || [];
    const mode = options.mode || 'any';

    const hasRequired = mode === 'all'
      ? permissions.every(p => userPermissions.includes(p))
      : permissions.some(p => userPermissions.includes(p));

    if (!hasRequired) {
      return res.status(403).json(createErrorResponse('Insufficient permissions', 'INSUFFICIENT_PERMISSIONS'));
    }

    next();
  };
};