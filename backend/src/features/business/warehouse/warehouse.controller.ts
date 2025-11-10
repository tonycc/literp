/**
 * 仓库管理控制器
 */

import { Request, Response } from 'express';
import Joi from 'joi';
import { WarehouseService } from './warehouse.service';
import { AppError } from '../../../shared/middleware/error';
import { createSuccessResponse, createErrorResponse } from '@zyerp/shared';

export class WarehouseController {
  private warehouseService: WarehouseService;

  constructor() {
    this.warehouseService = new WarehouseService();
  }

  /**
   * 获取仓库选项列表（用于下拉选择）
   */
  getWarehouseOptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive } = req.query;
      
      const options = await this.warehouseService.getWarehouseOptions(
        isActive === 'true' ? true : isActive === 'false' ? false : undefined
      );

      res.json(createSuccessResponse(options, '获取仓库选项成功'));
    } catch (error) {
      console.error('获取仓库选项失败:', error);
      res.status(500).json(createErrorResponse('获取仓库选项失败'));
    }
  };

  /**
   * 获取仓库列表
   */
  getWarehouses = async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证查询参数
      const schema = Joi.object({
        page: Joi.number().integer().min(1).default(1),
        pageSize: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow(''),
        type: Joi.string().allow(''),
        isActive: Joi.boolean(),
        sortBy: Joi.string().valid('name', 'code', 'type', 'createdAt', 'updatedAt').default('createdAt'),
        sortOrder: Joi.string().valid('asc', 'desc').default('desc')
      });

      const { error, value } = schema.validate(req.query);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message));
        return;
      }

      const result = await this.warehouseService.getWarehouses(value);

      res.json(createSuccessResponse(result, '获取仓库列表成功'));
    } catch (error) {
      console.error('获取仓库列表失败:', error);
      res.status(500).json(createErrorResponse('获取仓库列表失败'));
    }
  };

  /**
   * 获取仓库详情
   */
  getWarehouseById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json(createErrorResponse('仓库ID不能为空'));
        return;
      }

      const warehouse = await this.warehouseService.getWarehouseById(id);

      if (!warehouse) {
        res.status(404).json(createErrorResponse('仓库不存在'));
        return;
      }

      res.json(createSuccessResponse(warehouse, '获取仓库详情成功'));
    } catch (error) {
      console.error('获取仓库详情失败:', error);
      res.status(500).json(createErrorResponse('获取仓库详情失败'));
    }
  };

  /**
   * 创建仓库
   */
  createWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
      // 验证请求数据
      const schema = Joi.object({
        name: Joi.string().required().messages({
          'string.empty': '仓库名称不能为空',
          'any.required': '仓库名称是必填项'
        }),
        code: Joi.string().required().messages({
          'string.empty': '仓库编码不能为空',
          'any.required': '仓库编码是必填项'
        }),
        type: Joi.string().valid('main', 'branch', 'virtual').required().messages({
          'any.only': '仓库类型必须是 main、branch 或 virtual',
          'any.required': '仓库类型是必填项'
        }),
        address: Joi.string().allow(''),
        managerId: Joi.string().allow(''),
        isActive: Joi.boolean().default(true)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message));
        return;
      }

      const warehouse = await this.warehouseService.createWarehouse(value);

      res.status(201).json(createSuccessResponse(warehouse, '创建仓库成功'));
    } catch (error) {
      console.error('创建仓库失败:', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message));
        return;
      }

      res.status(500).json(createErrorResponse('创建仓库失败'));
    }
  };

  /**
   * 更新仓库
   */
  updateWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json(createErrorResponse('仓库ID不能为空'));
        return;
      }

      // 验证请求数据
      const schema = Joi.object({
        name: Joi.string(),
        code: Joi.string(),
        type: Joi.string().valid('main', 'branch', 'virtual'),
        address: Joi.string().allow(''),
        managerId: Joi.string().allow(''),
        isActive: Joi.boolean()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message));
        return;
      }

      const warehouse = await this.warehouseService.updateWarehouse(id, value);

      res.json(createSuccessResponse(warehouse, '更新仓库成功'));
    } catch (error) {
      console.error('更新仓库失败:', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message));
        return;
      }

      res.status(500).json(createErrorResponse('更新仓库失败'));
    }
  };

  /**
   * 删除仓库
   */
  deleteWarehouse = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json(createErrorResponse('仓库ID不能为空'));
        return;
      }

      await this.warehouseService.deleteWarehouse(id);

      res.json(createSuccessResponse(null, '删除仓库成功'));
    } catch (error) {
      console.error('删除仓库失败:', error);
      
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message));
        return;
      }

      res.status(500).json(createErrorResponse('删除仓库失败'));
    }
  };

  /**
   * 获取仓库类型列表
   */
  getWarehouseTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      const types = await this.warehouseService.getWarehouseTypes();

      res.json(createSuccessResponse(types, '获取仓库类型成功'));
    } catch (error) {
      console.error('获取仓库类型失败:', error);
      res.status(500).json(createErrorResponse('获取仓库类型失败'));
    }
  };
}