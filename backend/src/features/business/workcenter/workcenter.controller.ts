/**
 * 工作中心控制器
 */

import type { Request, Response, NextFunction } from 'express';
import { workcenterService } from './workcenter.service';
import { AppError } from '../../../shared/middleware/error';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { 
  CreateWorkcenterRequest, 
  UpdateWorkcenterRequest,
  WorkcenterQueryParams 
} from '@zyerp/shared';

export class WorkcenterController extends BaseController {
  /**
   * 创建工作中心
   */
  @ErrorHandler
  async createWorkcenter(req: Request, res: Response, next: NextFunction) {
    const data: CreateWorkcenterRequest = req.body;
    const createdBy = this.getUserId(req);

    // 基本验证
    if (!data.name) {
      throw new AppError('Name is required', 400, 'MISSING_FIELDS');
    }
    
    if (!data.code) {
      throw new AppError('Code is required', 400, 'MISSING_FIELDS');
    }

    const workcenter = await workcenterService.createWorkcenter(data, createdBy);
    this.success(res, workcenter, 'Workcenter created successfully');
  }

  /**
   * 获取工作中心列表
   */
  @ErrorHandler
  async getWorkcenters(req: Request, res: Response, next: NextFunction) {
    const params: WorkcenterQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10,
      keyword: req.query.keyword as string,
      active: req.query.active ? req.query.active === 'true' : undefined,
      type: req.query.type as string,
      sortBy: req.query.sortBy as string || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc'
    };

    const result = await workcenterService.getWorkcenters(params);
    this.success(res, result, 'Workcenters retrieved successfully');
  }

  /**
   * 根据ID获取工作中心
   */
  @ErrorHandler
  async getWorkcenterById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Workcenter ID is required', 400, 'MISSING_WORKCENTER_ID');
    }

    const workcenter = await workcenterService.getWorkcenterById(id);
    
    if (!workcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    this.success(res, workcenter, 'Workcenter retrieved successfully');
  }

  /**
   * 根据编码获取工作中心
   */
  @ErrorHandler
  async getWorkcenterByCode(req: Request, res: Response, next: NextFunction) {
    const { code } = req.params;
    
    if (!code) {
      throw new AppError('Workcenter code is required', 400, 'MISSING_WORKCENTER_CODE');
    }

    const workcenter = await workcenterService.getWorkcenterByCode(code);
    
    if (!workcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    this.success(res, workcenter, 'Workcenter retrieved successfully');
  }

  /**
   * 更新工作中心
   */
  @ErrorHandler
  async updateWorkcenter(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data: UpdateWorkcenterRequest = req.body;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Workcenter ID is required', 400, 'MISSING_WORKCENTER_ID');
    }

    const workcenter = await workcenterService.updateWorkcenter(id, data, updatedBy);
    this.success(res, workcenter, 'Workcenter updated successfully');
  }

  /**
   * 删除工作中心
   */
  @ErrorHandler
  async deleteWorkcenter(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Workcenter ID is required', 400, 'MISSING_WORKCENTER_ID');
    }

    await workcenterService.deleteWorkcenter(id);
    this.success(res, null, 'Workcenter deleted successfully');
  }

  /**
   * 切换工作中心状态
   */
  @ErrorHandler
  async toggleWorkcenterStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Workcenter ID is required', 400, 'MISSING_WORKCENTER_ID');
    }

    const workcenter = await workcenterService.toggleWorkcenterStatus(id, updatedBy);
    this.success(res, workcenter, 'Workcenter status updated successfully');
  }

  /**
   * 获取工作中心选项
   */
  @ErrorHandler
  async getWorkcenterOptions(req: Request, res: Response, next: NextFunction) {
    const params = {
      active: req.query.active ? req.query.active === 'true' : undefined,
      type: req.query.type as string
    };

    const options = await workcenterService.getWorkcenterOptions(params);
    this.success(res, options, 'Workcenter options retrieved successfully');
  }

  /**
   * 验证工作中心编码
   */
  @ErrorHandler
  async validateCode(req: Request, res: Response, next: NextFunction) {
    const { code, excludeId } = req.body;

    if (!code) {
      throw new AppError('Code is required', 400, 'MISSING_CODE');
    }

    const result = await workcenterService.validateWorkcenterCode(code, excludeId);

    this.success(res, result, 'Code validation completed');
  }

  /**
   * 更新车间成员
   */
  @ErrorHandler
  async updateTeamMembers(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { memberIds } = req.body;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Workcenter ID is required', 400, 'MISSING_WORKCENTER_ID');
    }

    if (!Array.isArray(memberIds)) {
      throw new AppError('Member IDs must be an array', 400, 'INVALID_MEMBER_IDS');
    }

    const workcenter = await workcenterService.updateTeamMembers(id, memberIds, updatedBy);
    this.success(res, workcenter, 'Team members updated successfully');
  }

  /**
   * 获取车间成员
   */
  @ErrorHandler
  async getTeamMembers(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Workcenter ID is required', 400, 'MISSING_WORKCENTER_ID');
    }

    const members = await workcenterService.getTeamMembers(id);
    this.success(res, { members }, 'Team members retrieved successfully');
  }

  /**
   * 更新排班信息
   */
  @ErrorHandler
  async updateShiftSchedule(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { schedule } = req.body;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Workcenter ID is required', 400, 'MISSING_WORKCENTER_ID');
    }

    const workcenter = await workcenterService.updateShiftSchedule(id, schedule, updatedBy);
    this.success(res, workcenter, 'Shift schedule updated successfully');
  }

  /**
   * 获取排班信息
   */
  @ErrorHandler
  async getShiftSchedule(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Workcenter ID is required', 400, 'MISSING_WORKCENTER_ID');
    }

    const schedule = await workcenterService.getShiftSchedule(id);
    this.success(res, { schedule }, 'Shift schedule retrieved successfully');
  }
}

export const workcenterController = new WorkcenterController();