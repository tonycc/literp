/**
 * 错误处理装饰器
 * 用于统一处理控制器方法中的错误，消除重复的try-catch模式
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 控制器方法错误处理装饰器
 * 自动捕获异步方法中的错误并传递给错误处理中间件
 */
export function ErrorHandler(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
    try {
      return await method.apply(this, [req, res, next]);
    } catch (error) {
      next(error);
    }
  };
  
  return descriptor;
}

/**
 * 服务方法错误处理装饰器
 * 自动记录错误日志并重新抛出错误
 */
export function ServiceErrorHandler(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        console.error(`${operation}失败:`, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * 批量应用错误处理装饰器到类的所有方法
 */
export function AutoErrorHandler(target: any) {
  const propertyNames = Object.getOwnPropertyNames(target.prototype);
  
  propertyNames.forEach(propertyName => {
    if (propertyName !== 'constructor') {
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
      if (descriptor && typeof descriptor.value === 'function') {
        ErrorHandler(target, propertyName, descriptor);
        Object.defineProperty(target.prototype, propertyName, descriptor);
      }
    }
  });
  
  return target;
}