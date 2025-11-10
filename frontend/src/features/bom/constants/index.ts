/**
 * BOM管理模块常量定义
 */

// BOM状态映射
export const BOM_STATUS_MAP = {
  draft: { color: 'default', text: '草稿' },
  active: { color: 'success', text: '启用' },
  inactive: { color: 'warning', text: '停用' },
  archived: { color: 'error', text: '归档' }
} as const;

// BOM类型映射
export const BOM_TYPE_MAP = {
  production: { text: '生产BOM' },
  engineering: { text: '工程BOM' },
  sales: { text: '销售BOM' }
} as const;

// 物料需求类型映射
export const MATERIAL_REQUIREMENT_TYPE_MAP = {
  fixed: { color: 'blue', text: '固定' },
  variable: { color: 'orange', text: '可变' },
  optional: { color: 'default', text: '可选' }
} as const;