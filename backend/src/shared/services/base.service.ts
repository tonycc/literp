/**
 * 服务基类
 * 提供通用的错误处理、日志记录和常用功能
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../middleware/error';

export abstract class BaseService {
  public readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public logError(error: any, context: string) {
    console.error(`[${new Date().toISOString()}] Error in ${context}:`, error);
  }

  public logInfo(message: string, context: string) {
    console.log(`[${new Date().toISOString()}] Info in ${context}:`, message);
  }

  public getPaginationConfig(page?: number, pageSize?: number) {
    const currentPage = Math.max(page || 1, 1);
    const currentPageSize = Math.max(pageSize || 10, 1);
    const skip = (currentPage - 1) * currentPageSize;
    const take = currentPageSize;
    return { skip, take, page: currentPage, pageSize: currentPageSize };
  }

  public buildPaginatedResponse<T>(data: T[], total: number, page: number, pageSize: number) {
    return {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  public async safeExecute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        throw new AppError(`Database error: ${error.code}`, 500, error.code);
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        // Handle validation errors
        throw new AppError('Validation error', 400, 'PRISMA_VALIDATION_ERROR');
      } else {
        // Handle other errors
        throw new AppError('An unexpected error occurred', 500, 'UNEXPECTED_ERROR');
      }
    }
  }

  public validateRequiredFields<T extends Record<string, any>>(data: T, fields: (keyof T)[]) {
    for (const field of fields) {
      if (!data[field]) {
        throw new AppError(`${String(field)} is required`, 400, `MISSING_${String(field).toUpperCase()}`);
      }
    }
  }
}