/**
 * 产品类别服务
 */

import { 
  ProductCategoryInfo, 
  CreateProductCategoryRequest, 
  UpdateProductCategoryRequest,
  ProductCategoryQueryParams,
  ProductCategoryListResponse,
  ProductCategoryTreeNode,
  ProductCategorySortField
} from '@zyerp/shared';
import { AppError } from '../../../shared/middleware/error';
import { BaseService } from '../../../shared/services/base.service';

export class ProductCategoryService extends BaseService {
  /**
   * 创建产品类别
   */
  async createCategory(data: CreateProductCategoryRequest, createdBy: string): Promise<ProductCategoryInfo> {
    const { name, description, parentCode, sortOrder } = data;

    // 生成类别编码
    const code = await this.generateCategoryCode(parentCode);

    // 计算层级和路径
    let level = 1;
    let path = code;
    
    if (parentCode) {
      const parentCategory = await this.prisma.productCategory.findUnique({
        where: { code: parentCode }
      });

      if (!parentCategory) {
        throw new AppError('Parent category not found', 404, 'PARENT_CATEGORY_NOT_FOUND');
      }

      if (!parentCategory.isActive) {
        throw new AppError('Parent category is inactive', 400, 'PARENT_CATEGORY_INACTIVE');
      }

      level = parentCategory.level + 1;
      path = `${parentCategory.path}/${code}`;
    }

    // 创建类别
    const category = await this.prisma.productCategory.create({
      data: {
        name,
        code,
        description,
        sortOrder: sortOrder || 1,
        isActive: true,
        parentCode,
        level,
        path,
        createdBy,
        updatedBy: createdBy,
      }
    });

    return this.formatCategory(category);
  }

