import { SupplierStatus, SupplierCategory } from '@zyerp/shared'

export const SUPPLIER_STATUS_OPTIONS = [
  { label: '启用', value: SupplierStatus.ACTIVE },
  { label: '停用', value: SupplierStatus.INACTIVE },
]

export const SUPPLIER_CATEGORY_OPTIONS = [
  { label: '制造商', value: SupplierCategory.MANUFACTURER },
  { label: '分销商', value: SupplierCategory.DISTRIBUTOR },
  { label: '服务商', value: SupplierCategory.SERVICE },
  { label: '其他', value: SupplierCategory.OTHER },
]

export const SUPPLIER_STATUS_VALUE_ENUM_PRO = {
  [SupplierStatus.ACTIVE]: { text: '启用', status: 'Success' },
  [SupplierStatus.INACTIVE]: { text: '停用', status: 'Default' },
}

export const SUPPLIER_CATEGORY_VALUE_ENUM_PRO = {
  [SupplierCategory.MANUFACTURER]: { text: '制造商' },
  [SupplierCategory.DISTRIBUTOR]: { text: '分销商' },
  [SupplierCategory.SERVICE]: { text: '服务商' },
  [SupplierCategory.OTHER]: { text: '其他' },
}

export const SUPPLIER_VAT_RATE_OPTIONS = [
  { label: '13%', value: 0.13 },
  { label: '9%', value: 0.09 },
  { label: '6%', value: 0.06 },
  { label: '3%', value: 0.03 },
]

export const SUPPLIER_VAT_RATE_VALUE_ENUM_PRO = {
  '0.13': { text: '13%' },
  '0.09': { text: '9%' },
  '0.06': { text: '6%' },
  '0.03': { text: '3%' },
}

export const SUPPLIER_PURCHASE_MANAGER_OPTIONS = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
]