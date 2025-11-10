/**
 * 单位管理服务
 */

import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/middleware/error';

export interface UnitOption {
  value: string;
  label: string;
  symbol: string;
  category: string;
}

export interface CreateUnitData {
  name: string;
  symbol: string;
  category: string;
  precision?: number;
  isActive?: boolean;
}

export interface UpdateUnitData {
  name?: string;
  symbol?: string;
  category?: string;
  precision?: number;
  isActive?: boolean;
}

export interface UnitListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UnitListResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UnitService {
  /**
   * 获取单位选项列表（用于下拉选择）
   */
  async getUnitOptions(isActive?: boolean): Promise<UnitOption[]> {
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const units = await prisma.unit.findMany({
      where,
      select: {
        id: true,
        name: true,
        symbol: true,
        category: true,
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return units.map(unit => ({
      value: unit.id,
      label: unit.name,
      symbol: unit.symbol,
      category: unit.category
    }));
  }

  /**
   * 获取单位列表
   */
  async getUnits(params: UnitListParams): Promise<UnitListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    // 搜索条件
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { symbol: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 获取总数
    const total = await prisma.unit.count({ where });

    // 获取数据
    const units = await prisma.unit.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    });

    return {
      data: units,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * 根据ID获取单位详情
   */
  async getUnitById(id: string): Promise<any | null> {
    return await prisma.unit.findUnique({
      where: { id }
    });
  }

  /**
   * 创建单位
   */
  async createUnit(data: CreateUnitData): Promise<any> {
    const { name, symbol, category, precision = 2, isActive = true } = data;

    // 检查名称是否已存在
    const existingUnit = await prisma.unit.findFirst({
      where: {
        OR: [
          { name },
          { symbol }
        ]
      }
    });

    if (existingUnit) {
      if (existingUnit.name === name) {
        throw new AppError('Unit name already exists', 409, 'UNIT_NAME_EXISTS');
      }
      if (existingUnit.symbol === symbol) {
        throw new AppError('Unit symbol already exists', 409, 'UNIT_SYMBOL_EXISTS');
      }
    }

    return await prisma.unit.create({
      data: {
        name,
        symbol,
        category,
        precision,
        isActive
      }
    });
  }

  /**
   * 更新单位
   */
  async updateUnit(id: string, data: UpdateUnitData): Promise<any> {
    const { name, symbol, category, precision, isActive } = data;

    // 检查单位是否存在
    const existingUnit = await this.getUnitById(id);
    if (!existingUnit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    // 检查名称和符号冲突
    if (name || symbol) {
      const conflictUnit = await prisma.unit.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(name ? [{ name }] : []),
                ...(symbol ? [{ symbol }] : [])
              ]
            }
          ]
        }
      });

      if (conflictUnit) {
        if (conflictUnit.name === name) {
          throw new AppError('Unit name already exists', 409, 'UNIT_NAME_EXISTS');
        }
        if (conflictUnit.symbol === symbol) {
          throw new AppError('Unit symbol already exists', 409, 'UNIT_SYMBOL_EXISTS');
        }
      }
    }

    return await prisma.unit.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(symbol !== undefined && { symbol }),
        ...(category !== undefined && { category }),
        ...(precision !== undefined && { precision }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    });
  }

  /**
   * 删除单位
   */
  async deleteUnit(id: string): Promise<void> {
    // 检查单位是否存在
    const existingUnit = await this.getUnitById(id);
    if (!existingUnit) {
      throw new AppError('Unit not found', 404, 'UNIT_NOT_FOUND');
    }

    // 检查是否有产品在使用此单位
    const productsUsingUnit = await prisma.product.count({
      where: { unitId: id }
    });

    if (productsUsingUnit > 0) {
      throw new AppError('Cannot delete unit that is being used by products', 400, 'UNIT_IN_USE');
    }

    await prisma.unit.delete({
      where: { id }
    });
  }

  /**
   * 获取单位分类列表
   */
  async getUnitCategories(): Promise<string[]> {
    const categories = await prisma.unit.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { isActive: true }
    });

    return categories.map(c => c.category).filter(Boolean);
  }
}