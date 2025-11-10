import { PrismaClient } from '@prisma/client';
import type { User } from '@shared/types/auth';

const prisma = new PrismaClient();

export class BomVersionService {
  /**
   * 创建BOM新版本（复制现有BOM）
   */
  async createBomVersion(sourceBomId: string, versionData: { version: string; description?: string }, user: User) {
    try {
      // 获取源BOM详细信息
      const sourceBom = await prisma.productBom.findUnique({
        where: { id: sourceBomId },
        include: {
          items: true
        }
      });

      if (!sourceBom) {
        return { success: false, message: '源BOM不存在' };
      }

      // 检查新版本号是否已存在
      const existingVersion = await prisma.productBom.findFirst({
        where: {
          productId: sourceBom.productId,
          version: versionData.version
        }
      });

      if (existingVersion) {
        return { success: false, message: '该版本号已存在' };
      }

      // 生成新的BOM编码
      const newCode = `${sourceBom.code}_V${versionData.version}`;

      // 创建新版本BOM
      const now = new Date();
      const newBom = await prisma.productBom.create({
        data: {
          code: newCode,
          name: `${sourceBom.name} V${versionData.version}`,
          version: versionData.version,
          productId: sourceBom.productId,
          type: sourceBom.type,
          baseQuantity: sourceBom.baseQuantity,
          baseUnitId: sourceBom.baseUnitId,
          routingId: sourceBom.routingId,
          status: 'draft',
          isDefault: false,
          effectiveDate: now,
          expiryDate: sourceBom.expiryDate,
          description: versionData.description || `基于版本 ${sourceBom.version} 创建`,
          remark: sourceBom.remark,
          createdBy: user.id.toString(),
          updatedBy: user.id.toString(),
          updatedAt: now
        }
      });

      // 复制物料项
      if (sourceBom.items && sourceBom.items.length > 0) {
        const itemsData = sourceBom.items.map(item => ({
          bomId: newBom.id,
          materialId: item.materialId,
          quantity: item.quantity,
          unitId: item.unitId,
          sequence: item.sequence,
          requirementType: item.requirementType,
          isKey: item.isKey,
          isPhantom: item.isPhantom,
          substitutionRatio: item.substitutionRatio,
          priority: item.priority,
          isPreferred: item.isPreferred,
          processInfo: item.processInfo,
          effectiveDate: item.effectiveDate,
          expiryDate: item.expiryDate,
          unitCost: item.unitCost,
          totalCost: item.totalCost,
          remark: item.remark,
          childBomId: item.childBomId,
          createdBy: user.id.toString(),
          updatedBy: user.id.toString(),
          createdAt: now,
          updatedAt: now
        }));

        await prisma.productBomItem.createMany({
          data: itemsData
        });
      }

      return { success: true, data: newBom, message: '新版本创建成功' };
    } catch (error) {
      console.error('创建BOM版本失败:', error);
      return { success: false, message: '创建BOM版本失败' };
    }
  }

  /**
   * 获取BOM版本列表
   */
  async getBomVersions(productId: string) {
    try {
      const versions = await prisma.productBom.findMany({
        where: { productId },
        orderBy: [
          { isDefault: 'desc' },
          { version: 'desc' },
          { createdAt: 'desc' }
        ],
        select: {
          id: true,
          code: true,
          name: true,
          version: true,
          status: true,
          isDefault: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              id: true,
              username: true
            }
          }
        }
      });

