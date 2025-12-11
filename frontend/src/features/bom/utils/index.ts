/**
 * BOM管理模块工具函数
 */

import type { BomStatus, BomType, MaterialRequirementType, BomItem } from '@zyerp/shared';
import { BOM_STATUS_MAP, BOM_TYPE_MAP, MATERIAL_REQUIREMENT_TYPE_MAP } from '@/shared/constants/bom';

/**
 * 格式化BOM状态显示
 * @param status BOM状态
 * @returns 状态配置对象
 */
export const formatBomStatus = (status: BomStatus) => {
  return BOM_STATUS_MAP[status] || { color: 'default', text: '未知' };
};

/**
 * 格式化BOM类型显示
 * @param type BOM类型
 * @returns 类型显示文本
 */
export const formatBomType = (type: BomType) => {
  return BOM_TYPE_MAP[type]?.text || '未知';
};

/**
 * 格式化物料需求类型显示
 * @param type 物料需求类型
 * @returns 需求类型配置对象
 */
export const formatMaterialRequirementType = (type: MaterialRequirementType) => {
  return MATERIAL_REQUIREMENT_TYPE_MAP[type] || { color: 'default', text: '未知' };
};

/**
 * 格式化日期显示
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '-';
  const d = new Date(date);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
};

/**
 * 计算BOM总成本
 * @param items BOM物料项列表
 * @returns 总成本
 */
export const calculateTotalCost = (items: (BomItem & { totalCost?: number })[]) => {
  return items.reduce((total, item) => total + (item.totalCost || 0), 0);
};