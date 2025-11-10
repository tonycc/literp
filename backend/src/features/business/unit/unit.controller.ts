import { Request, Response } from 'express';
import { UnitService } from './unit.service';
import { AppError } from '../../../shared/middleware/error';
import Joi from 'joi';
import { createSuccessResponse, createErrorResponse } from '@zyerp/shared';

// 验证模式
const createUnitSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Unit name is required',
    'string.max': 'Unit name too long'
  }),
  symbol: Joi.string().min(1).max(10).required().messages({
    'string.empty': 'Unit symbol is required',
    'string.max': 'Unit symbol too long'
  }),
  category: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Unit category is required',
    'string.max': 'Unit category too long'
  }),
  precision: Joi.number().integer().min(0).max(10).optional(),
  isActive: Joi.boolean().optional()
});

const updateUnitSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  symbol: Joi.string().min(1).max(10).optional(),
  category: Joi.string().min(1).max(50).optional(),
  precision: Joi.number().integer().min(0).max(10).optional(),
  isActive: Joi.boolean().optional()
});

const queryUnitSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

export class UnitController {
  private unitService: UnitService;

  constructor() {
    this.unitService = new UnitService();
  }

  /**
   * 获取单位选项列表（用于下拉选择）
   */
  getUnitOptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive } = req.query;
      const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
      
      const options = await this.unitService.getUnitOptions(isActiveBoolean);
      
      res.json(createSuccessResponse(options));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 获取单位列表
   */
  getUnits = async (req: Request, res: Response): Promise<void> => {
    try {
      // 处理查询参数
      const queryParams = {
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
      };

      const { error } = queryUnitSchema.validate(queryParams);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const result = await this.unitService.getUnits(queryParams);
      
      res.json(createSuccessResponse(result));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 根据ID获取单位详情
   */
  getUnitById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const unit = await this.unitService.getUnitById(id);
      
      if (!unit) {
        res.status(404).json(createErrorResponse('Unit not found', 'UNIT_NOT_FOUND'));
        return;
      }
      
      res.json(createSuccessResponse(unit));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 创建单位
   */
  createUnit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = createUnitSchema.validate(req.body);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const unit = await this.unitService.createUnit(value);
      
      res.status(201).json(createSuccessResponse(unit, 'Unit created successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 更新单位
   */
  updateUnit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { error, value } = updateUnitSchema.validate(req.body);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const unit = await this.unitService.updateUnit(id, value);
      
      res.json(createSuccessResponse(unit, 'Unit updated successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 删除单位
   */
  deleteUnit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.unitService.deleteUnit(id);
      
      res.json(createSuccessResponse(null, 'Unit deleted successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 获取单位分类列表
   */
  getUnitCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.unitService.getUnitCategories();
      
      res.json(createSuccessResponse(categories));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };
}