      return { success: true, data: versions };
    } catch (error) {
      console.error('获取BOM版本列表失败:', error);
      return { success: false, message: '获取BOM版本列表失败', data: [] };
    }
  }

  /**
   * 比较两个BOM版本
   */
  async compareBomVersions(bomId1: string, bomId2: string) {
    try {
      // 获取两个BOM的详细信息
      const [bom1, bom2] = await Promise.all([
        prisma.productBom.findUnique({
          where: { id: bomId1 },
          include: {
            items: {
              include: {
                material: {
                  select: {
                    code: true,
                    name: true,
                    specification: true
                  }
                }
              },
              orderBy: { sequence: 'asc' }
            }
          }
        }),
        prisma.productBom.findUnique({
          where: { id: bomId2 },
          include: {
            items: {
              include: {
                material: {
                  select: {
                    code: true,
                    name: true,
                    specification: true
                  }
                }
              },
              orderBy: { sequence: 'asc' }
            }
          }
        })
      ]);

      if (!bom1 || !bom2) {
        return { success: false, message: 'BOM不存在' };
      }

      const differences: any[] = [];

      // 比较基本信息
      const basicFields = ['name', 'version', 'status', 'baseQuantity', 'description', 'remark'];

      basicFields.forEach(field => {
        const value1 = (bom1 as any)[field];
        const value2 = (bom2 as any)[field];
        if (value1 !== value2) {
          differences.push({
            type: 'modified',
            category: 'basic',
            field,
            label: field,
            oldValue: value1,
            newValue: value2
          });
        }
      });

      // 比较物料项数量
      const items1Count = bom1.items?.length || 0;
      const items2Count = bom2.items?.length || 0;

      if (items1Count !== items2Count) {
        differences.push({
          type: 'modified',
          category: 'item',
          field: 'itemCount',
          label: '物料项数量',
          oldValue: items1Count,
          newValue: items2Count
        });
      }

      return {
        success: true,
        data: {
          bom1: {
            id: bom1.id,
            code: bom1.code,
            name: bom1.name,
            version: bom1.version,
            status: bom1.status
          },
          bom2: {
            id: bom2.id,
            code: bom2.code,
            name: bom2.name,
            version: bom2.version,
            status: bom2.status
          },
          differences,
          summary: {
            total: differences.length,
            basic: differences.filter(d => d.category === 'basic').length,
            items: differences.filter(d => d.category === 'item').length
          }
        }
      };
    } catch (error) {
      console.error('BOM版本比较失败:', error);
      return { success: false, message: 'BOM版本比较失败' };
    }
  }

  /**
   * 设置默认版本
   */
  async setDefaultVersion(bomId: string, user: User) {
    try {
      // 获取BOM信息
      const bom = await prisma.productBom.findUnique({
        where: { id: bomId }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      // 使用事务确保数据一致性
      await prisma.$transaction(async (tx) => {
        // 取消同产品下所有BOM的默认状态
        await tx.productBom.updateMany({
          where: { productId: bom.productId },
          data: { isDefault: false }
        });

        // 设置当前BOM为默认
        await tx.productBom.update({
          where: { id: bomId },
          data: {
            isDefault: true,
            updatedBy: user.id.toString(),
            updatedAt: new Date()
          }
        });
      });

      return { success: true, message: '默认版本设置成功' };
    } catch (error) {
      console.error('设置默认版本失败:', error);
      return { success: false, message: '设置默认版本失败' };
    }
  }

  /**
   * 删除BOM版本
   */
  async deleteBomVersion(bomId: string) {
    try {
      // 检查BOM是否存在
      const bom = await prisma.productBom.findUnique({
        where: { id: bomId }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      // 检查是否为默认版本
      if (bom.isDefault) {
        return { success: false, message: '不能删除默认版本，请先设置其他版本为默认' };
      }

      // 检查是否有其他BOM引用此版本
      const referencedCount = await prisma.productBomItem.count({
        where: { childBomId: bomId }
      });

      if (referencedCount > 0) {
        return { success: false, message: '该版本被其他BOM引用，无法删除' };
      }

      // 删除BOM及其物料项
      await prisma.productBom.delete({
        where: { id: bomId }
      });

      return { success: true, message: 'BOM版本删除成功' };
    } catch (error) {
      console.error('删除BOM版本失败:', error);
      return { success: false, message: '删除BOM版本失败' };
    }
  }

  /**
   * 激活BOM版本
   */
  async activateBomVersion(bomId: string, user: User) {
    try {
      const bom = await prisma.productBom.findUnique({
        where: { id: bomId }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      if (bom.status === 'ACTIVE') {
        return { success: false, message: 'BOM已经是激活状态' };
      }

      await prisma.productBom.update({
        where: { id: bomId },
        data: {
          status: 'ACTIVE',
          updatedBy: user.id.toString(),
          updatedAt: new Date()
        }
      });

      return { success: true, message: 'BOM版本激活成功' };
    } catch (error) {
      console.error('激活BOM版本失败:', error);
      return { success: false, message: '激活BOM版本失败' };
    }
  }

  /**
   * 归档BOM版本
   */
  async archiveBomVersion(bomId: string, user: User) {
    try {
      const bom = await prisma.productBom.findUnique({
        where: { id: bomId }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      if (bom.isDefault) {
        return { success: false, message: '不能归档默认版本' };
      }

      if (bom.status === 'ARCHIVED') {
        return { success: false, message: 'BOM已经是归档状态' };
      }

      await prisma.productBom.update({
        where: { id: bomId },
        data: {
          status: 'ARCHIVED',
          updatedBy: user.id.toString(),
          updatedAt: new Date()
        }
      });

      return { success: true, message: 'BOM版本归档成功' };
    } catch (error) {
      console.error('归档BOM版本失败:', error);
      return { success: false, message: '归档BOM版本失败' };
    }
  }
}