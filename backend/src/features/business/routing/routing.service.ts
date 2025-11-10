/**
 * 工艺路线服务
 */

import {
  RoutingInfo,
  CreateRoutingRequest,
  UpdateRoutingRequest,
  RoutingQueryParams,
  RoutingListResponse,
  RoutingValidateCodeResponse,
  RoutingWorkcenterInfo
} from '@zyerp/shared';
import { AppError } from '../../../shared/middleware/error';
import { BaseService } from '../../../shared/services/base.service';

export class RoutingService extends BaseService {
  /**
   * 创建工艺路线
   */
  async createRouting(data: CreateRoutingRequest, createdBy: string): Promise<RoutingInfo> {
    const { name, code, description, active, companyId, operations } = data;

    // 检查工艺路线编码是否已存在
    const existingRoutingWithCode = await this.prisma.routing.findUnique({
      where: { code }
    });

    if (existingRoutingWithCode) {
      throw new AppError('Routing code already exists', 400, 'ROUTING_CODE_EXISTS');
    }

    // 在事务中创建工艺路线并批量写入工序
    const routing = await this.prisma.$transaction(async (tx) => {
      const createdRouting = await tx.routing.create({
        data: {
          name,
          code,
          description,
          active: active !== undefined ? active : true,
          companyId,
          // prisma schema中 Routing.updatedAt 未标注 @updatedAt，创建时必须显式赋值
          updatedAt: new Date(),
          createdBy,
          updatedBy: createdBy,
        }
      });

      if (Array.isArray(operations) && operations.length > 0) {
        const payload = operations.map((op, idx) => ({
          routingId: createdRouting.id,
          workcenterId: op.workcenterId ?? undefined,
          operationId: op.operationId,
          name: op.name,
          sequence: Number(op.sequence ?? (idx + 1) * 10),
          timeMode: op.timeMode,
          timeCycleManual: op.timeCycleManual,
          batch: op.batch,
          batchSize: op.batchSize,
          worksheetType: op.worksheetType ?? undefined,
          worksheetLink: op.worksheetLink ?? undefined,
          description: op.description ?? undefined,
        }));
        if (payload.length > 0) {
          await tx.routingWorkcenter.createMany({ data: payload });
        }
      }

      return createdRouting;
    });

    return this.formatRouting(routing);
  }

  /**
   * 获取工艺路线列表
   */
  async getRoutings(params: RoutingQueryParams): Promise<RoutingListResponse> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      active,
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

    if (active !== undefined) {
      where.active = active;
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 查询数据
    const [routings, total] = await Promise.all([
      this.prisma.routing.findMany({
        where,
        orderBy,
        skip,
        take
      }),
      this.prisma.routing.count({ where })
    ]);

    const formattedRoutings = routings.map(routing => this.formatRouting(routing));

    return {
      data: formattedRoutings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 根据ID获取工艺路线
   */
  async getRoutingById(id: string): Promise<RoutingInfo | null> {
    const routing = await this.prisma.routing.findUnique({
      where: { id }
    });

    if (!routing) {
      return null;
    }

    return this.formatRouting(routing);
  }

  /**
   * 根据编码获取工艺路线
   */
  async getRoutingByCode(code: string): Promise<RoutingInfo | null> {
    const routing = await this.prisma.routing.findUnique({
      where: { code }
    });

    if (!routing) {
      return null;
    }

    return this.formatRouting(routing);
  }

  /**
   * 更新工艺路线
   */
  async updateRouting(id: string, data: UpdateRoutingRequest, updatedBy: string): Promise<RoutingInfo> {
    const { name, code, description, active, companyId, operations } = data;

    // 检查工艺路线是否存在
    const existingRouting = await this.prisma.routing.findUnique({
      where: { id }
    });

    if (!existingRouting) {
      throw new AppError('Routing not found', 404, 'ROUTING_NOT_FOUND');
    }

    // 如果编码被修改，检查新编码是否已存在
    if (code && code !== existingRouting.code) {
      const routingWithCode = await this.prisma.routing.findUnique({
        where: { code }
      });

      if (routingWithCode) {
        throw new AppError('Routing code already exists', 400, 'ROUTING_CODE_EXISTS');
      }
    }

    // 在事务中更新工艺路线，并在提供 operations 时进行全量替换
    const routing = await this.prisma.$transaction(async (tx) => {
      const updatedRouting = await tx.routing.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(code && { code }),
          ...(description !== undefined && { description }),
          ...(active !== undefined && { active }),
          ...(companyId !== undefined && { companyId }),
          updatedBy,
          updatedAt: new Date()
        }
      });

      if (Array.isArray(operations)) {
        // 全量替换：先删除现有工序，再插入新的工序
        await tx.routingWorkcenter.deleteMany({ where: { routingId: id } });
        if (operations.length > 0) {
          const payload = operations.map((op, idx) => ({
            routingId: id,
            workcenterId: op.workcenterId ?? undefined,
            operationId: op.operationId,
            name: op.name,
            sequence: Number(op.sequence ?? (idx + 1) * 10),
            timeMode: op.timeMode,
            timeCycleManual: op.timeCycleManual,
            batch: op.batch,
            batchSize: op.batchSize,
            worksheetType: op.worksheetType ?? undefined,
            worksheetLink: op.worksheetLink ?? undefined,
            description: op.description ?? undefined,
          }));
          if (payload.length > 0) {
            await tx.routingWorkcenter.createMany({ data: payload });
          }
        }
      }

      return updatedRouting;
    });

