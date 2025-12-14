import { PrismaClient, Defect } from '@prisma/client';
import { BaseService } from '../../../shared/services/base.service';
import { AppError } from '../../../shared/middleware/error';

const prisma = new PrismaClient();

export class DefectService extends BaseService {
  constructor() {
    super();
  }

  /**
   * 获取不良品项列表（支持分页和搜索）
   */
  async getDefects(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    isActive?: boolean;
  }) {
    const { skip, take, page, pageSize } = this.getPaginationConfig(
      params.page,
      params.pageSize
    );

    const where: any = {};

    if (params.keyword) {
      where.OR = [
        { code: { contains: params.keyword } },
        { name: { contains: params.keyword } },
      ];
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [data, total] = await Promise.all([
      prisma.defect.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.defect.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取所有启用的不良品项（供选择使用）
   */
  async getActiveDefects() {
    return prisma.defect.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * 生成不良品项编码
   * 格式：BLP + 年月日(8位) + 随机四位数
   * 例如：BLP202312011234
   */
  private generateCode(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    return `BLP${year}${month}${day}${random}`;
  }

  /**
   * 创建不良品项
   */
  async createDefect(data: {
    code?: string;
    name: string;
    description?: string;
    isActive?: boolean;
  }): Promise<Defect> {
    let code = data.code;

    // 如果未提供编码，则自动生成
    if (!code) {
      code = this.generateCode();
      // 确保生成的编码唯一
      let isUnique = false;
      while (!isUnique) {
        const existing = await prisma.defect.findUnique({
          where: { code },
        });
        if (!existing) {
          isUnique = true;
        } else {
          code = this.generateCode();
        }
      }
    } else {
      // 检查编码唯一性
      const existing = await prisma.defect.findUnique({
        where: { code },
      });

      if (existing) {
        throw new AppError('Defect code already exists', 400);
      }
    }

    return prisma.defect.create({
      data: {
        code,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
  }

  /**
   * 更新不良品项
   */
  async updateDefect(
    id: string,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
    }
  ): Promise<Defect> {
    const defect = await prisma.defect.findUnique({ where: { id } });
    if (!defect) {
      throw new AppError('Defect not found', 404);
    }

    return prisma.defect.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除不良品项
   */
  async deleteDefect(id: string): Promise<void> {
    // TODO: 检查引用关系，如果被引用则不允许删除
    await prisma.defect.delete({ where: { id } });
  }
}
