import { SupplierStatus } from '@zyerp/shared'

export const SUPPLIER_STATUS_OPTIONS = [
  { label: '启用', value: SupplierStatus.ACTIVE },
  { label: '停用', value: SupplierStatus.INACTIVE },
]

export const SUPPLIER_STATUS_VALUE_ENUM_PRO = {
  [SupplierStatus.ACTIVE]: { text: '启用', status: 'Success' },
  [SupplierStatus.INACTIVE]: { text: '停用', status: 'Default' },
} as const

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