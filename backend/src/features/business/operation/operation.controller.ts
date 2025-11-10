/**
 * 工序控制器
 */

import type { Request, Response, NextFunction } from 'express';
import { operationService } from './operation.service';
import { AppError } from '../../../shared/middleware/error';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { 
  CreateOperationRequest, 
  UpdateOperationRequest,
  OperationQueryParams 
} from '@zyerp/shared';

export class OperationController extends BaseController {
  /**
   * 创建工序
   */
  @ErrorHandler
  async createOperation(req: Request, res: Response, next: NextFunction) {
    const data: CreateOperationRequest = req.body;
    const createdBy = this.getUserId(req);

    // 基本验证
    if (!data.name) {
      throw new AppError('Name is required', 400, 'MISSING_FIELDS');
    }
    
    if (!data.code) {
      throw new AppError('Code is required', 400, 'MISSING_FIELDS');
    }

    const operation = await operationService.createOperation(data, createdBy);
    this.success(res, operation, 'Operation created successfully');
  }

  /**
   * 获取工序列表
   */
  @ErrorHandler
  async getOperations(req: Request, res: Response, next: NextFunction) {
    const params: OperationQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10,
      keyword: req.query.keyword as string,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const result = await operationService.getOperations(params);
    this.success(res, result, 'Operations retrieved successfully');
  }

  /**
   * 根据ID获取工序
   */
  @ErrorHandler
  async getOperationById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Operation ID is required', 400, 'MISSING_OPERATION_ID');
    }

    const operation = await operationService.getOperationById(id);
    
    if (!operation) {
      throw new AppError('Operation not found', 404, 'OPERATION_NOT_FOUND');
    }

    this.success(res, operation, 'Operation retrieved successfully');
  }

  /**
   * 根据编码获取工序
   */
  @ErrorHandler
  async getOperationByCode(req: Request, res: Response, next: NextFunction) {
    const { code } = req.params;
    
    if (!code) {
      throw new AppError('Operation code is required', 400, 'MISSING_OPERATION_CODE');
    }

    const operation = await operationService.getOperationByCode(code);
    
    if (!operation) {
      throw new AppError('Operation not found', 404, 'OPERATION_NOT_FOUND');
    }

    this.success(res, operation, 'Operation retrieved successfully');
  }

  /**
   * 更新工序
   */
  @ErrorHandler
  async updateOperation(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data: UpdateOperationRequest = req.body;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Operation ID is required', 400, 'MISSING_OPERATION_ID');
    }

    const operation = await operationService.updateOperation(id, data, updatedBy);
    this.success(res, operation, 'Operation updated successfully');
  }

  /**
   * 删除工序
   */
  @ErrorHandler
  async deleteOperation(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Operation ID is required', 400, 'MISSING_OPERATION_ID');
    }

    await operationService.deleteOperation(id);
    this.success(res, null, 'Operation deleted successfully');
  }

  /**
   * 切换工序状态
   */
  @ErrorHandler
  async toggleOperationStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Operation ID is required', 400, 'MISSING_OPERATION_ID');
    }

    const operation = await operationService.toggleOperationStatus(id, updatedBy);
    this.success(res, operation, 'Operation status updated successfully');
  }

  /**
   * 获取工序选项
   */
  @ErrorHandler
  async getOperationOptions(req: Request, res: Response, next: NextFunction) {
    const params = {
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
    };

    const options = await operationService.getOperationOptions(params);
    this.success(res, options, 'Operation options retrieved successfully');
  }

  /**
   * 验证工序编码
   */
  @ErrorHandler
  async validateCode(req: Request, res: Response, next: NextFunction) {
    const { code, excludeId } = req.body;

    if (!code) {
      throw new AppError('Code is required', 400, 'MISSING_CODE');
    }

    const result = await operationService.validateOperationCode(code, excludeId);

    this.success(res, result, 'Code validation completed');
  }

  /**
   * 验证工序名称
   */
  @ErrorHandler
  async validateName(req: Request, res: Response, next: NextFunction) {
    const { name, excludeId } = req.body;

    if (!name) {
      throw new AppError('Name is required', 400, 'MISSING_NAME');
    }

    const result = await operationService.validateOperationName(name, excludeId);

    this.success(res, result, 'Name validation completed');
  }

  /**
   * 获取工序统计信息
   */
  @ErrorHandler
  async getOperationStats(req: Request, res: Response, next: NextFunction) {
    // 这里可以实现统计逻辑
    // 暂时返回模拟数据
    const stats = {
      total: 0,
      active: 0,
      inactive: 0
    };

    this.success(res, stats, 'Operation statistics retrieved successfully');
  }

  /**
   * 批量操作工序
   */
  @ErrorHandler
  async batchOperation(req: Request, res: Response, next: NextFunction) {
    const { ids, operation } = req.body;
    const updatedBy = this.getUserId(req);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Operation IDs are required', 400, 'MISSING_OPERATION_IDS');
    }

    if (!operation || !['activate', 'deactivate', 'delete'].includes(operation)) {
      throw new AppError('Invalid operation', 400, 'INVALID_OPERATION');
    }

    let successCount = 0;
    const failures: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      try {
        switch (operation) {
          case 'activate':
          case 'deactivate':
            await operationService.toggleOperationStatus(id, updatedBy);
            successCount++;
            break;
          case 'delete':
            await operationService.deleteOperation(id);
            successCount++;
            break;
        }
      } catch (error) {
        failures.push({
          id,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    this.success(res, {
      successCount,
      failureCount: failures.length,
      failures: failures.length > 0 ? failures : undefined
    }, 'Batch operation completed');
  }
}

export const operationController = new OperationController();