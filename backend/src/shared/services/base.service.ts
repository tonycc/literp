/**
 * 服务基类
 * 提供通用的错误处理、日志记录和常用功能
 */

import { PrismaClient } from '@prisma/client';

export abstract class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * 记录错误日志
   * @param operation 操作名称
   * @param error 错误对象
   */
  protected logError(operation: string, error: any): void {
    console.error(`${operation}失败:`, error);
  }

  /**
   * 记录信息日志
   * @param operation 操作名称
   * @param message 消息内容
   */
  protected logInfo(operation: string, message?: string): void {
    console.log(`${operation}${message ? ': ' + message : ''}`);
  }

  /**
   * 处理分页参数
   * @param page 页码
   * @param pageSize 每页大小
   * @returns 分页配置对象
   */
  protected getPaginationConfig(page?: number, pageSize?: number) {
    const currentPage = Math.max(1, page || 1);
    const currentPageSize = Math.min(100, Math.max(1, pageSize || 10));
    
    return {
      skip: (currentPage - 1) * currentPageSize,
      take: currentPageSize,
      page: currentPage,
      pageSize: currentPageSize
    };
  }

  /**
   * 构建分页响应
   * @param data 数据数组
   * @param total 总数
   * @param page 当前页
   * @param pageSize 每页大小
   */
  protected buildPaginatedResponse<T>(data: T[], total: number, page: number, pageSize: number) {
    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * 安全执行数据库操作
   * @param operation 操作名称
   * @param fn 数据库操作函数
   */
  protected async safeExecute<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.logError(operation, error);
      throw error;
    }
  }

  /**
   * 验证必需字段
   * @param data 数据对象
   * @param requiredFields 必需字段数组
   */
  protected validateRequiredFields(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`缺少必需字段: ${missingFields.join(', ')}`);
    }
  }

  /**
   * 清理对象中的undefined值
   * @param obj 要清理的对象
   */
  protected cleanUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleaned[key as keyof T] = obj[key];
      }
    });
    return cleaned;
  }
}