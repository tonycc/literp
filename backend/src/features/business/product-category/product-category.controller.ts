/**
 * 产品类别控制器
 */

import type { Request, Response, NextFunction } from 'express';
import { productCategoryService } from './product-category.service';
import { AppError } from '../../../shared/middleware/error';
import { BaseController } from '../../../shared/controllers/base.controller';
import { ErrorHandler } from '../../../shared/decorators/error-handler';
import { 
  CreateProductCategoryRequest, 
  UpdateProductCategoryRequest,
  ProductCategoryQueryParams 
} from '@zyerp/shared';

export class ProductCategoryController extends BaseController {
  /**
   * 创建产品类别
   */
  @ErrorHandler
  async createCategory(req: Request, res: Response, next: NextFunction) {
    const data: CreateProductCategoryRequest = req.body;
    const createdBy = this.getUserId(req);

    // 基本验证
    if (!data.name) {
      throw new AppError('Name is required', 400, 'MISSING_FIELDS');
    }

    const category = await productCategoryService.createCategory(data, createdBy);
    this.success(res, category, 'Product category created successfully');
  }

  /**
   * 获取产品类别列表
   */
  @ErrorHandler
  async getCategories(req: Request, res: Response, next: NextFunction) {
    const params: ProductCategoryQueryParams = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10,
      keyword: req.query.keyword as string,
      parentCode: req.query.parentCode as string,
      level: req.query.level ? parseInt(req.query.level as string, 10) : undefined,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      sortBy: req.query.sortBy as string || 'sortOrder',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc'
    };

    const result = await productCategoryService.getCategories(params);
    this.success(res, result, 'Product categories retrieved successfully');
  }

  /**
   * 根据ID获取产品类别
   */
  @ErrorHandler
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError('Category ID is required', 400, 'MISSING_CATEGORY_ID');
    }

    const category = await productCategoryService.getCategoryById(id);
    
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    this.success(res, category, 'Product category retrieved successfully');
  }

  /**
   * 根据编码获取产品类别
   */
  @ErrorHandler
  async getCategoryByCode(req: Request, res: Response, next: NextFunction) {
    const { code } = req.params;
    
    if (!code) {
      throw new AppError('Category code is required', 400, 'MISSING_CATEGORY_CODE');
    }

    const category = await productCategoryService.getCategoryByCode(code);
    
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    this.success(res, category, 'Product category retrieved successfully');
  }

  /**
   * 更新产品类别
   */
  @ErrorHandler
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const data: UpdateProductCategoryRequest = req.body;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Category ID is required', 400, 'MISSING_CATEGORY_ID');
    }

    const category = await productCategoryService.updateCategory(id, data, updatedBy);
    this.success(res, category, 'Product category updated successfully');
  }

  /**
   * 删除产品类别
   */
  @ErrorHandler
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Category ID is required', 400, 'MISSING_CATEGORY_ID');
    }

    await productCategoryService.deleteCategory(id);
    this.success(res, null, 'Product category deleted successfully');
  }

  /**
   * 切换产品类别状态
   */
  @ErrorHandler
  async toggleCategoryStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const updatedBy = this.getUserId(req);

    if (!id) {
      throw new AppError('Category ID is required', 400, 'MISSING_CATEGORY_ID');
    }

    const category = await productCategoryService.toggleCategoryStatus(id, updatedBy);
    this.success(res, category, 'Product category status updated successfully');
  }

  /**
   * 获取产品类别树形结构
   */
  @ErrorHandler
  async getCategoryTree(req: Request, res: Response, next: NextFunction) {
    const tree = await productCategoryService.getCategoryTree();
    this.success(res, tree, 'Category tree retrieved successfully');
  }

  /**
   * 获取产品类别选项
   */
  @ErrorHandler
  async getCategoryOptions(req: Request, res: Response, next: NextFunction) {
    const params = {
      level: req.query.level ? parseInt(req.query.level as string, 10) : undefined,
      parentCode: req.query.parentCode as string,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
    };

    const options = await productCategoryService.getCategoryOptions(params);
    this.success(res, options, 'Category options retrieved successfully');
  }

  /**
   * 生成类别编码
   */
  @ErrorHandler
  async generateCode(req: Request, res: Response, next: NextFunction) {
    const { parentCode } = req.body;

    // 这里可以实现编码生成逻辑
    // 暂时返回一个简单的响应
    const code = await this.generateCategoryCode(parentCode);
    
    this.success(res, { 
      code,
      level: parentCode ? 2 : 1,
      parentCode 
    }, 'Category code generated successfully');
  }

  /**
   * 验证类别编码
   */
  @ErrorHandler
  async validateCode(req: Request, res: Response, next: NextFunction) {
    const { code, excludeId } = req.body;

    if (!code) {
      throw new AppError('Code is required', 400, 'MISSING_CODE');
    }

    // 检查编码是否已存在
    const existingCategory = await productCategoryService.getCategoryByCode(code);
    const isUnique = !existingCategory || (excludeId && existingCategory.id === excludeId);

    this.success(res, {
      isValid: isUnique,
      isUnique,
      message: isUnique ? 'Code is available' : 'Code already exists'
    }, 'Code validation completed');
  }

  /**
   * 获取产品类别统计信息
   */
  @ErrorHandler
  async getCategoryStats(req: Request, res: Response, next: NextFunction) {
    // 这里可以实现统计逻辑
    // 暂时返回模拟数据
    const stats = {
      total: 0,
      active: 0,
      inactive: 0,
      level1Count: 0,
      level2Count: 0,
      byLevel: {}
    };

    this.success(res, stats, 'Category statistics retrieved successfully');
  }

  /**
   * 批量操作产品类别
   */
  @ErrorHandler
  async batchOperation(req: Request, res: Response, next: NextFunction) {
    const { ids, operation } = req.body;
    const updatedBy = this.getUserId(req);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('Category IDs are required', 400, 'MISSING_CATEGORY_IDS');
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
            await productCategoryService.toggleCategoryStatus(id, updatedBy);
            successCount++;
            break;
          case 'delete':
            await productCategoryService.deleteCategory(id);
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

  /**
   * 生成类别编码的私有方法
   */
  private async generateCategoryCode(parentCode?: string): Promise<string> {
    if (!parentCode) {
      // 一级类别：查找最大编码
      const categories = await productCategoryService.getCategories({
        level: 1,
        pageSize: 1000
      });

      const codes = categories.data
        .map(cat => cat.code)
        .filter(code => /^CAT\d+$/.test(code))
        .map(code => parseInt(code.replace('CAT', ''), 10))
        .sort((a, b) => b - a);

      const nextNum = codes.length > 0 ? codes[0] + 1 : 1;
      return `CAT${nextNum.toString().padStart(3, '0')}`;
    } else {
      // 子类别：基于父类别编码生成
      const children = await productCategoryService.getCategories({
        parentCode,
        pageSize: 1000
      });

      const childNum = children.data.length + 1;
      return `${parentCode}${childNum.toString().padStart(3, '0')}`;
    }
  }
}

export const productCategoryController = new ProductCategoryController();