    return this.formatRouting(routing);
  }

  /**
   * 删除工艺路线
   */
  async deleteRouting(id: string): Promise<void> {
    // 检查工艺路线是否存在
    const routing = await this.prisma.routing.findUnique({
      where: { id }
    });

    if (!routing) {
      throw new AppError('Routing not found', 404, 'ROUTING_NOT_FOUND');
    }

    // 检查是否有BOM引用了该工艺路线
    const bomCount = await this.prisma.productBom.count({
      where: { routingId: id }
    });

    if (bomCount > 0) {
      throw new AppError('Cannot delete routing that is referenced by BOMs', 400, 'ROUTING_IN_USE');
    }

    // 删除工艺路线
    await this.prisma.routing.delete({
      where: { id }
    });
  }

  /**
   * 获取工艺路线的工序列表
   */
  async getRoutingOperations(routingId: string): Promise<RoutingWorkcenterInfo[]> {
    const operations = await this.prisma.routingWorkcenter.findMany({
      where: { routingId },
      orderBy: { sequence: 'asc' },
      include: {
        operation: true,
        workcenter: true,
      },
    });

    return operations.map((op: any) => this.formatRoutingWorkcenter(op));
  }

  /**
   * 切换工艺路线状态
   */
  async toggleRoutingStatus(id: string, updatedBy: string): Promise<RoutingInfo> {
    // 检查工艺路线是否存在
    const routing = await this.prisma.routing.findUnique({
      where: { id }
    });

    if (!routing) {
      throw new AppError('Routing not found', 404, 'ROUTING_NOT_FOUND');
    }

    const newStatus = !routing.active;

    // 更新状态
    const updatedRouting = await this.prisma.routing.update({
      where: { id },
      data: {
        active: newStatus,
        updatedBy,
        updatedAt: new Date()
      }
    });

    return this.formatRouting(updatedRouting);
  }

  /**
   * 获取工艺路线选项
   */
  async getRoutingOptions(params?: { 
    active?: boolean 
  }): Promise<Array<{value: string, label: string, code: string}>> {
    const where: any = {};
    
    if (params?.active !== undefined) {
      where.active = params.active;
    }

    const routings = await this.prisma.routing.findMany({
      where,
      orderBy: [
        { code: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        code: true,
        active: true
      }
    });

    return routings.map(routing => ({
      value: routing.id,
      label: routing.name,
      code: routing.code
    }));
  }

  /**
   * 验证工艺路线编码
   */
  async validateRoutingCode(code: string, excludeId?: string): Promise<RoutingValidateCodeResponse> {
    if (!code) {
      return {
        isValid: false,
        isUnique: false,
        message: 'Code is required'
      };
    }

    // 检查编码是否已存在
    const existingRouting = await this.prisma.routing.findUnique({
      where: { code }
    });

    const isUnique = !existingRouting || (excludeId !== undefined && existingRouting.id === excludeId);
    
    return {
      isValid: true,
      isUnique,
      message: isUnique ? 'Code is available' : 'Code already exists'
    };
  }

  /**
   * 格式化工艺路线数据
   */
  private formatRouting(routing: any): RoutingInfo {
    return {
      id: routing.id,
      name: routing.name,
      code: routing.code,
      active: routing.active,
      description: routing.description,
      companyId: routing.companyId,
      createdAt: routing.createdAt.toISOString(),
      updatedAt: routing.updatedAt.toISOString(),
      createdBy: routing.createdBy,
      updatedBy: routing.updatedBy,
      version: 1 // Prisma schema中没有version字段，这里设置默认值
    };
  }

  /**
   * 格式化工艺路线工序数据
   */
  private formatRoutingWorkcenter(rwc: any): RoutingWorkcenterInfo {
    return {
      id: rwc.id,
      routingId: rwc.routingId!,
      workcenterId: rwc.workcenterId ?? '',
      operationId: rwc.operationId,
      name: rwc.name,
      sequence: rwc.sequence,
      timeMode: rwc.timeMode,
      timeCycleManual: rwc.timeCycleManual,
      wageRate: rwc.operation?.wageRate ?? 0,
      batch: rwc.batch,
      batchSize: rwc.batchSize,
      worksheetType: rwc.worksheetType ?? undefined,
      worksheetLink: rwc.worksheetLink ?? undefined,
      description: rwc.description ?? undefined,
      // Prisma 模型未提供以下时间戳，前端类型已标记为可选
      // createdAt: undefined,
      // updatedAt: undefined,
    };
  }
}

export const routingService = new RoutingService();