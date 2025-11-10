/**
 * 工作中心服务
 */

import { 
  WorkcenterInfo,
  CreateWorkcenterRequest,
  UpdateWorkcenterRequest,
  WorkcenterQueryParams,
  WorkcenterListResponse
} from '@zyerp/shared';
import { AppError } from '../../../shared/middleware/error';
import { BaseService } from '../../../shared/services/base.service';

export class WorkcenterService extends BaseService {
  /**
   * 创建工作中心
   */
  async createWorkcenter(data: CreateWorkcenterRequest, createdBy: string): Promise<WorkcenterInfo> {
    const {
      code,
      name,
      type,
      description,
      companyId,
      capacity,
      timeEfficiency,
      oeeTarget,
      // 可选通用字段
      timeStart,
      timeStop,
      costsHour,
      costsHourEmployee,
      // 车间特有字段
      teamSize,
      skillLevel,
      shiftPattern,
      managerId,
      // 设备特有字段
      equipmentId,
      maintenanceCycle,
      // 层级关系与状态
      parentId,
      active,
    } = data;

    // 检查工作中心编码是否已存在
    const existingWorkcenterWithCode = await this.prisma.workcenter.findUnique({
      where: { code }
    });

    if (existingWorkcenterWithCode) {
      throw new AppError('Workcenter code already exists', 400, 'WORKCENTER_CODE_EXISTS');
    }

    // 创建工作中心
    const workcenter = await this.prisma.workcenter.create({
      data: {
        code,
        name,
        type: type || null,
        description: description || null,
        companyId: companyId || null,
        capacity: capacity !== undefined ? capacity : 1,
        timeEfficiency: timeEfficiency !== undefined ? timeEfficiency : 100,
        oeeTarget: oeeTarget !== undefined ? oeeTarget : 90,
        // 可选通用字段（提供则写入，否则使用默认值）
        ...(timeStart !== undefined && { timeStart }),
        ...(timeStop !== undefined && { timeStop }),
        ...(costsHour !== undefined && { costsHour }),
        ...(costsHourEmployee !== undefined && { costsHourEmployee }),
        // 车间特有字段
        ...(teamSize !== undefined && { teamSize }),
        ...(skillLevel !== undefined && { skillLevel }),
        ...(shiftPattern !== undefined && { shiftPattern }),
        ...(managerId !== undefined && { managerId }),
        // 设备特有字段
        ...(equipmentId !== undefined && { equipmentId }),
        ...(maintenanceCycle !== undefined && { maintenanceCycle }),
        // 层级关系与状态
        ...(parentId !== undefined && { parentId }),
        active: active ?? true,
        createdBy,
        updatedBy: createdBy,
      },
      include: {
        manager: true,
        parent: true,
      }
    });

    return this.formatWorkcenter(workcenter);
  }

  /**
   * 获取工作中心列表
   */
  async getWorkcenters(params: WorkcenterQueryParams): Promise<WorkcenterListResponse> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      active,
      type,
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

