/**
 * 仓库管理服务
 */

import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/middleware/error';

export interface WarehouseOption {
  value: string;
  label: string;
  code: string;
  type: string;
}

export interface CreateWarehouseData {
  name: string;
  code: string;
  type: string;
  address?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface UpdateWarehouseData {
  name?: string;
  code?: string;
  type?: string;
  address?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface WarehouseListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WarehouseListResponse {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class WarehouseService {
  /**
   * 获取仓库选项列表（用于下拉选择）
   */
  async getWarehouseOptions(isActive?: boolean): Promise<WarehouseOption[]> {
    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const warehouses = await prisma.warehouse.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    return warehouses.map(warehouse => ({
      value: warehouse.id,
      label: warehouse.name,
      code: warehouse.code,
      type: warehouse.type
    }));
  }

  /**
   * 获取仓库列表
   */
  async getWarehouses(params: WarehouseListParams): Promise<WarehouseListResponse> {
    const {
      page = 1,
      pageSize = 10,
      search,
      type,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * pageSize;
    const where: any = {};

    // 搜索条件
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 获取总数
    const total = await prisma.warehouse.count({ where });

    // 获取数据
    const warehouses = await prisma.warehouse.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder }
    });

    return {
      data: warehouses,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 根据ID获取仓库详情
   */
  async getWarehouseById(id: string): Promise<any | null> {
    return await prisma.warehouse.findUnique({
      where: { id }
    });
  }

  /**
   * 创建仓库
   */
  async createWarehouse(data: CreateWarehouseData): Promise<any> {
    const { name, code, type, address, managerId, isActive = true } = data;

    // 检查编码是否已存在
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        OR: [
          { name },
          { code }
        ]
      }
    });

    if (existingWarehouse) {
      if (existingWarehouse.name === name) {
        throw new AppError('Warehouse name already exists', 409, 'WAREHOUSE_NAME_EXISTS');
      }
      if (existingWarehouse.code === code) {
        throw new AppError('Warehouse code already exists', 409, 'WAREHOUSE_CODE_EXISTS');
      }
    }

    return await prisma.warehouse.create({
      data: {
        name,
        code,
        type,
        address,
        managerId,
        isActive
      }
    });
  }

  /**
   * 更新仓库
   */
  async updateWarehouse(id: string, data: UpdateWarehouseData): Promise<any> {
    const { name, code, type, address, managerId, isActive } = data;

    // 检查仓库是否存在
    const existingWarehouse = await this.getWarehouseById(id);
    if (!existingWarehouse) {
      throw new AppError('Warehouse not found', 404, 'WAREHOUSE_NOT_FOUND');
    }

    // 检查名称和编码冲突
    if (name || code) {
      const conflictWarehouse = await prisma.warehouse.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(name ? [{ name }] : []),
                ...(code ? [{ code }] : [])
              ]
            }
          ]
        }
      });

      if (conflictWarehouse) {
        if (conflictWarehouse.name === name) {
          throw new AppError('Warehouse name already exists', 409, 'WAREHOUSE_NAME_EXISTS');
        }
        if (conflictWarehouse.code === code) {
          throw new AppError('Warehouse code already exists', 409, 'WAREHOUSE_CODE_EXISTS');
        }
      }
    }

    return await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(type !== undefined && { type }),
        ...(address !== undefined && { address }),
        ...(managerId !== undefined && { managerId }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    });
  }

  /**
   * 删除仓库
   */
  async deleteWarehouse(id: string): Promise<void> {
    // 检查仓库是否存在
    const existingWarehouse = await this.getWarehouseById(id);
    if (!existingWarehouse) {
      throw new AppError('Warehouse not found', 404, 'WAREHOUSE_NOT_FOUND');
    }

    // 检查是否有产品在使用此仓库
    const productsUsingWarehouse = await prisma.product.count({
      where: { defaultWarehouseId: id }
    });

    if (productsUsingWarehouse > 0) {
      throw new AppError('Cannot delete warehouse that is being used by products', 400, 'WAREHOUSE_IN_USE');
    }

    await prisma.warehouse.delete({
      where: { id }
    });
  }

  /**
   * 获取仓库类型列表
   */
  async getWarehouseTypes(): Promise<string[]> {
    const types = await prisma.warehouse.findMany({
      select: { type: true },
      distinct: ['type'],
      where: { isActive: true }
    });

    return types.map(t => t.type).filter(Boolean);
  }
}