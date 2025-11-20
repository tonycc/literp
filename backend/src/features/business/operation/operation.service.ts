/**
 * 工序服务
 */

import { 
  OperationInfo, 
  CreateOperationRequest, 
  UpdateOperationRequest,
  OperationQueryParams,
  OperationListResponse,
  OperationSortField
} from '@zyerp/shared';
import { AppError } from '../../../shared/middleware/error';
import { BaseService } from '../../../shared/services/base.service';

export class OperationService extends BaseService {
  /**
   * 创建工序
   */
  async createOperation(data: CreateOperationRequest, createdBy: string): Promise<OperationInfo> {
    const { name, code, description, standardTime, wageRate, costPerHour, unit, isActive } = data;

    // 检查工序名称是否已存在
    const existingOperationWithName = await this.prisma.operation.findUnique({
      where: { name }
    });

    if (existingOperationWithName) {
      throw new AppError('Operation name already exists', 400, 'OPERATION_NAME_EXISTS');
    }

    // 检查编码是否已存在
    const existingOperationWithCode = await this.prisma.operation.findUnique({
      where: { code }
    });

    if (existingOperationWithCode) {
      throw new AppError('Operation code already exists', 400, 'OPERATION_CODE_EXISTS');
    }

    // 创建工序
    const operation = await this.prisma.operation.create({
      data: {
        name,
        code,
        description,
        standardTime: standardTime || 0,
        wageRate: wageRate || 0,
        costPerHour: costPerHour || 0,
        unit: unit || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy,
        updatedBy: createdBy,
      }
    });

    return this.formatOperation(operation);
  }

  /**
   * 获取工序列表
   */
  async getOperations(params: OperationQueryParams): Promise<OperationListResponse> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
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

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 查询数据
    const [operations, total] = await Promise.all([
      this.prisma.operation.findMany({
        where,
        orderBy,
        skip,
        take
      }),
      this.prisma.operation.count({ where })
    ]);

    const formattedOperations = operations.map(operation => this.formatOperation(operation));

