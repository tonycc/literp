import { PrismaClient } from '@prisma/client';
import type { BomItemFormData } from '@shared/types/bom';
import type { User } from '@shared/types/auth';

const prisma = new PrismaClient();

export class BomItemService {
  /**
   * 获取BOM物料项列表
   */
  async getBomItems(bomId: string) {
    try {
      const items = await prisma.productBomItem.findMany({
        where: { bomId },
        orderBy: [
          { sequence: 'asc' }
        ],
        include: {
          material: {
            select: {
              code: true,
              name: true,
              specification: true
            }
          },
          materialVariant: {
            select: {
              code: true,
              name: true
            }
          },
          unit: {
            select: {
              name: true,
              symbol: true
            }
          },
          childBom: {
            select: {
              id: true,
              code: true,
              name: true
            }
          }
        }
      });

      const formattedItems = items.map(item => ({
        ...item,
        materialCode: item.material?.code,
        materialName: item.material?.name,
        materialSpec: item.material?.specification,
        materialVariantCode: item.materialVariant?.code,
        materialVariantName: item.materialVariant?.name,
        unitName: item.unit?.name
      }));

      return { success: true, data: formattedItems };
    } catch (error) {
      console.error('获取BOM物料项失败:', error);
      return { success: false, message: '获取BOM物料项失败', data: [] };
    }
  }

