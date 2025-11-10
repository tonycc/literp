/**
 * 工艺路线控制器
 */

import type { Request, Response } from 'express';
import { routingService } from './routing.service';
import { AppError } from '../../../shared/middleware/error';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { 
  CreateRoutingRequest, 
  UpdateRoutingRequest,
  RoutingQueryParams 
} from '@zyerp/shared';

export class RoutingController extends BaseController {
  /**
   * 创建工艺路线
   */
  @ErrorHandler
  async createRouting(req: Request, res: Response) {
    const data: CreateRoutingRequest = req.body;
    const createdBy = this.getUserId(req);

    // 基本验证
    if (!data.name) {
      throw new AppError('Name is required', 400, 'MISSING_FIELDS');
    }
    
    if (!data.code) {
      throw new AppError('Code is required', 400, 'MISSING_FIELDS');
    }

    const routing = await routingService.createRouting(data, createdBy);
    this.success(res, routing, 'Routing created successfully');
  }

  /**
   * 获取工艺路线列表
   */
  @ErrorHandler
  async getRoutings(req: Request, res: Response) {
    const params: RoutingQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10,
      keyword: req.query.keyword as string,
      active: req.query.active ? req.query.active === 'true' : undefined,
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const result = await routingService.getRoutings(params);
    this.success(res, result, 'Routings retrieved successfully');
  }

  /**
   * 根据ID获取工艺路线
   */
  @ErrorHandler
  async getRoutingById(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Routing ID is required', 400, 'MISSING_ROUTING_ID');
    }

    const routing = await routingService.getRoutingById(id);
    
    if (!routing) {
      throw new AppError('Routing not found', 404, 'ROUTING_NOT_FOUND');
    }

    this.success(res, routing, 'Routing retrieved successfully');
  }

  /**
   * 根据编码获取工艺路线
   */
  @ErrorHandler
  async getRoutingByCode(req: Request, res: Response) {
    const { code } = req.params;
    
    if (!code) {
      throw new AppError('Routing code is required', 400, 'MISSING_ROUTING_CODE');
    }

    const routing = await routingService.getRoutingByCode(code);
    
    if (!routing) {
      throw new AppError('Routing not found', 404, 'ROUTING_NOT_FOUND');
    }

    this.success(res, routing, 'Routing retrieved successfully');
  }

  /**
   * 更新工艺路线
   */
  @ErrorHandler
  async updateRouting(req: Request, res: Response) {
    const { id } = req.params;
    const data: UpdateRoutingRequest = req.body;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Routing ID is required', 400, 'MISSING_ROUTING_ID');
    }

    const routing = await routingService.updateRouting(id, data, updatedBy);
    this.success(res, routing, 'Routing updated successfully');
  }

  /**
   * 删除工艺路线
   */
  @ErrorHandler
  async deleteRouting(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Routing ID is required', 400, 'MISSING_ROUTING_ID');
    }

    await routingService.deleteRouting(id);
    this.success(res, null, 'Routing deleted successfully');
  }

  /**
   * 切换工艺路线状态
   */
  @ErrorHandler
  async toggleRoutingStatus(req: Request, res: Response) {
    const { id } = req.params;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Routing ID is required', 400, 'MISSING_ROUTING_ID');
    }

    const routing = await routingService.toggleRoutingStatus(id, updatedBy);
    this.success(res, routing, 'Routing status updated successfully');
  }

  /**
   * 获取工艺路线选项
   */
  @ErrorHandler
  async getRoutingOptions(req: Request, res: Response) {
    const params = {
      active: req.query.active ? req.query.active === 'true' : undefined
    };

    const options = await routingService.getRoutingOptions(params);
    this.success(res, options, 'Routing options retrieved successfully');
  }

  /**
   * 验证工艺路线编码
   */
  @ErrorHandler
  async validateCode(req: Request, res: Response) {
    const { code, excludeId } = req.body;

    if (!code) {
      throw new AppError('Code is required', 400, 'MISSING_CODE');
    }

    const result = await routingService.validateRoutingCode(code, excludeId);

    this.success(res, result, 'Code validation completed');
  }

  /**
   * 获取指定工艺路线的工序列表
   */
  @ErrorHandler
  async getRoutingOperations(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Routing ID is required', 400, 'MISSING_ROUTING_ID');
    }

    const operations = await routingService.getRoutingOperations(id);
    this.success(res, operations, 'Routing operations retrieved successfully');
  }
}

export const routingController = new RoutingController();