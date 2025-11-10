/**
 * 产品类别相关常量定义
 */



/**
 * 产品类别排序选项
 */
export const PRODUCT_CATEGORY_SORT_OPTIONS = [
  { label: '按名称排序', value: 'name' },
  { label: '按编码排序', value: 'code' },
  { label: '按排序号排序', value: 'sortOrder' },
  { label: '按层级排序', value: 'level' },
  { label: '按创建时间排序', value: 'createdAt' },
  { label: '按更新时间排序', value: 'updatedAt' }
];

/**
 * 产品类别状态选项
 */
export const PRODUCT_CATEGORY_STATUS_OPTIONS = [
  { label: '全部', value: undefined },
  { label: '启用', value: true },
  { label: '停用', value: false }
];

/**
 * 产品类别层级选项
 */
export const PRODUCT_CATEGORY_LEVEL_OPTIONS = [
  { label: '全部层级', value: undefined },
  { label: '一级类别', value: 1 },
  { label: '二级类别', value: 2 }
];

/**
 * 产品类别编码规则
 */
export const PRODUCT_CATEGORY_CODE_RULES = {
  // 一级类别编码格式：CAT + 3位数字
  LEVEL1_PATTERN: /^CAT\d{3}$/,
  LEVEL1_PREFIX: 'CAT',
  LEVEL1_MIN: 1,
  LEVEL1_MAX: 999,
  
  // 二级类别编码格式：CAT + 3位数字 + 0 + 2位数字
  LEVEL2_PATTERN: /^CAT\d{3}0\d{2}$/,
  LEVEL2_MIN: 1,
  LEVEL2_MAX: 99,
  
  // 编码长度
  LEVEL1_LENGTH: 6, // CAT001
  LEVEL2_LENGTH: 8, // CAT00101
};

/**
 * 产品类别表单验证规则
 */
export const PRODUCT_CATEGORY_VALIDATION = {
  NAME: {
    required: true,
    min: 2,
    max: 50,
    message: {
      required: '请输入类别名称',
      min: '类别名称至少2个字符',
      max: '类别名称不能超过50个字符'
    }
  },
  DESCRIPTION: {
    max: 500,
    message: {
      max: '描述不能超过500个字符'
    }
  },
  SORT_ORDER: {
    required: true,
    min: 1,
    max: 9999,
    message: {
      required: '请输入排序号',
      min: '排序号不能小于1',
      max: '排序号不能大于9999'
    }
  }
};

/**
 * 产品类别默认配置
 */
export const PRODUCT_CATEGORY_DEFAULTS = {
  SORT_ORDER: 1,
  IS_ACTIVE: true,
  PAGE_SIZE: 20,
  SORT_BY: 'sortOrder',
  SORT_ORDER_DIRECTION: 'asc' as const
};

/**
 * 产品类别操作权限
 */
export const PRODUCT_CATEGORY_PERMISSIONS = {
  VIEW: 'product_category:read',
  CREATE: 'product_category:create',
  UPDATE: 'product_category:update',
  DELETE: 'product_category:delete',
  IMPORT: 'product_category:import',
  EXPORT: 'product_category:export',
  BATCH_OPERATION: 'product_category:batch'
};

/**
 * 产品类别导入导出配置
 */
export const PRODUCT_CATEGORY_IMPORT_EXPORT = {
  SUPPORTED_FORMATS: ['xlsx', 'xls', 'csv'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  TEMPLATE_COLUMNS: [
    { key: 'name', label: '类别名称', required: true },
    { key: 'description', label: '描述', required: false },
    { key: 'parentCode', label: '上级类别编码', required: false },
    { key: 'sortOrder', label: '排序号', required: false },
    { key: 'isActive', label: '是否启用', required: false }
  ]
};