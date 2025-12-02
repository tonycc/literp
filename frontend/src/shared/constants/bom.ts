/**
 * BOM 状态
 */
export const BOM_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
} as const;

export const BOM_STATUS_OPTIONS = [
  { label: '草稿', value: BOM_STATUS.DRAFT },
  { label: '启用', value: BOM_STATUS.ACTIVE },
  { label: '停用', value: BOM_STATUS.INACTIVE },
  { label: '归档', value: BOM_STATUS.ARCHIVED },
];

export const BOM_STATUS_VALUE_ENUM_PRO = {
  [BOM_STATUS.DRAFT]: { text: '草稿', status: 'Default' },
  [BOM_STATUS.ACTIVE]: { text: '启用', status: 'Success' },
  [BOM_STATUS.INACTIVE]: { text: '停用', status: 'Default' },
  [BOM_STATUS.ARCHIVED]: { text: '归档', status: 'Processing' },
};

export const BOM_STATUS_MAP: Record<string, { text: string; color: string }> = {
  [BOM_STATUS.DRAFT]: { text: '草稿', color: 'default' },
  [BOM_STATUS.ACTIVE]: { text: '启用', color: 'success' },
  [BOM_STATUS.INACTIVE]: { text: '停用', color: 'warning' },
  [BOM_STATUS.ARCHIVED]: { text: '归档', color: 'error' },
};

/**
 * BOM 类型
 */
export const BOM_TYPE = {
  PRODUCTION: 'production',
  ENGINEERING: 'engineering',
  SALES: 'sales',
} as const;

export const BOM_TYPE_OPTIONS = [
  { label: '生产BOM', value: BOM_TYPE.PRODUCTION },
  { label: '工程BOM', value: BOM_TYPE.ENGINEERING },
  { label: '销售BOM', value: BOM_TYPE.SALES },
];

export const BOM_TYPE_VALUE_ENUM_PRO = {
  [BOM_TYPE.PRODUCTION]: { text: '生产BOM', status: 'Default' },
  [BOM_TYPE.ENGINEERING]: { text: '工程BOM', status: 'Processing' },
  [BOM_TYPE.SALES]: { text: '销售BOM', status: 'Success' },
};

/**
 * 物料需求类型
 */
export const MATERIAL_REQUIREMENT_TYPE = {
  FIXED: 'fixed',
  VARIABLE: 'variable',
  OPTIONAL: 'optional',
} as const;

export const MATERIAL_REQUIREMENT_TYPE_OPTIONS = [
  { label: '固定', value: MATERIAL_REQUIREMENT_TYPE.FIXED },
  { label: '可变', value: MATERIAL_REQUIREMENT_TYPE.VARIABLE },
  { label: '可选', value: MATERIAL_REQUIREMENT_TYPE.OPTIONAL },
];

export const MATERIAL_REQUIREMENT_TYPE_VALUE_ENUM_PRO = {
  [MATERIAL_REQUIREMENT_TYPE.FIXED]: { text: '固定', status: 'Default' },
  [MATERIAL_REQUIREMENT_TYPE.VARIABLE]: { text: '可变', status: 'Processing' },
  [MATERIAL_REQUIREMENT_TYPE.OPTIONAL]: { text: '可选', status: 'Warning' },
};

export const MATERIAL_REQUIREMENT_TYPE_MAP: Record<string, { text: string; color: string }> = {
  [MATERIAL_REQUIREMENT_TYPE.FIXED]: { text: '固定', color: 'blue' },
  [MATERIAL_REQUIREMENT_TYPE.VARIABLE]: { text: '可变', color: 'orange' },
  [MATERIAL_REQUIREMENT_TYPE.OPTIONAL]: { text: '可选', color: 'default' },
};

/**
 * BOM 成本类型
 */
export const BOM_COST_TYPE = {
  MATERIAL: 'material',
  LABOR: 'labor',
  OVERHEAD: 'overhead',
} as const;

export const BOM_COST_TYPE_OPTIONS = [
  { label: '物料', value: BOM_COST_TYPE.MATERIAL },
  { label: '人工', value: BOM_COST_TYPE.LABOR },
  { label: '费用', value: BOM_COST_TYPE.OVERHEAD },
];

export const BOM_COST_TYPE_MAP: Record<string, { text: string; color: string }> = {
  [BOM_COST_TYPE.MATERIAL]: { text: '物料', color: 'blue' },
  [BOM_COST_TYPE.LABOR]: { text: '人工', color: 'green' },
  [BOM_COST_TYPE.OVERHEAD]: { text: '费用', color: 'orange' },
};

/**
 * BOM 版本历史操作类型
 */
export const BOM_HISTORY_ACTION = {
  CREATED: 'created',
  UPDATED: 'updated',
  ACTIVATED: 'activated',
  DEACTIVATED: 'deactivated',
  ARCHIVED: 'archived',
  COPIED: 'copied',
} as const;

export const BOM_HISTORY_ACTION_OPTIONS = [
  { label: '创建', value: BOM_HISTORY_ACTION.CREATED },
  { label: '更新', value: BOM_HISTORY_ACTION.UPDATED },
  { label: '激活', value: BOM_HISTORY_ACTION.ACTIVATED },
  { label: '停用', value: BOM_HISTORY_ACTION.DEACTIVATED },
  { label: '归档', value: BOM_HISTORY_ACTION.ARCHIVED },
  { label: '复制', value: BOM_HISTORY_ACTION.COPIED },
];