  /**
   * 获取产品类别列表
   */
  async getCategories(params: ProductCategoryQueryParams): Promise<ProductCategoryListResponse> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      parentCode,
      level,
      isActive,
      sortBy = ProductCategorySortField.SORT_ORDER,
      sortOrder = 'asc'
    } = params;

    const { skip, take } = this.getPaginationConfig(page, pageSize);

    // 构建查询条件
    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    if (parentCode !== undefined) {
      where.parentCode = parentCode;
    }

    if (level !== undefined) {
      where.level = level;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 查询数据
    const [categories, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          parent: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              children: true
            }
          }
        }
      }),
      this.prisma.productCategory.count({ where })
    ]);

    const formattedCategories = categories.map(category => this.formatCategory(category));

    return {
      data: formattedCategories,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    } as any;
  }

  /**
   * 根据ID获取产品类别
   */
  async getCategoryById(id: string): Promise<ProductCategoryInfo | null> {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    if (!category) {
      return null;
    }

    return this.formatCategory(category);
  }

  /**
   * 根据编码获取产品类别
   */
  async getCategoryByCode(code: string): Promise<ProductCategoryInfo | null> {
    const category = await this.prisma.productCategory.findUnique({
      where: { code },
      include: {
        parent: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    if (!category) {
      return null;
    }

    return this.formatCategory(category);
  }

  /**
   * 更新产品类别
   */
  async updateCategory(id: string, data: UpdateProductCategoryRequest, updatedBy: string): Promise<ProductCategoryInfo> {
    const { name, description, sortOrder } = data;

    // 检查类别是否存在
    const existingCategory = await this.prisma.productCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    // 更新类别
    const category = await this.prisma.productCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        updatedBy,
        version: { increment: 1 }
      }
    });

    return this.formatCategory(category);
  }

  /**
   * 删除产品类别
   */
  async deleteCategory(id: string): Promise<void> {
    // 检查类别是否存在
    const category = await this.prisma.productCategory.findUnique({
      where: { id }
    });

    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    // 检查是否有子类别
    const childrenCount = await this.prisma.productCategory.count({
      where: { parentCode: category.code }
    });

    if (childrenCount > 0) {
      throw new AppError('Cannot delete category with children', 400, 'CATEGORY_HAS_CHILDREN');
    }

    // 删除类别
    await this.prisma.productCategory.delete({
      where: { id }
    });
  }

  /**
   * 切换产品类别状态
   */
  async toggleCategoryStatus(id: string, updatedBy: string): Promise<ProductCategoryInfo> {
    // 检查类别是否存在
    const category = await this.prisma.productCategory.findUnique({
      where: { id }
    });

    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    const newStatus = !category.isActive;

    // 如果要禁用类别，检查是否有启用的子类别
    if (!newStatus) {
      const activeChildrenCount = await this.prisma.productCategory.count({
        where: { 
          parentCode: category.code,
          isActive: true
        }
      });

      if (activeChildrenCount > 0) {
        throw new AppError('Cannot disable category with active children', 400, 'CATEGORY_HAS_ACTIVE_CHILDREN');
      }
    }

    // 更新状态
    const updatedCategory = await this.prisma.productCategory.update({
      where: { id },
      data: {
        isActive: newStatus,
        updatedBy,
        version: { increment: 1 }
      }
    });

    return this.formatCategory(updatedCategory);
  }

  /**
   * 获取产品类别树
   */
  async getCategoryTree(): Promise<ProductCategoryTreeNode[]> {
    // 获取所有启用的类别
    const categories = await this.prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: [
        { level: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // 构建树结构
    return this.buildCategoryTree(categories);
  }

  /**
   * 获取产品类别选项
   */
  async getCategoryOptions(params?: { 
    level?: number; 
    parentCode?: string; 
    isActive?: boolean 
  }): Promise<Array<{value: string, label: string, level: number, parentCode?: string}>> {
    const where: any = {};
    
    if (params?.level !== undefined) {
      where.level = params.level;
    }
    
    if (params?.parentCode !== undefined) {
      where.parentCode = params.parentCode;
    }
    
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const categories = await this.prisma.productCategory.findMany({
      where,
      orderBy: [
        { level: 'asc' },
        { sortOrder: 'asc' }
      ],
      select: {
        code: true,
        name: true,
        level: true,
        parentCode: true,
        isActive: true
      }
    });

    return categories.map(category => ({
      value: category.code,
      label: category.name,
      level: category.level,
      parentCode: category.parentCode || undefined
    }));
  }

  /**
   * 生成类目编码
   */
  private async generateCategoryCode(parentCode?: string): Promise<string> {
    const maxRetries = 5;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      let code: string;
      
      if (!parentCode) {
        // 一级类别：查找最大编码
        const lastCategory = await this.prisma.productCategory.findFirst({
          where: { level: 1 },
          orderBy: { code: 'desc' }
        });

        if (!lastCategory) {
          code = 'CAT001';
        } else {
          // 提取数字部分并递增
          const match = lastCategory.code.match(/CAT(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10) + 1;
            code = `CAT${num.toString().padStart(3, '0')}`;
          } else {
            code = 'CAT001';
          }
        }
      } else {
        // 子类别：基于父类别编码生成
        const childrenCount = await this.prisma.productCategory.count({
          where: { parentCode }
        });

        const childNum = childrenCount + 1 + attempt; // 添加重试偏移
        code = `${parentCode}${childNum.toString().padStart(3, '0')}`;
      }

      // 检查编码是否已存在
      const existingCategory = await this.prisma.productCategory.findUnique({
        where: { code }
      });

      if (!existingCategory) {
        return code;
      }

      // 如果编码已存在，等待一小段时间后重试
      await new Promise(resolve => setTimeout(resolve, 10 + attempt * 5));
    }

    throw new AppError('Failed to generate unique category code after multiple attempts', 500, 'CODE_GENERATION_FAILED');
  }

  /**
   * 构建类别树
   */
  private buildCategoryTree(categories: any[]): ProductCategoryTreeNode[] {
    const categoryMap = new Map<string, ProductCategoryTreeNode>();
    const rootCategories: ProductCategoryTreeNode[] = [];

    // 创建节点映射
    categories.forEach(category => {
      const node: ProductCategoryTreeNode = {
        ...this.formatCategory(category),
        children: []
      };
      categoryMap.set(category.code, node);
    });

    // 构建树结构
    categories.forEach(category => {
      const node = categoryMap.get(category.code)!;
      
      if (category.parentCode) {
        const parent = categoryMap.get(category.parentCode);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }

  /**
   * 格式化类别数据
   */
  private formatCategory(category: any): ProductCategoryInfo {
    return {
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      parentCode: category.parentCode,
      parentName: category.parent?.name, // 添加父级类目名称
      level: category.level,
      path: category.path,
      hasChildren: category._count?.children > 0, // 是否有子类别
      childrenCount: category._count?.children || 0, // 子类别数量
      createdBy: category.createdBy,
      updatedBy: category.updatedBy,
      version: category.version,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}

export const productCategoryService = new ProductCategoryService();
