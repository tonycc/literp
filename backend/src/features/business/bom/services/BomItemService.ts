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

      // 检查物料是否存在
      if (itemData.materialId) {
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

      // 添加BOM物料项
      const item = await prisma.productBomItem.create({
        data: {
          bomId: bomId,
          materialId: itemData.materialId || '',
          quantity: itemData.quantity || 0,
          unitId: itemData.unitId || '',
          sequence: itemData.sequence || 1,
          requirementType: itemData.requirementType || 'fixed',
          isKey: itemData.isKey || false,
          isPhantom: itemData.isPhantom || false,
          processInfo: itemData.processInfo || null,
          remark: itemData.remark || null,
          effectiveDate: effectiveDate,
          expiryDate: expiryDate,
          childBomId: itemData.childBomId || null,
          createdBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
          updatedBy: String((user as any)?.userId ?? (user as any)?.sub ?? (user as any)?.id),
          createdAt: new Date(),
          updatedAt: new Date()
        }
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
      if (itemData.materialId) {
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

      // 更新BOM物料项
      const item = await prisma.productBomItem.update({
        where: { id: itemId },
        data: {
          ...(itemData.materialId !== undefined && { materialId: itemData.materialId }),
          ...(itemData.quantity !== undefined && { quantity: itemData.quantity }),
          ...(itemData.unitId !== undefined && { unitId: itemData.unitId }),
          ...(itemData.sequence !== undefined && { sequence: itemData.sequence }),
          ...(itemData.requirementType !== undefined && { requirementType: itemData.requirementType }),
          ...(itemData.isKey !== undefined && { isKey: itemData.isKey }),
          ...(itemData.isPhantom !== undefined && { isPhantom: itemData.isPhantom }),
          ...(itemData.processInfo !== undefined && { processInfo: itemData.processInfo }),
          ...(itemData.remark !== undefined && { remark: itemData.remark }),
          ...(effectiveDate !== null && { effectiveDate }),
          ...(expiryDate !== null && { expiryDate }),
          ...(itemData.childBomId !== undefined && { childBomId: itemData.childBomId }),
          updatedBy: user.id.toString(),
          updatedAt: new Date()
        }
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

      // 删除BOM物料项
      await prisma.productBomItem.delete({
        where: { id: itemId }
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
      await prisma.productBomItem.deleteMany({
        where: {
          id: {
            in: itemIds
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