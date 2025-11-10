/**
 * 日志记录中间件
 */

import { Request, Response, NextFunction } from 'express';
import { logService } from '../../features/communication/log';

/**
 * 获取客户端IP地址
 */
function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * 系统日志中间件
 */
export const systemLogMiddleware = (level: 'info' | 'warn' | 'error' | 'debug' = 'info', module?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;

    // 重写res.send方法以捕获响应
    res.send = function(body: any) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 异步记录日志，不阻塞响应
      setImmediate(async () => {
        try {
          const statusCode = res.statusCode;
          const isError = statusCode >= 400;
          const logLevel = isError ? 'error' : level;
          
          await logService.createSystemLog({
            level: logLevel,
            message: `${req.method} ${req.originalUrl} - ${statusCode} (${duration}ms)`,
            module: module || 'api',
            action: `${req.method}_${req.originalUrl.split('/')[3] || 'unknown'}`,
            details: {
              method: req.method,
              url: req.originalUrl,
              statusCode,
              duration,
              userAgent: req.headers['user-agent'],
              body: req.method !== 'GET' ? req.body : undefined,
              query: Object.keys(req.query).length > 0 ? req.query : undefined,
            },
            userId: req.user?.sub ? String(req.user.sub) : undefined,
            ip: getClientIP(req),
            userAgent: req.headers['user-agent'],
          });
        } catch (error) {
          console.error('记录系统日志失败:', error);
        }
      });

      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * 审计日志中间件
 */
export const auditLogMiddleware = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseBody: any;

    // 保存原始请求数据
    const originalData = { ...req.body };

    // 重写res.send方法以捕获响应
    res.send = function(body: any) {
      responseBody = body;
      
      // 异步记录审计日志
      setImmediate(async () => {
        try {
          const statusCode = res.statusCode;
          const success = statusCode >= 200 && statusCode < 300;
          
          let resourceId: string | undefined;
          let newValues: any;
          let errorMsg: string | undefined;

          // 解析响应以获取资源ID和新值
          if (success && responseBody) {
            try {
              const parsedBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
              if (parsedBody.data) {
                resourceId = parsedBody.data.id;
                newValues = parsedBody.data;
              }
            } catch (e) {
              // 忽略JSON解析错误
            }
          } else if (!success && responseBody) {
            try {
              const parsedBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
              errorMsg = parsedBody.message || parsedBody.error;
            } catch (e) {
              errorMsg = '操作失败';
            }
          }

          // 对于UPDATE操作，记录原始值
          let oldValues: any;
          if (action === 'UPDATE' && req.params.id) {
            resourceId = req.params.id;
            // 这里可以根据需要查询原始值，暂时使用请求参数
            oldValues = originalData;
          }

          await logService.createAuditLog({
            action: action as any,
            resource,
            resourceId: resourceId || req.params.id,
            oldValues,
            newValues: action !== 'DELETE' ? newValues || originalData : undefined,
            userId: req.user?.sub ? String(req.user.sub) : undefined,
            ip: getClientIP(req),
            userAgent: req.headers['user-agent'],
            success,
            errorMsg,
          });
        } catch (error) {
          console.error('记录审计日志失败:', error);
        }
      });

      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * 登录审计日志
 */
export const loginAuditLog = async (
  userId: string,
  success: boolean,
  ip: string,
  userAgent: string,
  errorMsg?: string
) => {
  try {
    await logService.createAuditLog({
      action: 'LOGIN',
      resource: 'auth',
      resourceId: userId,
      userId: success ? userId : undefined,
      ip,
      userAgent,
      success,
      errorMsg,
    });
  } catch (error) {
    console.error('记录登录审计日志失败:', error);
  }
};

/**
 * 登出审计日志
 */
export const logoutAuditLog = async (
  userId: string,
  ip: string,
  userAgent: string
) => {
  try {
    await logService.createAuditLog({
      action: 'LOGOUT',
      resource: 'auth',
      resourceId: userId,
      userId,
      ip,
      userAgent,
      success: true,
    });
  } catch (error) {
    console.error('记录登出审计日志失败:', error);
  }
};