  /**
   * 添加BOM物料项
   */
  async addBomItem(bomId: string, itemData: BomItemFormData, user: User) {
    try {
      // 检查BOM是否存在
      const bom = await prisma.productBom.findUnique({
        where: { id: bomId }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      // 检查物料是否存在（产品或变体至少一个）
      if (itemData.materialVariantId) {
        const mv = await prisma.productVariant.findUnique({ where: { id: itemData.materialVariantId } });
        if (!mv) {
          return { success: false, message: '物料变体不存在' };
        }
      } else if (itemData.materialId) {
        const material = await prisma.product.findUnique({
          where: { id: itemData.materialId }
        });

        if (!material) {
          return { success: false, message: '物料不存在' };
        }
      } else {
        return { success: false, message: '物料或物料变体必须至少选择一个' };
      }

      // 检查单位是否存在
      if (itemData.unitId) {
        const unit = await prisma.unit.findUnique({
          where: { id: itemData.unitId }
        });

        if (!unit) {
          return { success: false, message: '单位不存在' };
        }
      }

      // 处理日期字段
      let effectiveDate: Date | null = null;
      if (itemData.effectiveDate) {
        if (typeof itemData.effectiveDate === 'string') {
          effectiveDate = new Date(itemData.effectiveDate);
        } else if (itemData.effectiveDate instanceof Date) {
          effectiveDate = itemData.effectiveDate;
        }
      }

      let expiryDate: Date | null = null;
      if (itemData.expiryDate) {
        if (typeof itemData.expiryDate === 'string') {
          expiryDate = new Date(itemData.expiryDate);
        } else if (itemData.expiryDate instanceof Date) {
          expiryDate = itemData.expiryDate;
        }
      }

      const item = await prisma.$transaction(async (tx) => {
        const currentMax = await tx.productBomItem.aggregate({
          where: { bomId },
          _max: { sequence: true }
        });
        const desiredSeq = typeof itemData.sequence === 'number' && itemData.sequence > 0
          ? itemData.sequence
          : (currentMax._max.sequence ?? 0) + 1;

        await tx.productBomItem.updateMany({
          where: { bomId, sequence: { gte: desiredSeq } },
          data: { sequence: { increment: 1 } as any }
        });

        const created = await tx.productBomItem.create({
          data: {
            bomId: bomId,
            materialId: itemData.materialId || '',
            materialVariantId: itemData.materialVariantId || null,
            quantity: itemData.quantity || 0,
            unitId: itemData.unitId || '',
            sequence: desiredSeq,
            requirementType: itemData.requirementType || 'fixed',
            isKey: itemData.isKey || false,
            isPhantom: itemData.isPhantom || false,
            processInfo: itemData.processInfo || null,
            remark: itemData.remark || null,
            scrapRate: itemData.scrapRate || 0,
            fixedScrap: itemData.fixedScrap || 0,
            effectiveDate: effectiveDate,
            expiryDate: expiryDate,
            childBomId: itemData.childBomId || null,
            createdBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
            updatedBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        return created;
      });

      return { success: true, data: item, message: '物料项添加成功' };
    } catch (error) {
      console.error('添加BOM物料项失败:', error);
      return { success: false, message: '添加BOM物料项失败' };
    }
  }

  /**
   * 更新BOM物料项
   */
  async updateBomItem(itemId: string, itemData: BomItemFormData, user: User) {
    try {
      // 检查物料项是否存在
      const existingItem = await prisma.productBomItem.findUnique({
        where: { id: itemId }
      });

      if (!existingItem) {
        return { success: false, message: '物料项不存在' };
      }

      // 检查物料是否存在
      if (itemData.materialVariantId) {
        const mv = await prisma.productVariant.findUnique({ where: { id: itemData.materialVariantId } });
        if (!mv) {
          return { success: false, message: '物料变体不存在' };
        }
      } else if (itemData.materialId) {
        const material = await prisma.product.findUnique({
          where: { id: itemData.materialId }
        });

        if (!material) {
          return { success: false, message: '物料不存在' };
        }
      }

      // 检查单位是否存在
      if (itemData.unitId) {
        const unit = await prisma.unit.findUnique({
          where: { id: itemData.unitId }
        });

        if (!unit) {
          return { success: false, message: '单位不存在' };
        }
      }

      // 处理日期字段
      let effectiveDate: Date | null = null;
      if (itemData.effectiveDate) {
        if (typeof itemData.effectiveDate === 'string') {
          effectiveDate = new Date(itemData.effectiveDate);
        } else if (itemData.effectiveDate instanceof Date) {
          effectiveDate = itemData.effectiveDate;
        }
      }

      let expiryDate: Date | null = null;
      if (itemData.expiryDate) {
        if (typeof itemData.expiryDate === 'string') {
          expiryDate = new Date(itemData.expiryDate);
        } else if (itemData.expiryDate instanceof Date) {
          expiryDate = itemData.expiryDate;
        }
      }

      const item = await prisma.$transaction(async (tx) => {
        const target = await tx.productBomItem.findUnique({ where: { id: itemId } });
        if (!target) throw new Error('物料项不存在');
        const bomId = target.bomId;

        if (typeof itemData.sequence === 'number' && itemData.sequence > 0 && itemData.sequence !== target.sequence) {
          const newSeq = itemData.sequence;
          const oldSeq = target.sequence;
          if (newSeq < oldSeq) {
            await tx.productBomItem.updateMany({
              where: { bomId, sequence: { gte: newSeq, lt: oldSeq } },
              data: { sequence: { increment: 1 } as any }
            });
          } else {
            await tx.productBomItem.updateMany({
              where: { bomId, sequence: { gt: oldSeq, lte: newSeq } },
              data: { sequence: { decrement: 1 } as any }
            });
          }
        }

        const updated = await tx.productBomItem.update({
          where: { id: itemId },
          data: {
            ...(itemData.materialId !== undefined && { materialId: itemData.materialId }),
            ...(itemData.materialVariantId !== undefined && { materialVariantId: itemData.materialVariantId }),
            ...(itemData.quantity !== undefined && { quantity: itemData.quantity }),
            ...(itemData.unitId !== undefined && { unitId: itemData.unitId }),
            ...(itemData.sequence !== undefined && { sequence: itemData.sequence }),
            ...(itemData.requirementType !== undefined && { requirementType: itemData.requirementType }),
            ...(itemData.isKey !== undefined && { isKey: itemData.isKey }),
            ...(itemData.isPhantom !== undefined && { isPhantom: itemData.isPhantom }),
            ...(itemData.processInfo !== undefined && { processInfo: itemData.processInfo }),
            ...(itemData.remark !== undefined && { remark: itemData.remark }),
            ...(itemData.scrapRate !== undefined && { scrapRate: itemData.scrapRate }),
            ...(itemData.fixedScrap !== undefined && { fixedScrap: itemData.fixedScrap }),
            ...(effectiveDate !== null && { effectiveDate }),
            ...(expiryDate !== null && { expiryDate }),
            ...(itemData.childBomId !== undefined && { childBomId: itemData.childBomId }),
            updatedBy: user.id.toString(),
            updatedAt: new Date()
          }
        });

        return updated;
      });

      return { success: true, data: item, message: '物料项更新成功' };
    } catch (error) {
      console.error('更新BOM物料项失败:', error);
      return { success: false, message: '更新BOM物料项失败' };
    }
  }

  /**
   * 删除BOM物料项
   */
  async deleteBomItem(itemId: string) {
    try {
      // 检查物料项是否存在
      const existingItem = await prisma.productBomItem.findUnique({
        where: { id: itemId }
      });

      if (!existingItem) {
        return { success: false, message: '物料项不存在' };
      }

      await prisma.$transaction(async (tx) => {
        const bomId = existingItem.bomId;
        await tx.productBomItem.delete({ where: { id: itemId } });
        const rest = await tx.productBomItem.findMany({ where: { bomId }, orderBy: { sequence: 'asc' } });
        for (let i = 0; i < rest.length; i++) {
          const desired = i + 1;
          if (rest[i].sequence !== desired) {
            await tx.productBomItem.update({ where: { id: rest[i].id }, data: { sequence: desired } });
          }
        }
      });

      return { success: true, message: '物料项删除成功' };
    } catch (error) {
      console.error('删除BOM物料项失败:', error);
      return { success: false, message: '删除BOM物料项失败' };
    }
  }

  /**
   * 批量删除BOM物料项
   */
  async batchDeleteBomItems(itemIds: string[]) {
    try {
      const items = await prisma.productBomItem.findMany({ where: { id: { in: itemIds } }, select: { id: true, bomId: true } });
      const bomIds = Array.from(new Set(items.map(i => i.bomId)));
      await prisma.$transaction(async (tx) => {
        await tx.productBomItem.deleteMany({ where: { id: { in: itemIds } } });
        for (const bid of bomIds) {
          const rest = await tx.productBomItem.findMany({ where: { bomId: bid }, orderBy: { sequence: 'asc' } });
          for (let i = 0; i < rest.length; i++) {
            const desired = i + 1;
            if (rest[i].sequence !== desired) {
              await tx.productBomItem.update({ where: { id: rest[i].id }, data: { sequence: desired } });
            }
          }
        }
      });

      return { success: true, message: '批量删除物料项成功' };
    } catch (error) {
      console.error('批量删除BOM物料项失败:', error);
      return { success: false, message: '批量删除BOM物料项失败' };
    }
  }

  /**
   * 批量同步BOM物料项（事务、幂等）
   * 输入为期望的物料项集合：
   * - 带id的视为现有项，若字段有变化则更新；若无变化则跳过
   * - 不带id的视为新增项，创建
   * - 现有但未出现在输入集合中的项将被删除
   * 成功则整体提交，任一错误则整体回滚
   */
  async syncBomItems(bomId: string, items: (BomItemFormData & { id?: string })[], user: User) {
    try {
      const bom = await prisma.productBom.findUnique({ where: { id: bomId } });
      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      // 预校验：物料/单位/子BOM可选校验
      for (const item of items) {
        if (!item.materialId && !item.materialVariantId) {
          return { success: false, message: '每个物料项必须指定物料或物料变体' };
        }
        if (item.unitId) {
          const unit = await prisma.unit.findUnique({ where: { id: item.unitId } });
          if (!unit) return { success: false, message: '单位不存在' };
        }
        if (item.materialId) {
          const material = await prisma.product.findUnique({ where: { id: item.materialId } });
          if (!material) return { success: false, message: '物料不存在' };
        }
        if (item.materialVariantId) {
          const mv = await prisma.productVariant.findUnique({ where: { id: item.materialVariantId } });
          if (!mv) return { success: false, message: '物料变体不存在' };
        }
        if (item.childBomId) {
          if (item.childBomId === bomId) return { success: false, message: '子BOM不能引用自身' };
          const child = await prisma.productBom.findUnique({ where: { id: item.childBomId } });
          if (!child) return { success: false, message: '子BOM不存在' };
        }
      }

      // 拉取现有项
      const existingItems = await prisma.productBomItem.findMany({ where: { bomId } });
      const existingMap = new Map(existingItems.map(i => [i.id, i]));
      const payloadIds = new Set(items.filter(i => i.id).map(i => String(i.id)));

      let created = 0;
      let updated = 0;
      let deleted = 0;
      let skipped = 0;

      // 事务执行：更新/新增，然后删除缺失项，最后校正序号
      await prisma.$transaction(async (tx) => {
        // 逐项处理新增与更新
        for (const item of items) {
          const effectiveDate = item.effectiveDate ? (typeof item.effectiveDate === 'string' ? new Date(item.effectiveDate) : item.effectiveDate) : null;
          const expiryDate = item.expiryDate ? (typeof item.expiryDate === 'string' ? new Date(item.expiryDate) : item.expiryDate) : null;

          if (item.id) {
            const existing = existingMap.get(item.id);
            if (!existing || existing.bomId !== bomId) {
              throw new Error('物料项不存在或不属于当前BOM');
            }
            const changed = (
              existing.materialId !== item.materialId ||
              existing.materialVariantId !== item.materialVariantId ||
              existing.quantity !== item.quantity ||
              existing.unitId !== item.unitId ||
              existing.sequence !== item.sequence ||
              !!existing.isKey !== !!item.isKey ||
              !!existing.isPhantom !== !!item.isPhantom ||
              (existing.processInfo ?? undefined) !== (item.processInfo ?? undefined) ||
              (existing.remark ?? undefined) !== (item.remark ?? undefined) ||
              existing.scrapRate.toNumber() !== (item.scrapRate || 0) ||
              existing.fixedScrap.toNumber() !== (item.fixedScrap || 0) ||
              (existing.effectiveDate ? existing.effectiveDate.getTime() : undefined) !== (effectiveDate ? effectiveDate.getTime() : undefined) ||
              (existing.expiryDate ? existing.expiryDate.getTime() : undefined) !== (expiryDate ? expiryDate.getTime() : undefined) ||
              (existing.childBomId ?? undefined) !== (item.childBomId ?? undefined)
            );
            if (changed) {
              await tx.productBomItem.update({
                where: { id: existing.id },
                data: {
                  materialId: item.materialId,
                  materialVariantId: item.materialVariantId,
                  quantity: item.quantity,
                  unitId: item.unitId,
                  sequence: item.sequence,
                  requirementType: item.requirementType,
                  isKey: item.isKey,
                  isPhantom: item.isPhantom,
                  processInfo: item.processInfo,
                  remark: item.remark,
                  scrapRate: item.scrapRate || 0,
                  fixedScrap: item.fixedScrap || 0,
                  effectiveDate,
                  expiryDate,
                  childBomId: item.childBomId,
                  updatedBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
                }
              });
              updated++;
            } else {
              skipped++;
            }
          } else {
            await tx.productBomItem.create({
              data: {
                bomId,
                materialId: item.materialId || '',
                materialVariantId: item.materialVariantId || null,
                quantity: item.quantity || 0,
                unitId: item.unitId || '',
                sequence: item.sequence,
                requirementType: item.requirementType || 'fixed',
                isKey: item.isKey || false,
                isPhantom: item.isPhantom || false,
                processInfo: item.processInfo ?? null,
                remark: item.remark ?? null,
                scrapRate: item.scrapRate || 0,
                fixedScrap: item.fixedScrap || 0,
                effectiveDate,
                expiryDate,
                childBomId: item.childBomId ?? null,
                createdBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
                updatedBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            });
            created++;
          }
        }

        // 删除未出现的旧项
        const toDelete = existingItems.filter(i => !payloadIds.has(i.id));
        if (toDelete.length > 0) {
          await tx.productBomItem.deleteMany({ where: { id: { in: toDelete.map(i => i.id) } } });
          deleted += toDelete.length;
        }

        // 序号校正（按输入的sequence排序后重排为1..N）
        const after = await tx.productBomItem.findMany({ where: { bomId }, orderBy: { sequence: 'asc' } });
        for (let i = 0; i < after.length; i++) {
          const desired = i + 1;
          if (after[i].sequence !== desired) {
            await tx.productBomItem.update({ where: { id: after[i].id }, data: { sequence: desired } });
          }
        }
      });

      return { success: true, data: { created, updated, deleted, skipped }, message: '物料项批量同步完成' };
    } catch (error) {
      console.error('批量同步BOM物料项失败:', error);
      return { success: false, message: '批量同步BOM物料项失败' };
    }
  }
  /**
   * 复制BOM物料项到另一个BOM
   */
  async copyBomItems(sourceBomId: string, targetBomId: string, user: User) {
    try {
      // 检查源BOM和目标BOM是否存在
      const [sourceBom, targetBom] = await Promise.all([
        prisma.productBom.findUnique({ where: { id: sourceBomId } }),
        prisma.productBom.findUnique({ where: { id: targetBomId } })
      ]);

      if (!sourceBom) {
        return { success: false, message: '源BOM不存在' };
      }

      if (!targetBom) {
        return { success: false, message: '目标BOM不存在' };
      }

      // 获取源BOM的所有物料项
      const sourceItems = await prisma.productBomItem.findMany({
        where: { bomId: sourceBomId }
      });

      if (sourceItems.length === 0) {
        return { success: false, message: '源BOM没有物料项' };
      }

      // 复制物料项到目标BOM
      const copyData = sourceItems.map(item => ({
        bomId: targetBomId,
        materialId: item.materialId,
        quantity: item.quantity,
        unitId: item.unitId,
        sequence: item.sequence,
        requirementType: item.requirementType,
        isKey: item.isKey,
        isPhantom: item.isPhantom,
        processInfo: item.processInfo,
        remark: item.remark,
        scrapRate: item.scrapRate,
        fixedScrap: item.fixedScrap,
        effectiveDate: item.effectiveDate,
        expiryDate: item.expiryDate,
        childBomId: item.childBomId,
        createdBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
        updatedBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await prisma.productBomItem.createMany({
        data: copyData
      });

      return { success: true, message: `成功复制${sourceItems.length}个物料项` };
    } catch (error) {
      console.error('复制BOM物料项失败:', error);
      return { success: false, message: '复制BOM物料项失败' };
    }
  }
}
