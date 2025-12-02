import { PrismaClient } from '@prisma/client';
import type { BomFormData, BomQueryParams } from '@shared/types/bom';
import type { User, JwtPayload } from '@shared/types/auth';

const prisma = new PrismaClient();

export class BomCrudService {
  /**
   * 创建BOM
   */
  async createBom(bomData: BomFormData, userPayload: JwtPayload) {
    try {
      // 验证必需字段（编码缺失时将自动生成）
      if (!bomData.name) {
        return { success: false, message: 'BOM名称不能为空' };
      }
      if (!bomData.productId && !bomData.variantId) {
        return { success: false, message: '产品ID或变体ID至少需要一个' };
      }
      if (!bomData.type) {
        // 缺少BOM类型时使用默认类型
        bomData.type = 'production' as any;
      }
      if (!bomData.version) {
        // 缺少版本时使用默认版本
        bomData.version = 'V1.0';
      }
      // 缺少状态时默认启用
      if (!bomData.status) {
        bomData.status = 'active' as any;
      }
      // 缺少基准数量时默认 1
      if (bomData.baseQuantity === undefined || bomData.baseQuantity === null) {
        bomData.baseQuantity = 1;
      }
      // 如果缺少基准单位，默认使用产品的单位
      if (!bomData.baseUnitId) {
        // 稍后在校验产品存在后填充，若产品无单位则报错
      }
      // 缺少生效日期时默认当前日期
      if (!bomData.effectiveDate) {
        bomData.effectiveDate = new Date();
      }
      
      // 处理日期字段
      let effectiveDate: Date;
      if (typeof bomData.effectiveDate === 'string') {
        effectiveDate = new Date(bomData.effectiveDate);
      } else if (bomData.effectiveDate instanceof Date) {
        effectiveDate = bomData.effectiveDate;
      } else {
        return { success: false, message: '生效日期格式不正确' };
      }
      
      let expiryDate: Date | null = null;
      if (bomData.expiryDate) {
        if (typeof bomData.expiryDate === 'string') {
          expiryDate = new Date(bomData.expiryDate);
        } else if (bomData.expiryDate instanceof Date) {
          expiryDate = bomData.expiryDate;
        } else {
          return { success: false, message: '失效日期格式不正确' };
        }
      }

      // 检查产品是否存在
      let productId = bomData.productId || '';
      if (bomData.variantId && !productId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: bomData.variantId } });
        if (!variant) {
          return { success: false, message: '变体不存在' };
        }
        productId = variant.productId;
      }
      const product = await prisma.product.findUnique({ where: { id: productId } });

      if (!product) {
        return { success: false, message: '产品不存在' };
      }

      // 默认基准单位为产品单位
      if (!bomData.baseUnitId) {
        if (!product.unitId) {
          return { success: false, message: '基准单位ID不能为空' };
        }
        bomData.baseUnitId = product.unitId;
      }

      // 生成或规范化BOM编码
      const normalizedCode = (bomData.code || '').trim();
      const code = normalizedCode || await this.generateBomCode(productId);

      // 检查BOM编码是否已存在
      const existingBom = await prisma.productBom.findUnique({
        where: { code }
      });

      if (existingBom) {
        return { success: false, message: 'BOM编码已存在' };
      }

      // 如果设置为默认BOM，需要将该产品的其他BOM设置为非默认
      if (bomData.isDefault) {
        await prisma.productBom.updateMany({
          where: bomData.variantId ? { variantId: bomData.variantId } : { productId },
          data: { isDefault: false }
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const created = await tx.productBom.create({
          data: {
            code,
            name: bomData.name,
            productId: productId,
            variantId: bomData.variantId || null,
            type: bomData.type || 'production',
            version: bomData.version,
            status: bomData.status || 'active',
            isDefault: bomData.isDefault || false,
            baseQuantity: bomData.baseQuantity ?? 1,
            baseUnitId: bomData.baseUnitId,
            routingId: bomData.routingId || null,
            effectiveDate: effectiveDate,
            expiryDate: expiryDate,
            description: bomData.description || null,
            remark: bomData.remark || null,
            createdBy: userPayload.userId.toString(),
            updatedBy: userPayload.userId.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        if (Array.isArray(bomData.items) && bomData.items.length > 0) {
          // 收集所有涉及的物料ID
          const materialIds = bomData.items
            .map((it: any) => it.materialId)
            .filter((id: any) => typeof id === 'string' && id);

          // 批量检查这些物料是否已有BOM定义（即是否为半成品）
          let hasBomMap = new Set<string>();
          if (materialIds.length > 0) {
            const boms = await prisma.productBom.groupBy({
              by: ['productId'],
              where: {
                productId: { in: materialIds },
                status: 'active'
              }
            });
            boms.forEach(b => hasBomMap.add(b.productId));
          }

          const items = bomData.items
            .filter((it: any) => it && (it.materialId || it.materialVariantId) && it.unitId && it.quantity != null)
            .map((it: any, i: number) => {
              // 强制校验：如果该物料有BOM，且未指定childBomId，则抛出错误
              if (it.materialId && hasBomMap.has(it.materialId) && !it.childBomId) {
                const materialInfo = it.materialCode ? `${it.materialCode} ${it.materialName || ''}` : `ID:${it.materialId}`;
                throw new Error(`物料 "${materialInfo}"（行 #${i + 1}）是半成品，请选择对应的子BOM版本`);
              }
              
              return {
                bomId: created.id,
                materialId: it.materialId ?? null,
                materialVariantId: it.materialVariantId ?? null,
                quantity: Number(it.quantity) || 0,
                unitId: it.unitId,
                sequence: typeof it.sequence === 'number' ? it.sequence : i + 1,
                requirementType: it.requirementType || 'fixed',
                isKey: !!it.isKey,
                isPhantom: !!it.isPhantom,
                processInfo: it.processInfo ?? null,
                remark: it.remark ?? null,
                scrapRate: it.scrapRate || 0,
                fixedScrap: it.fixedScrap || 0,
                effectiveDate: it.effectiveDate ? new Date(it.effectiveDate) : null,
                expiryDate: it.expiryDate ? new Date(it.expiryDate) : null,
                childBomId: it.childBomId ?? null,
                createdBy: userPayload.userId.toString(),
                updatedBy: userPayload.userId.toString(),
                createdAt: new Date(),
                updatedAt: new Date()
              };
            });

          if (items.length > 0) {
            await tx.productBomItem.createMany({ data: items });
          }
        }
        return created;
      });

      return { success: true, data: result, message: 'BOM创建成功' };
    } catch (error: any) {
      console.error('创建BOM失败:', error);
      return { success: false, message: error.message || '创建BOM失败' };
    }
  }

  /**
   * 生成唯一的BOM编码（基于产品编码的递增序列）
   * 示例：产品编码为 P0001，则BOM编码为 BP00010001、BP00010002 ...
   */
  private async generateBomCode(productId: string): Promise<string> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { code: true }
    });

    const productCode = product?.code || 'P0000';
    const prefix = `B${productCode}`;

    // 查找当前前缀下最大的编码
    const lastBom = await prisma.productBom.findFirst({
      where: {
        code: {
          startsWith: prefix
        }
      },
      orderBy: { code: 'desc' }
    });

    let nextNumber = 1;
    if (lastBom) {
      const match = lastBom.code.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // 如果碰巧生成的编码已存在（极端并发场景），循环加1直到唯一
    // 通常findUnique检查即可，但这里加一层保护
    let candidate = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    // 最多尝试100次，避免死循环
    for (let i = 0; i < 100; i++) {
      const exists = await prisma.productBom.findUnique({ where: { code: candidate } });
      if (!exists) return candidate;
      nextNumber++;
      candidate = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    // 兜底返回时间戳编码，理论上不会到达这里
    return `${prefix}${Date.now()}`;
  }

  /**
   * 获取BOM列表
   */
  async getBoms(query: BomQueryParams) {
    try {
      const { page = 1, pageSize = 20, keyword, productId, variantId, type, status, version, isDefault, routingId } = query as any;
      // 兼容 req.query 的字符串类型，统一转换为数字
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
      const pageSizeNum = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
      const safePage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
      const safePageSize = Number.isFinite(pageSizeNum) && pageSizeNum > 0 ? pageSizeNum : 20;
      
      const where: any = {};
      
      if (keyword) {
        where.OR = [
          { name: { contains: keyword } },
          { code: { contains: keyword } }
        ];
      }
      
      if (productId) where.productId = productId;
      if (variantId) where.variantId = variantId;
      if (type) where.type = type;
      if (status) where.status = status;
      if (version) where.version = version;
      if (isDefault !== undefined) where.isDefault = isDefault;
      if (routingId) where.routingId = routingId;

      const [data, total] = await Promise.all([
        prisma.productBom.findMany({
          where,
          skip: (safePage - 1) * safePageSize,
          take: safePageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                code: true,
                name: true
              }
            },
            variant: {
              select: {
                code: true,
                name: true
              }
            },
            baseUnit: {
              select: {
                name: true,
                symbol: true
              }
            },
            routing: {
              select: {
                code: true,
                name: true
              }
            }
          }
        }),
        prisma.productBom.count({ where })
      ]);

      const ids = data.map(d => d.id);
      const groups = ids.length > 0 ? await prisma.productBomItem.groupBy({
        by: ['bomId'],
        where: { bomId: { in: ids }, childBomId: { not: null } },
        _count: { _all: true }
      }) : [];
      const countMap = new Map<string, number>(groups.map(g => [g.bomId as string, (g._count as any)._all as number]));
      const enriched = data.map(d => ({ ...d, childBomCount: countMap.get(d.id) ?? 0 }));

      const totalPages = Math.ceil(total / safePageSize);

      return {
        success: true,
        // 按前端约定返回统一分页结构：data 包含 data 数组与分页信息
        data: {
          data: enriched,
          total,
          page: safePage,
          pageSize: safePageSize,
          totalPages
        }
      };
    } catch (error) {
      console.error('获取BOM列表失败:', error);
      return { success: false, message: '获取BOM列表失败' };
    }
  }

  /**
   * 检查BOM编码是否可用
   */
  async isBomCodeAvailable(code: string) {
    try {
      const existingBom = await prisma.productBom.findUnique({
        where: { code }
      });

      return {
        success: true,
        data: { available: !existingBom }
      };
    } catch (error) {
      console.error('检查BOM编码失败:', error);
      return { success: false, message: '检查BOM编码失败' };
    }
  }

  /**
   * 根据编码获取BOM
   */
  async getBomByCode(code: string) {
    try {
      const bom = await prisma.productBom.findUnique({
        where: { code }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      return { success: true, data: bom };
    } catch (error) {
      console.error('获取BOM失败:', error);
      return { success: false, message: '获取BOM失败' };
    }
  }

  /**
   * 根据ID获取BOM
   */
  async getBomById(id: string) {
    try {
      const bom = await prisma.productBom.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              code: true,
              name: true
            }
          },
          baseUnit: {
            select: {
              name: true,
              symbol: true
            }
          },
          routing: {
            select: {
              code: true,
              name: true
            }
          },
          items: {
            include: {
              material: true,
              unit: true,
              childBom: true
            },
            orderBy: { sequence: 'asc' }
          }
        }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      return { success: true, data: bom };
    } catch (error) {
      console.error('获取BOM详情失败:', error);
      return { success: false, message: '获取BOM详情失败' };
    }
  }

  /**
   * 更新BOM
   */
  async updateBom(id: string, bomData: BomFormData, user: User) {
    try {
      // 检查BOM是否存在
      const existingBom = await prisma.productBom.findUnique({
        where: { id }
      });

      if (!existingBom) {
        return { success: false, message: 'BOM不存在' };
      }

      // 如果修改了编码，检查新编码是否已存在
      if (bomData.code && bomData.code !== existingBom.code) {
        const codeExists = await prisma.productBom.findUnique({
          where: { code: bomData.code }
        });

        if (codeExists) {
          return { success: false, message: 'BOM编码已存在' };
        }
      }

      // 处理日期字段
      let effectiveDate: Date | undefined;
      if (bomData.effectiveDate) {
        if (typeof bomData.effectiveDate === 'string') {
          effectiveDate = new Date(bomData.effectiveDate);
        } else if (bomData.effectiveDate instanceof Date) {
          effectiveDate = bomData.effectiveDate;
        }
      }

      let expiryDate: Date | null = null;
      if (bomData.expiryDate) {
        if (typeof bomData.expiryDate === 'string') {
          expiryDate = new Date(bomData.expiryDate);
        } else if (bomData.expiryDate instanceof Date) {
          expiryDate = bomData.expiryDate;
        }
      }

      // 如果设置为默认BOM，需要将该产品的其他BOM设置为非默认
      if (bomData.isDefault && bomData.productId) {
        await prisma.productBom.updateMany({
          where: { 
            productId: bomData.productId,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }

      const updatedBom = await prisma.$transaction(async (tx) => {
        const updated = await tx.productBom.update({
          where: { id },
          data: {
            ...(bomData.code && { code: bomData.code }),
            ...(bomData.name && { name: bomData.name }),
            ...(bomData.productId && { productId: bomData.productId }),
            ...(bomData.type && { type: bomData.type }),
            ...(bomData.version && { version: bomData.version }),
            ...(bomData.status && { status: bomData.status }),
            ...(bomData.isDefault !== undefined && { isDefault: bomData.isDefault }),
            ...(bomData.baseQuantity !== undefined && { baseQuantity: bomData.baseQuantity }),
            ...(bomData.baseUnitId && { baseUnitId: bomData.baseUnitId }),
            ...(bomData.routingId !== undefined && { routingId: bomData.routingId }),
            ...(effectiveDate && { effectiveDate }),
            ...(expiryDate !== undefined && { expiryDate }),
            ...(bomData.description !== undefined && { description: bomData.description }),
            ...(bomData.remark !== undefined && { remark: bomData.remark }),
            updatedBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
            updatedAt: new Date()
          }
        });

        if (Array.isArray((bomData as any).items)) {
          // 收集所有涉及的物料ID
          const materialIds = (bomData as any).items
            .map((it: any) => it.materialId)
            .filter((id: any) => typeof id === 'string' && id);

          // 批量检查这些物料是否已有BOM定义（即是否为半成品）
          let hasBomMap = new Set<string>();
          if (materialIds.length > 0) {
            const boms = await prisma.productBom.groupBy({
              by: ['productId'],
              where: {
                productId: { in: materialIds },
                status: 'active'
              }
            });
            boms.forEach(b => hasBomMap.add(b.productId));
          }

          await tx.productBomItem.deleteMany({ where: { bomId: id } });
          const items = (bomData as any).items
            .filter((it: any) => it && (it.materialId || it.materialVariantId) && it.unitId && it.quantity != null)
            .map((it: any, i: number) => {
              // 强制校验：如果该物料有BOM，且未指定childBomId，则抛出错误
              if (it.materialId && hasBomMap.has(it.materialId) && !it.childBomId) {
                const materialInfo = it.materialCode ? `${it.materialCode} ${it.materialName || ''}` : `ID:${it.materialId}`;
                throw new Error(`物料 "${materialInfo}"（行 #${i + 1}）是半成品，请选择对应的子BOM版本`);
              }

              return {
                bomId: id,
                materialId: it.materialId ?? null,
                materialVariantId: it.materialVariantId ?? null,
                quantity: Number(it.quantity) || 0,
                unitId: it.unitId,
                sequence: typeof it.sequence === 'number' ? it.sequence : i + 1,
                requirementType: it.requirementType || 'fixed',
                isKey: !!it.isKey,
                isPhantom: !!it.isPhantom,
                processInfo: it.processInfo ?? null,
                remark: it.remark ?? null,
                scrapRate: it.scrapRate || 0,
                fixedScrap: it.fixedScrap || 0,
                effectiveDate: it.effectiveDate ? new Date(it.effectiveDate) : null,
                expiryDate: it.expiryDate ? new Date(it.expiryDate) : null,
                childBomId: it.childBomId ?? null,
                createdBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
                updatedBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
                createdAt: new Date(),
                updatedAt: new Date()
              };
            });
          if (items.length > 0) {
            await tx.productBomItem.createMany({ data: items });
          }
        }

        return updated;
      });

      return { success: true, data: updatedBom, message: 'BOM更新成功' };
    } catch (error: any) {
      console.error('更新BOM失败:', error);
      return { success: false, message: error.message || '更新BOM失败' };
    }
  }

  /**
   * 删除BOM
   */
  async deleteBom(id: string) {
    try {
      // 检查BOM是否存在
      const existingBom = await prisma.productBom.findUnique({
        where: { id },
        include: {
          items: true
        }
      });

      if (!existingBom) {
        return { success: false, message: 'BOM不存在' };
      }

      // 不做校验，直接允许删除：
      // 为避免外键约束错误，先解除外部引用并删除本BOM的物料项，再删除BOM本身。
      await prisma.$transaction([
        // 解除其他BOM物料项对本BOM的子BOM引用
        prisma.productBomItem.updateMany({
          where: { childBomId: id },
          data: { childBomId: null }
        }),
        // 删除本BOM下的所有物料项
        prisma.productBomItem.deleteMany({
          where: { bomId: id }
        }),
        // 删除BOM本身
        prisma.productBom.delete({
          where: { id }
        })
      ]);

      return { success: true, message: 'BOM删除成功' };
    } catch (error) {
      console.error('删除BOM失败:', error);
      return { success: false, message: '删除BOM失败' };
    }
  }
}
