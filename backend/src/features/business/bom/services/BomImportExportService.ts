import { PrismaClient } from '@prisma/client';
import type { User } from '@shared/types/auth';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * BOM导入导出服务
 * 负责处理BOM数据的导入导出功能
 */
export class BomImportExportService {

  /**
   * 导出BOM数据到CSV文件
   */
  async exportBoms(query: any): Promise<{ success: boolean; data?: string; message: string }> {
    try {
      // 构建查询条件
      const where: any = {};
      
      if (query.productId) {
        where.productId = query.productId;
      }
      
      if (query.status) {
        where.status = query.status;
      }
      
      if (query.search) {
        where.OR = [
          { code: { contains: query.search } },
          { name: { contains: query.search } },
          { description: { contains: query.search } }
        ];
      }

      // 获取BOM数据
      const boms = await prisma.productBom.findMany({
        where,
        include: {
          items: {
            include: {
              material: {
                select: {
                  code: true,
                  name: true,
                  specification: true,
                  latestCost: true
                }
              },
              unit: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (boms.length === 0) {
        return { success: false, message: '没有找到要导出的BOM数据' };
      }

      // 生成CSV内容
      const csvHeaders = [
        'BOM编码', 'BOM名称', '版本', '状态', '基础数量', '是否默认', '描述',
        '物料编码', '物料名称', '物料规格', '需求数量', '单位', '序号',
        '需求类型', '是否关键', '是否虚拟', '单位成本', '总成本', '备注'
      ];

      let csvContent = csvHeaders.join(',') + '\n';

      boms.forEach(bom => {
        if (bom.items && bom.items.length > 0) {
          bom.items.forEach(item => {
            const row = [
              bom.code,
              bom.name,
              bom.version,
              bom.status === 'active' ? '启用' : '禁用',
              bom.baseQuantity,
              bom.isDefault ? '是' : '否',
              bom.description || '',
              item.material?.code || '',
              item.material?.name || '',
              item.material?.specification || '',
              item.quantity,
              item.unit?.name || '',
              item.sequence,
              item.requirementType === 'fixed' ? '固定' : '变动',
              item.isKey ? '是' : '否',
              item.isPhantom ? '是' : '否',
              item.unitCost || 0,
              item.totalCost || 0,
              item.remark || ''
            ];
            csvContent += row.map(field => `"${field}"`).join(',') + '\n';
          });
        } else {
          // 没有物料项的BOM
          const row = [
            bom.code,
            bom.name,
            bom.version,
            bom.status === 'active' ? '启用' : '禁用',
            bom.baseQuantity,
            bom.isDefault ? '是' : '否',
            bom.description || '',
            '', '', '', '', '', '', '', '', '', '', '', ''
          ];
          csvContent += row.map(field => `"${field}"`).join(',') + '\n';
        }
      });

      // 生成文件名和路径
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `BOM导出_${timestamp}.csv`;
      const exportDir = path.join(process.cwd(), 'exports');
      
      // 确保导出目录存在
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const filePath = path.join(exportDir, fileName);

      // 写入文件（添加BOM头以支持中文）
      fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8');

      return {
        success: true,
        data: filePath,
        message: `成功导出${boms.length}个BOM`
      };

    } catch (error) {
      console.error('导出BOM失败:', error);
      return { success: false, message: '导出BOM失败' };
    }
  }

  /**
   * 导入BOM数据
   */
  // eslint-disable-next-line no-unused-vars
  async importBoms(filePath: string, _user: User): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return { success: false, message: '导入文件不存在' };
      }

      // 读取CSV文件
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        return { success: false, message: '导入文件格式错误或没有数据' };
      }

      // 解析CSV头部
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      // 验证必需的列
      const requiredColumns = ['BOM编码', 'BOM名称'];
      for (const col of requiredColumns) {
        if (!headers.includes(col)) {
          return { success: false, message: `导入文件缺少必需的列: ${col}` };
        }
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // 解析数据行
      const bomMap = new Map<string, any>();

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          const rowData: any = {};
          
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });

          const bomCode = rowData['BOM编码'];
          if (!bomCode) continue;

          // 如果BOM不存在于Map中，创建新的BOM记录
          if (!bomMap.has(bomCode)) {
            bomMap.set(bomCode, {
              code: bomCode,
              name: rowData['BOM名称'],
              version: rowData['版本'] || '1.0',
              status: rowData['状态'] === '启用' ? 'active' : 'inactive',
              baseQuantity: Number(rowData['基础数量']) || 1,
              isDefault: rowData['是否默认'] === '是',
              description: rowData['描述'] || '',
              items: []
            });
          }

          // 如果有物料信息，添加到物料项列表
          if (rowData['物料编码']) {
            const bom = bomMap.get(bomCode);
            bom.items.push({
              materialCode: rowData['物料编码'],
              quantity: Number(rowData['需求数量']) || 1,
              unitName: rowData['单位'] || '',
              sequence: Number(rowData['序号']) || 1,
              requirementType: rowData['需求类型'] === '固定' ? 'fixed' : 'variable',
              isKey: rowData['是否关键'] === '是',
              isPhantom: rowData['是否虚拟'] === '是',
              unitCost: Number(rowData['单位成本']) || null,
              totalCost: Number(rowData['总成本']) || null,
              remark: rowData['备注'] || ''
            });
          }

        } catch (parseError) {
          console.error(`解析第${i + 1}行失败:`, parseError);
          results.errors.push(`第${i + 1}行数据格式错误`);
        }
      }

