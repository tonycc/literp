import { PrismaClient } from '@prisma/client';
import type { User } from '@shared/types/auth';

const prisma = new PrismaClient();

export interface BomCostItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  level: number;
  sequence: number;
}

export interface BomCostSummary {
  bomId: string;
  bomCode: string;
  bomName: string;
  baseQuantity: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  totalCost: number;
  costPerUnit: number;
  calculatedAt: Date;
  calculatedBy: string;
  items: BomCostItem[];
}

export class BomCostService {
  /**
   * 计算BOM成本
   */
  async calculateBomCost(bomId: string, user: User): Promise<{ success: boolean; data?: BomCostSummary; message?: string }> {
    try {
      // 获取BOM详细信息
      const bom = await prisma.productBom.findUnique({
        where: { id: bomId },
        include: {
          items: {
            include: {
              material: {
                select: {
                  code: true,
                  name: true,
                  standardCost: true,
                  latestCost: true
                }
              },
              unit: {
                select: {
                  name: true,
                  symbol: true
                }
              }
            },
            orderBy: { sequence: 'asc' }
          }
        }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      const costItems: BomCostItem[] = [];
      let totalMaterialCost = 0;

      // 计算每个物料项的成本
      for (const item of bom.items || []) {
        // 获取物料成本（优先使用最新成本，其次标准成本）
        const unitCost = item.material?.latestCost || item.material?.standardCost || 0;
        const totalCost = item.quantity * unitCost;

        const costItem: BomCostItem = {
          materialId: item.materialId,
          materialCode: item.material?.code || '',
          materialName: item.material?.name || '',
          quantity: item.quantity,
          unitCost: unitCost,
          totalCost: totalCost,
          level: 1, // 简化处理，暂时都设为1级
          sequence: item.sequence
        };

        costItems.push(costItem);
        totalMaterialCost += totalCost;
      }

      // 计算人工成本和制造费用（简化处理）
      const totalLaborCost = totalMaterialCost * 0.2; // 假设人工成本为物料成本的20%
      const totalOverheadCost = totalMaterialCost * 0.1; // 假设制造费用为物料成本的10%
      const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost;
      const costPerUnit = bom.baseQuantity > 0 ? totalCost / bom.baseQuantity : 0;

      const costSummary: BomCostSummary = {
        bomId: bom.id,
        bomCode: bom.code,
        bomName: bom.name,
        baseQuantity: bom.baseQuantity,
        totalMaterialCost: Math.round(totalMaterialCost * 100) / 100,
        totalLaborCost: Math.round(totalLaborCost * 100) / 100,
        totalOverheadCost: Math.round(totalOverheadCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        costPerUnit: Math.round(costPerUnit * 100) / 100,
        calculatedAt: new Date(),
        calculatedBy: user.username,
        items: costItems
      };

      // 更新BOM物料项的成本信息
      for (const costItem of costItems) {
        await prisma.productBomItem.updateMany({
          where: {
            bomId: bomId,
            materialId: costItem.materialId
          },
          data: {
            unitCost: costItem.unitCost,
            totalCost: costItem.totalCost,
            updatedBy: user.id.toString(),
            updatedAt: new Date()
          }
        });
      }

      return { success: true, data: costSummary };
    } catch (error) {
      console.error('BOM成本计算失败:', error);
      return { success: false, message: 'BOM成本计算失败' };
    }
  }

  /**
   * 获取BOM成本明细
   */
  async getBomCostDetail(bomId: string): Promise<{ success: boolean; data?: BomCostSummary; message?: string }> {
    try {
      const bom = await prisma.productBom.findUnique({
        where: { id: bomId },
        include: {
          items: {
            include: {
              material: {
                select: {
                  code: true,
                  name: true
                }
              }
            },
            orderBy: { sequence: 'asc' }
          }
        }
      });

      if (!bom) {
        return { success: false, message: 'BOM不存在' };
      }

      const costItems: BomCostItem[] = [];
      let totalMaterialCost = 0;

      // 获取已计算的成本信息
      for (const item of bom.items || []) {
        const unitCost = item.unitCost || 0;
        const totalCost = item.totalCost || 0;

        const costItem: BomCostItem = {
          materialId: item.materialId,
          materialCode: item.material?.code || '',
          materialName: item.material?.name || '',
          quantity: item.quantity,
          unitCost: unitCost,
          totalCost: totalCost,
          level: 1,
          sequence: item.sequence
        };

        costItems.push(costItem);
        totalMaterialCost += totalCost;
      }

      const totalLaborCost = totalMaterialCost * 0.2;
      const totalOverheadCost = totalMaterialCost * 0.1;
      const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost;
      const costPerUnit = bom.baseQuantity > 0 ? totalCost / bom.baseQuantity : 0;

      const costSummary: BomCostSummary = {
        bomId: bom.id,
        bomCode: bom.code,
        bomName: bom.name,
        baseQuantity: bom.baseQuantity,
        totalMaterialCost: Math.round(totalMaterialCost * 100) / 100,
        totalLaborCost: Math.round(totalLaborCost * 100) / 100,
        totalOverheadCost: Math.round(totalOverheadCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        costPerUnit: Math.round(costPerUnit * 100) / 100,
        calculatedAt: new Date(),
        calculatedBy: 'system',
        items: costItems
      };

      return { success: true, data: costSummary };
    } catch (error) {
      console.error('获取BOM成本明细失败:', error);
      return { success: false, message: '获取BOM成本明细失败' };
    }
  }

  /**
   * 批量计算BOM成本
   */
  async batchCalculateBomCost(bomIds: string[], user: User): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const results = [];

      for (const bomId of bomIds) {
        const result = await this.calculateBomCost(bomId, user);
        results.push({
          bomId,
          success: result.success,
          data: result.data,
          message: result.message
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      return {
        success: true,
        data: results,
        message: `批量计算完成：成功${successCount}个，失败${failCount}个`
      };
    } catch (error) {
      console.error('批量计算BOM成本失败:', error);
      return { success: false, message: '批量计算BOM成本失败' };
    }
  }

  /**
   * 比较BOM成本
   */
  async compareBomCost(bomId1: string, bomId2: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const [cost1, cost2] = await Promise.all([
        this.getBomCostDetail(bomId1),
        this.getBomCostDetail(bomId2)
      ]);

      if (!cost1.success || !cost2.success) {
        return { success: false, message: '获取BOM成本信息失败' };
      }

      if (!cost1.data || !cost2.data) {
        return { success: false, message: 'BOM成本数据不存在' };
      }

      const comparison = {
        bom1: {
          id: cost1.data.bomId,
          code: cost1.data.bomCode,
          name: cost1.data.bomName,
          totalCost: cost1.data.totalCost,
          costPerUnit: cost1.data.costPerUnit
        },
        bom2: {
          id: cost2.data.bomId,
          code: cost2.data.bomCode,
          name: cost2.data.bomName,
          totalCost: cost2.data.totalCost,
          costPerUnit: cost2.data.costPerUnit
        },
        differences: {
          totalCostDiff: cost2.data.totalCost - cost1.data.totalCost,
          costPerUnitDiff: cost2.data.costPerUnit - cost1.data.costPerUnit,
          materialCostDiff: cost2.data.totalMaterialCost - cost1.data.totalMaterialCost,
          laborCostDiff: cost2.data.totalLaborCost - cost1.data.totalLaborCost,
          overheadCostDiff: cost2.data.totalOverheadCost - cost1.data.totalOverheadCost
        }
      };

      return { success: true, data: comparison };
    } catch (error) {
      console.error('BOM成本比较失败:', error);
      return { success: false, message: 'BOM成本比较失败' };
    }
  }

  /**
   * 获取成本分析报告
   */
  async getCostAnalysisReport(bomId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const costDetail = await this.getBomCostDetail(bomId);

      if (!costDetail.success || !costDetail.data) {
        return { success: false, message: '获取BOM成本信息失败' };
      }

      const data = costDetail.data;

      // 成本结构分析
      const costStructure = {
        materialCostRatio: data.totalCost > 0 ? (data.totalMaterialCost / data.totalCost * 100).toFixed(2) : '0.00',
        laborCostRatio: data.totalCost > 0 ? (data.totalLaborCost / data.totalCost * 100).toFixed(2) : '0.00',
        overheadCostRatio: data.totalCost > 0 ? (data.totalOverheadCost / data.totalCost * 100).toFixed(2) : '0.00'
      };

      // 物料成本排序（按成本从高到低）
      const materialCostRanking = data.items
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 10) // 取前10个
        .map((item, index) => ({
          rank: index + 1,
          materialCode: item.materialCode,
          materialName: item.materialName,
          totalCost: item.totalCost,
          costRatio: data.totalMaterialCost > 0 ? (item.totalCost / data.totalMaterialCost * 100).toFixed(2) : '0.00'
        }));

      const report = {
        bomInfo: {
          id: data.bomId,
          code: data.bomCode,
          name: data.bomName,
          baseQuantity: data.baseQuantity
        },
        costSummary: {
          totalCost: data.totalCost,
          costPerUnit: data.costPerUnit,
          totalMaterialCost: data.totalMaterialCost,
          totalLaborCost: data.totalLaborCost,
          totalOverheadCost: data.totalOverheadCost
        },
        costStructure,
        materialCostRanking,
        calculatedAt: data.calculatedAt
      };

      return { success: true, data: report };
    } catch (error) {
      console.error('获取成本分析报告失败:', error);
      return { success: false, message: '获取成本分析报告失败' };
    }
  }

  /**
   * 更新物料成本
   */
  async updateMaterialCost(materialId: string, newCost: number, user: User): Promise<{ success: boolean; message?: string }> {
    try {
      // 更新物料的最新成本
      await prisma.product.update({
        where: { id: materialId },
        data: {
          latestCost: newCost,
          updatedAt: new Date()
        }
      });

      // 获取使用该物料的所有BOM项
      const bomItems = await prisma.productBomItem.findMany({
        where: { materialId },
        select: {
          id: true,
          bomId: true,
          quantity: true
        }
      });

      // 更新相关BOM项的成本
      for (const item of bomItems) {
        const newTotalCost = item.quantity * newCost;
        await prisma.productBomItem.update({
          where: { id: item.id },
          data: {
            unitCost: newCost,
            totalCost: newTotalCost,
            updatedBy: user.id.toString(),
            updatedAt: new Date()
          }
        });
      }

      return { success: true, message: `物料成本更新成功，影响${bomItems.length}个BOM项` };
    } catch (error) {
      console.error('更新物料成本失败:', error);
      return { success: false, message: '更新物料成本失败' };
    }
  }
}