    return {
      data: formattedOperations,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 根据ID获取工序
   */
  async getOperationById(id: string): Promise<OperationInfo | null> {
    const operation = await this.prisma.operation.findUnique({
      where: { id }
    });

    if (!operation) {
      return null;
    }

    return this.formatOperation(operation);
  }

  /**
   * 根据编码获取工序
   */
  async getOperationByCode(code: string): Promise<OperationInfo | null> {
    const operation = await this.prisma.operation.findUnique({
      where: { code }
    });

    if (!operation) {
      return null;
    }

    return this.formatOperation(operation);
  }

  /**
   * 更新工序
   */
  async updateOperation(id: string, data: UpdateOperationRequest, updatedBy: string): Promise<OperationInfo> {
    const { name, code, description, standardTime, wageRate, costPerHour, unit, isActive } = data;

    // 检查工序是否存在
    const existingOperation = await this.prisma.operation.findUnique({
      where: { id }
    });

    if (!existingOperation) {
      throw new AppError('Operation not found', 404, 'OPERATION_NOT_FOUND');
    }

    // 如果名称被修改，检查新名称是否已存在
    if (name && name !== existingOperation.name) {
      const operationWithName = await this.prisma.operation.findUnique({
        where: { name }
      });

      if (operationWithName) {
        throw new AppError('Operation name already exists', 400, 'OPERATION_NAME_EXISTS');
      }
    }

    // 如果编码被修改，检查新编码是否已存在
    if (code && code !== existingOperation.code) {
      const operationWithCode = await this.prisma.operation.findUnique({
        where: { code }
      });

      if (operationWithCode) {
        throw new AppError('Operation code already exists', 400, 'OPERATION_CODE_EXISTS');
      }
    }

    // 更新工序
    const operation = await this.prisma.operation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(standardTime !== undefined && { standardTime }),
        ...(wageRate !== undefined && { wageRate }),
        ...(costPerHour !== undefined && { costPerHour }),
        ...(unit !== undefined && { unit }),
        ...(isActive !== undefined && { isActive }),
        updatedBy,
        updatedAt: new Date()
      }
    });

    return this.formatOperation(operation);
  }

  /**
   * 删除工序
   */
  async deleteOperation(id: string): Promise<void> {
    // 检查工序是否存在
    const operation = await this.prisma.operation.findUnique({
      where: { id }
    });

    if (!operation) {
      throw new AppError('Operation not found', 404, 'OPERATION_NOT_FOUND');
    }

    // 检查是否有工艺路线引用了该工序
    const routingCount = await this.prisma.routingWorkcenter.count({
      where: { operationId: id }
    });

    if (routingCount > 0) {
      throw new AppError('Cannot delete operation that is referenced by routing workcenters', 400, 'OPERATION_IN_USE');
    }

    // 删除工序
    await this.prisma.operation.delete({
      where: { id }
    });
  }

  /**
   * 切换工序状态
   */
  async toggleOperationStatus(id: string, updatedBy: string): Promise<OperationInfo> {
    // 检查工序是否存在
    const operation = await this.prisma.operation.findUnique({
      where: { id }
    });

    if (!operation) {
      throw new AppError('Operation not found', 404, 'OPERATION_NOT_FOUND');
    }

    const newStatus = !operation.isActive;

    // 更新状态
    const updatedOperation = await this.prisma.operation.update({
      where: { id },
      data: {
        isActive: newStatus,
        updatedBy,
        updatedAt: new Date()
      }
    });

    return this.formatOperation(updatedOperation);
  }

  /**
   * 获取工序选项
   */
  async getOperationOptions(params?: { 
    isActive?: boolean 
  }): Promise<Array<{value: string, label: string, code: string}>> {
    const where: any = {};
    
    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const operations = await this.prisma.operation.findMany({
      where,
      orderBy: [
        { code: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        code: true,
        isActive: true
      }
    });

    return operations.map(operation => ({
      value: operation.id,
      label: operation.name,
      code: operation.code
    }));
  }

  /**
   * 验证工序编码
   */
  async validateOperationCode(code: string, excludeId?: string): Promise<{ isValid: boolean; isUnique: boolean; message?: string }> {
    if (!code) {
      return {
        isValid: false,
        isUnique: false,
        message: 'Code is required'
      };
    }

    // 检查编码是否已存在
    const existingOperation = await this.prisma.operation.findUnique({
      where: { code }
    });

    const isUnique = !existingOperation || (!!excludeId && existingOperation.id === excludeId);
    
    return {
      isValid: true,
      isUnique,
      message: isUnique ? 'Code is available' : 'Code already exists'
    };
  }

  /**
   * 验证工序名称
   */
  async validateOperationName(name: string, excludeId?: string): Promise<{ isValid: boolean; isUnique: boolean; message?: string }> {
    if (!name) {
      return {
        isValid: false,
        isUnique: false,
        message: 'Name is required'
      };
    }

    // 检查名称是否已存在
    const existingOperation = await this.prisma.operation.findUnique({
      where: { name }
    });

    const isUnique = !existingOperation || (!!excludeId && existingOperation.id === excludeId);
    
    return {
      isValid: true,
      isUnique,
      message: isUnique ? 'Name is available' : 'Name already exists'
    };
  }

  /**
   * 格式化工序数据
   */
  private formatOperation(operation: any): OperationInfo {
    return {
      id: operation.id,
      name: operation.name,
      code: operation.code,
      description: operation.description,
      standardTime: operation.standardTime,
      wageRate: operation.wageRate,
      costPerHour: operation.costPerHour,
      unit: operation.unit,
      isActive: operation.isActive,
      createdAt: operation.createdAt.toISOString(),
      updatedAt: operation.updatedAt.toISOString(),
      createdBy: operation.createdBy,
      updatedBy: operation.updatedBy,
      version: 1 // Prisma schema中没有version字段，这里设置默认值
    };
  }
}

export const operationService = new OperationService();