      // 创建BOM记录
       for (const [bomCode] of bomMap) {
         try {
           // 检查BOM编码是否已存在
           const existingBom = await prisma.productBom.findUnique({
             where: { code: bomCode }
           });

           if (existingBom) {
             results.failed++;
             results.errors.push(`BOM编码"${bomCode}"已存在`);
             continue;
           }

           // 这里简化处理，实际应该验证产品ID等
           // 由于没有产品信息，暂时跳过创建
           results.failed++;
           results.errors.push(`BOM"${bomCode}"缺少产品信息，无法创建`);

         } catch (bomError) {
           console.error('创建BOM失败:', bomError);
           results.failed++;
           results.errors.push(`创建BOM"${bomCode}"失败`);
         }
       }

      // 清理临时文件
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError);
      }

      return {
        success: true,
        data: results,
        message: `导入完成：成功${results.success}个，失败${results.failed}个`
      };

    } catch (error) {
      console.error('导入BOM失败:', error);
      return { success: false, message: '导入BOM失败' };
    }
  }

  /**
   * 获取导入模板文件
   */
  async getImportTemplate(): Promise<{ success: boolean; data?: string; message: string }> {
    try {
      // 创建CSV模板内容
      const headers = [
        'BOM编码', 'BOM名称', '版本', '状态', '基础数量', '是否默认', '描述',
        '物料编码', '物料名称', '物料规格', '需求数量', '单位', '序号',
        '需求类型', '是否关键', '是否虚拟', '单位成本', '总成本', '备注'
      ];

      const sampleData = [
        'BOM001', '示例BOM', '1.0', '启用', '1', '是', 'BOM描述信息',
        'MAT001', '示例物料', '标准规格', '2', '个', '1',
        '固定', '是', '否', '10.5', '21', '备注信息'
      ];

      let csvContent = headers.join(',') + '\n';
      csvContent += sampleData.map(field => `"${field}"`).join(',') + '\n';

      // 生成模板文件
      const templateDir = path.join(process.cwd(), 'templates');
      
      // 确保模板目录存在
      if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
      }
      
      const templatePath = path.join(templateDir, 'BOM导入模板.csv');

      // 写入文件（添加BOM头以支持中文）
      fs.writeFileSync(templatePath, '\uFEFF' + csvContent, 'utf8');

      return {
        success: true,
        data: templatePath,
        message: '导入模板生成成功'
      };

    } catch (error) {
      console.error('生成导入模板失败:', error);
      return { success: false, message: '生成导入模板失败' };
    }
  }

  /**
   * 验证导入文件格式
   */
  async validateImportFile(filePath: string): Promise<{ success: boolean; message: string; errors?: string[] }> {
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, message: '文件不存在' };
      }

      // 读取文件前几行进行验证
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());

      if (lines.length < 1) {
        return { success: false, message: '文件为空' };
      }

      // 检查头部
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const requiredColumns = ['BOM编码', 'BOM名称'];
      const errors: string[] = [];

      for (const col of requiredColumns) {
        if (!headers.includes(col)) {
          errors.push(`缺少必需的列: ${col}`);
        }
      }

      if (lines.length < 2) {
        errors.push('文件没有数据行');
      }

      if (errors.length > 0) {
        return { success: false, message: '文件格式验证失败', errors };
      }

      return { success: true, message: '文件格式验证通过' };

    } catch (error) {
      console.error('验证导入文件失败:', error);
      return { success: false, message: '验证导入文件失败' };
    }
  }

  /**
   * 批量导出BOM成本分析
   */
  async exportBomCostAnalysis(bomIds: string[]): Promise<{ success: boolean; data?: string; message: string }> {
    try {
      if (bomIds.length === 0) {
        return { success: false, message: '没有选择要导出的BOM' };
      }

      // 获取BOM成本数据
      const boms = await prisma.productBom.findMany({
        where: {
          id: { in: bomIds }
        },
        include: {
          items: {
            include: {
              material: {
                select: {
                  code: true,
                  name: true,
                  latestCost: true
                }
              },
              unit: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      // 生成成本分析CSV
      const headers = [
        'BOM编码', 'BOM名称', '物料编码', '物料名称', '需求数量', '单位',
        '单位成本', '总成本', '成本占比', '更新时间'
      ];

      let csvContent = headers.join(',') + '\n';

      boms.forEach(bom => {
        const totalBomCost = bom.items.reduce((sum, item) => {
          const itemCost = (item.material?.latestCost || 0) * item.quantity;
          return sum + itemCost;
        }, 0);

        bom.items.forEach(item => {
          const unitCost = item.material?.latestCost || 0;
          const totalCost = unitCost * item.quantity;
          const costRatio = totalBomCost > 0 ? ((totalCost / totalBomCost) * 100).toFixed(2) : '0';

          const row = [
            bom.code,
            bom.name,
            item.material?.code || '',
            item.material?.name || '',
            item.quantity,
            item.unit?.name || '',
            unitCost,
            totalCost,
            costRatio + '%',
            bom.updatedAt.toISOString().split('T')[0]
          ];
          csvContent += row.map(field => `"${field}"`).join(',') + '\n';
        });
      });

      // 生成文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `BOM成本分析_${timestamp}.csv`;
      const exportDir = path.join(process.cwd(), 'exports');
      
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const filePath = path.join(exportDir, fileName);
      fs.writeFileSync(filePath, '\uFEFF' + csvContent, 'utf8');

      return {
        success: true,
        data: filePath,
        message: `成功导出${boms.length}个BOM的成本分析`
      };

    } catch (error) {
      console.error('导出BOM成本分析失败:', error);
      return { success: false, message: '导出BOM成本分析失败' };
    }
  }
}