    if (type) {
      where.type = type;
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 查询数据
    const [workcenters, total] = await Promise.all([
      this.prisma.workcenter.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          manager: true,
          parent: true
        }
      }),
      this.prisma.workcenter.count({ where })
    ]);

    const formattedWorkcenters = workcenters.map(workcenter => this.formatWorkcenter(workcenter));

    return {
      data: formattedWorkcenters,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 根据ID获取工作中心
   */
  async getWorkcenterById(id: string): Promise<WorkcenterInfo | null> {
    const workcenter = await this.prisma.workcenter.findUnique({
      where: { id },
      include: {
        manager: true,
        parent: true
      }
    });

    if (!workcenter) {
      return null;
    }

    return this.formatWorkcenter(workcenter);
  }

  /**
   * 根据编码获取工作中心
   */
  async getWorkcenterByCode(code: string): Promise<WorkcenterInfo | null> {
    const workcenter = await this.prisma.workcenter.findUnique({
      where: { code },
      include: {
        manager: true,
        parent: true
      }
    });

    if (!workcenter) {
      return null;
    }

    return this.formatWorkcenter(workcenter);
  }

  /**
   * 更新工作中心
   */
  async updateWorkcenter(id: string, data: UpdateWorkcenterRequest, updatedBy: string): Promise<WorkcenterInfo> {
    const { 
      code, 
      name, 
      type, 
      description, 
      companyId, 
      capacity, 
      timeEfficiency, 
      oeeTarget, 
      active,
      teamSize,
      skillLevel,
      shiftPattern,
      managerId,
      equipmentId,
      maintenanceCycle
    } = data;

    // 检查工作中心是否存在
    const existingWorkcenter = await this.prisma.workcenter.findUnique({
      where: { id }
    });

    if (!existingWorkcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    // 如果编码被修改，检查新编码是否已存在
    if (code && code !== existingWorkcenter.code) {
      const workcenterWithCode = await this.prisma.workcenter.findUnique({
        where: { code }
      });

      if (workcenterWithCode) {
        throw new AppError('Workcenter code already exists', 400, 'WORKCENTER_CODE_EXISTS');
      }
    }

    // 更新工作中心
    const workcenter = await this.prisma.workcenter.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
        ...(companyId !== undefined && { companyId }),
        ...(capacity !== undefined && { capacity }),
        ...(timeEfficiency !== undefined && { timeEfficiency }),
        ...(oeeTarget !== undefined && { oeeTarget }),
        ...(active !== undefined && { active }),
        ...(teamSize !== undefined && { teamSize }),
        ...(skillLevel !== undefined && { skillLevel }),
        ...(shiftPattern !== undefined && { shiftPattern }),
        ...(managerId !== undefined && { managerId }),
        ...(equipmentId !== undefined && { equipmentId }),
        ...(maintenanceCycle !== undefined && { maintenanceCycle }),
        updatedBy,
        updatedAt: new Date()
      },
      include: {
        manager: true,
        parent: true
      }
    });

    return this.formatWorkcenter(workcenter);
  }

  /**
   * 删除工作中心
   */
  async deleteWorkcenter(id: string): Promise<void> {
    // 检查工作中心是否存在
    const workcenter = await this.prisma.workcenter.findUnique({
      where: { id }
    });

    if (!workcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    // 检查是否有工艺路线作业引用了该工作中心
    const routingWorkcenterCount = await this.prisma.routingWorkcenter.count({
      where: { workcenterId: id }
    });

    if (routingWorkcenterCount > 0) {
      throw new AppError('Cannot delete workcenter that is referenced by routing workcenters', 400, 'WORKCENTER_IN_USE');
    }

    // 删除工作中心
    await this.prisma.workcenter.delete({
      where: { id }
    });
  }

  /**
   * 切换工作中心状态
   */
  async toggleWorkcenterStatus(id: string, updatedBy: string): Promise<WorkcenterInfo> {
    // 检查工作中心是否存在
    const workcenter = await this.prisma.workcenter.findUnique({
      where: { id }
    });

    if (!workcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    const newStatus = !workcenter.active;

    // 更新状态
    const updatedWorkcenter = await this.prisma.workcenter.update({
      where: { id },
      data: {
        active: newStatus,
        updatedBy,
        updatedAt: new Date()
      },
      include: {
        manager: true,
        parent: true
      }
    });

    return this.formatWorkcenter(updatedWorkcenter);
  }

  /**
   * 获取工作中心选项列表
   */
  async getWorkcenterOptions(params?: { 
    active?: boolean,
    type?: string
  }): Promise<Array<{value: string, label: string, code: string, type?: string}>> {
    const where: any = {};
    
    if (params?.active !== undefined) {
      where.active = params.active;
    }

    if (params?.type) {
      where.type = params.type;
    }

    const workcenters = await this.prisma.workcenter.findMany({
      where,
      orderBy: [
        { code: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        active: true
      }
    });

    return workcenters.map(workcenter => ({
      value: workcenter.id,
      label: workcenter.name,
      code: workcenter.code,
      type: workcenter.type || undefined
    }));
  }

  /**
   * 验证工作中心编码
   */
  async validateWorkcenterCode(code: string, excludeId?: string): Promise<{ isValid: boolean; isUnique: boolean; message?: string }> {
    if (!code) {
      return {
        isValid: false,
        isUnique: false,
        message: 'Code is required'
      };
    }

    // 检查编码是否已存在
    const existingWorkcenter = await this.prisma.workcenter.findUnique({
      where: { code }
    });

    // 保证布尔类型，不引入 string | undefined 的联合类型
    const isUnique = !existingWorkcenter || (excludeId ? existingWorkcenter.id === excludeId : false);
    
    return {
      isValid: true,
      isUnique,
      message: isUnique ? 'Code is available' : 'Code already exists'
    };
  }

  /**
   * 更新车间成员
   */
  async updateTeamMembers(id: string, memberIds: string[], updatedBy: string): Promise<WorkcenterInfo> {
    // 检查工作中心是否存在
    const workcenter = await this.prisma.workcenter.findUnique({
      where: { id }
    });

    if (!workcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    // 更新车间成员
    const updatedWorkcenter = await this.prisma.workcenter.update({
      where: { id },
      data: {
        teamMembers: memberIds.length > 0 ? JSON.stringify(memberIds) : null,
        teamSize: memberIds.length,
        updatedBy,
        updatedAt: new Date()
      },
      include: {
        manager: true,
        parent: true
      }
    });

    return this.formatWorkcenter(updatedWorkcenter);
  }

  /**
   * 获取车间成员
   */
  async getTeamMembers(id: string): Promise<any[]> {
    // 检查工作中心是否存在
    const workcenter = await this.prisma.workcenter.findUnique({
      where: { id }
    });

    if (!workcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    if (workcenter.teamMembers) {
      try {
        return JSON.parse(workcenter.teamMembers);
      } catch (error) {
        return [];
      }
    }

    return [];
  }

  /**
   * 更新排班信息
   */
  async updateShiftSchedule(id: string, schedule: any, updatedBy: string): Promise<WorkcenterInfo> {
    // 检查工作中心是否存在
    const workcenter = await this.prisma.workcenter.findUnique({
      where: { id }
    });

    if (!workcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    // 更新排班信息
    const updatedWorkcenter = await this.prisma.workcenter.update({
      where: { id },
      data: {
        shiftSchedule: schedule ? JSON.stringify(schedule) : null,
        updatedBy,
        updatedAt: new Date()
      },
      include: {
        manager: true,
        parent: true
      }
    });

    return this.formatWorkcenter(updatedWorkcenter);
  }

  /**
   * 获取排班信息
   */
  async getShiftSchedule(id: string): Promise<any> {
    // 检查工作中心是否存在
    const workcenter = await this.prisma.workcenter.findUnique({
      where: { id }
    });

    if (!workcenter) {
      throw new AppError('Workcenter not found', 404, 'WORKCENTER_NOT_FOUND');
    }

    if (workcenter.shiftSchedule) {
      try {
        return JSON.parse(workcenter.shiftSchedule);
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  /**
   * 格式化工作中心数据
   */
  private formatWorkcenter(workcenter: any): WorkcenterInfo {
    return {
      id: workcenter.id,
      code: workcenter.code,
      name: workcenter.name,
      type: workcenter.type || undefined,
      active: workcenter.active,
      description: workcenter.description || undefined,
      companyId: workcenter.companyId || undefined,
      capacity: workcenter.capacity,
      timeEfficiency: workcenter.timeEfficiency,
      oeeTarget: workcenter.oeeTarget,
      timeStart: workcenter.timeStart,
      timeStop: workcenter.timeStop,
      costsHour: workcenter.costsHour,
      costsHourEmployee: workcenter.costsHourEmployee,
      teamSize: workcenter.teamSize || undefined,
      skillLevel: workcenter.skillLevel || undefined,
      shiftPattern: workcenter.shiftPattern || undefined,
      teamMembers: workcenter.teamMembers || undefined,
      shiftSchedule: workcenter.shiftSchedule || undefined,
      managerId: workcenter.managerId || undefined,
      equipmentId: workcenter.equipmentId || undefined,
      maintenanceCycle: workcenter.maintenanceCycle || undefined,
      parentId: workcenter.parentId || undefined,
      manager: workcenter.manager ? {
        id: workcenter.manager.id,
        username: workcenter.manager.username,
        email: workcenter.manager.email
      } : undefined,
      parent: workcenter.parent ? {
        id: workcenter.parent.id,
        code: workcenter.parent.code,
        name: workcenter.parent.name
      } : undefined,
      createdAt: workcenter.createdAt.toISOString(),
      updatedAt: workcenter.updatedAt.toISOString(),
      createdBy: workcenter.createdBy,
      updatedBy: workcenter.updatedBy
    };
  }
}

export const workcenterService = new WorkcenterService();