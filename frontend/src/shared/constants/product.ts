import { ProductType, ProductStatus, AcquisitionMethod } from '@zyerp/shared';

/**
 * 产品类型映射
 */
export const PRODUCT_TYPE_MAP = {
  [ProductType.RAW_MATERIAL]: { label: '原材料', color: 'blue', tooltip: '用于生产的原材料' },
  [ProductType.SEMI_FINISHED_PRODUCT]: { label: '半成品', color: 'orange', tooltip: '已部分加工的产品' },
  [ProductType.FINISHED_PRODUCT]: { label: '成品', color: 'green', tooltip: '已完成加工的产品' },
};

/**
 * 产品类型选项 (由 PRODUCT_TYPE_MAP 动态生成)
 */
export const PRODUCT_TYPE_OPTIONS = Object.entries(PRODUCT_TYPE_MAP).map(([value, { label }]) => ({
  label,
  value,
}));

/**
 * 产品类型枚举 (ProTable 专用)
 */
export const PRODUCT_TYPE_VALUE_ENUM_PRO = Object.fromEntries(
  Object.entries(PRODUCT_TYPE_MAP).map(([key, config]) => [
    key,
    { text: config.label, status: config.color === 'green' ? 'Success' : config.color === 'orange' ? 'Warning' : 'Processing' },
  ])
);

/**
 * 产品状态映射
 */
export const PRODUCT_STATUS_MAP = {
  [ProductStatus.ACTIVE]: { label: '启用', color: 'green', status: 'success', tooltip: '产品处于启用状态' },
  [ProductStatus.INACTIVE]: { label: '停用', color: 'grey', status: 'default', tooltip: '产品已停用' },
  [ProductStatus.DRAFT]: { label: '草稿', color: 'orange', status: 'warning', tooltip: '产品信息尚未完善' },
} as const;

/**
 * 产品状态选项 (由 PRODUCT_STATUS_MAP 动态生成)
 */
export const PRODUCT_STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_MAP).map(([value, { label }]) => ({
  label,
  value,
}));

/**
 * 产品状态枚举 (ProTable 专用)
 */
export const PRODUCT_STATUS_VALUE_ENUM_PRO = Object.fromEntries(
  Object.entries(PRODUCT_STATUS_MAP).map(([key, config]) => [
    key,
    { text: config.label, status: config.status },
  ])
);


/**
 * 获取方式映射
 */
export const ACQUISITION_METHOD_MAP = {
  [AcquisitionMethod.PURCHASE]: { label: '采购', color: 'blue' },
  [AcquisitionMethod.PRODUCTION]: { label: '生产', color: 'green' },
  [AcquisitionMethod.OUTSOURCING]: { label: '外协', color: 'orange' },
};

/**
 * 获取方式选项 (由 ACQUISITION_METHOD_MAP 动态生成)
 */
export const ACQUISITION_METHOD_OPTIONS = Object.entries(ACQUISITION_METHOD_MAP).map(([value, { label }]) => ({
  label,
  value,
}));
