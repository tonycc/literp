import { Request, Response } from 'express';
import { DepartmentService } from './department.service';
import { AppError } from '../../../shared/middleware/error';
import Joi from 'joi';
import { createSuccessResponse, createErrorResponse, DepartmentPosition } from '@zyerp/shared';

// 验证模式
const createDepartmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Department name is required',
    'string.max': 'Department name too long'
  }),
  code: Joi.string().optional(),
  description: Joi.string().optional(),
  parentId: Joi.string().optional(),
  managerId: Joi.string().optional(),
  sort: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional()
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  code: Joi.string().optional(),
  description: Joi.string().optional(),
  parentId: Joi.string().optional(),
  managerId: Joi.string().optional(),
  sort: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional()
});

const queryDepartmentSchema = Joi.object({
  name: Joi.string().optional(),
  code: Joi.string().optional(),
  parentId: Joi.string().optional(),
  managerId: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// 部门成员管理验证模式
const departmentMemberQuerySchema = Joi.object({
  departmentId: Joi.string().required(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  position: Joi.string().valid(...Object.values(DepartmentPosition)).optional(),
  isMain: Joi.boolean().optional()
});

const assignUserToDepartmentSchema = Joi.object({
  userId: Joi.string().required(),
  position: Joi.string().valid(...Object.values(DepartmentPosition)).required(),
  isMain: Joi.boolean().optional()
});

const updateUserDepartmentSchema = Joi.object({
  position: Joi.string().valid(...Object.values(DepartmentPosition)).optional(),
  isMain: Joi.boolean().optional()
});

export class DepartmentController {
  private departmentService: DepartmentService;

  constructor() {
    this.departmentService = new DepartmentService();
  }

  /**
   * 获取部门列表
   */
  getDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
      // 处理查询参数
      const queryParams = {
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
      };

      const { error } = queryDepartmentSchema.validate(queryParams);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const result = await this.departmentService.getDepartments(queryParams);
      
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
   * 获取部门树形结构
   */
  getDepartmentTree = async (_req: Request, res: Response): Promise<void> => {
    try {
      const tree = await this.departmentService.getDepartmentTree();
      
      res.json(createSuccessResponse(tree));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 根据ID获取部门详情
   */
  getDepartmentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const department = await this.departmentService.getDepartmentById(id);
      
      if (!department) {
        res.status(404).json(createErrorResponse('Department not found', 'DEPARTMENT_NOT_FOUND'));
        return;
      }
      
      res.json(createSuccessResponse(department));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 创建部门
   */
  createDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = createDepartmentSchema.validate(req.body);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const department = await this.departmentService.createDepartment(value);
      
      res.status(201).json(createSuccessResponse(department, 'Department created successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 更新部门
   */
  updateDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { error, value } = updateDepartmentSchema.validate(req.body);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const department = await this.departmentService.updateDepartment(id, value);
      
      res.json(createSuccessResponse(department, 'Department updated successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 删除部门
   */
  deleteDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.departmentService.deleteDepartment(id);
      
      res.json(createSuccessResponse(null, 'Department deleted successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 获取部门统计信息
   */
  getDepartmentStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.departmentService.getDepartmentStats();
      
      res.json(createSuccessResponse(stats));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 获取部门成员列表
   */
  getDepartmentMembers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: departmentId } = req.params;
      
      // 处理查询参数
      const queryParams = {
        ...req.query,
        departmentId,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        isMain: req.query.isMain ? req.query.isMain === 'true' : undefined
      };

      const { error } = departmentMemberQuerySchema.validate(queryParams);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const result = await this.departmentService.getDepartmentMembers(queryParams);
      
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
   * 分配用户到部门
   */
  assignUserToDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: departmentId } = req.params;
      const { error, value } = assignUserToDepartmentSchema.validate(req.body);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const memberData = {
        ...value,
        departmentId
      };

      const member = await this.departmentService.assignUserToDepartment(memberData);
      
      res.status(201).json(createSuccessResponse(member, 'User assigned to department successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 更新用户部门信息
   */
  updateUserDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: departmentId, userId } = req.params;
      const { error, value } = updateUserDepartmentSchema.validate(req.body);
      if (error) {
        res.status(400).json(createErrorResponse(error.details[0].message, 'VALIDATION_ERROR'));
        return;
      }

      const member = await this.departmentService.updateUserDepartment(userId, departmentId, value);
      
      res.json(createSuccessResponse(member, 'User department information updated successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };

  /**
   * 从部门移除用户
   */
  removeUserFromDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { membershipId } = req.params;

      await this.departmentService.removeUserFromDepartment(membershipId);
      
      res.json(createSuccessResponse(null, 'User removed from department successfully'));
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.code));
      } else {
        res.status(500).json(createErrorResponse('Internal server error'));
      }
    }
  };
}