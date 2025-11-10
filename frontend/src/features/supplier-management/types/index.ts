// 供应商状态枚举
export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted'
}

// 供应商类型枚举
export enum SupplierType {
  MANUFACTURER = 'manufacturer',
  DISTRIBUTOR = 'distributor',
  SERVICE_PROVIDER = 'service_provider',
  TRADING_COMPANY = 'trading_company'
}

// 供应商等级枚举
export enum SupplierLevel {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D'
}

// 供应商基本信息接口
export interface Supplier {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  type: SupplierType;
  level: SupplierLevel;
  status: SupplierStatus;
  
  // 联系信息
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  
  // 地址信息
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string;
  
  // 财务信息
  taxNumber?: string;
  bankName?: string;
  bankAccount?: string;
  paymentTerms?: string;
  creditLimit?: number;
  
  // 业务信息
  mainProducts?: string;
  businessScope?: string;
  certifications?: string[];
  
  // 评价信息
  qualityRating?: number;
  deliveryRating?: number;
  serviceRating?: number;
  overallRating?: number;
  
  // 系统信息
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// 供应商表单数据接口
export interface SupplierFormData {
  code: string;
  name: string;
  shortName?: string;
  type: SupplierType;
  level: SupplierLevel;
  status: SupplierStatus;
  
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  website?: string;
  
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode?: string;
  
  taxNumber?: string;
  bankName?: string;
  bankAccount?: string;
  paymentTerms?: string;
  creditLimit?: number;
  
  mainProducts?: string;
  businessScope?: string;
  certifications?: string[];
  
  qualityRating?: number;
  deliveryRating?: number;
  serviceRating?: number;
  
  remark?: string;
}

// 供应商查询参数接口
export interface SupplierQueryParams {
  keyword?: string;
  type?: SupplierType;
  level?: SupplierLevel;
  status?: SupplierStatus;
  city?: string;
  province?: string;
  page?: number;
  pageSize?: number;
}

// 供应商统计信息接口
export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  blacklisted: number;
  byType: Record<SupplierType, number>;
  byLevel: Record<SupplierLevel, number>;
}

// 供应商价格表接口
export interface SupplierPrice {
  id: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  productImage?: string;
  productCode: string;

  specification?: string;
  model?: string;
  unit: string;
  taxInclusivePrice: number; // 采购单价(含税)
  vatRate: number; // 增值税税率
  taxExclusivePrice: number; // 采购单价（不含税）
  taxAmount: number; // 税额
  purchaseManager: string; // 采购负责人
  submittedBy: string; // 提交人
  submittedAt: Date; // 提交时间
  updatedAt: Date; // 更新时间
  createdAt: Date;
  createdBy: string;
  updatedBy: string;
}

// 供应商价格表表单数据接口
export interface SupplierPriceFormData {
  supplierId: string;
  productName: string;
  productImage?: string;
  productCode: string;

  specification?: string;
  model?: string;
  unit: string;
  taxInclusivePrice: number;
  vatRate: number;
  purchaseManager: string;
}

// 供应商价格表查询参数接口
export interface SupplierPriceQueryParams {
  keyword?: string;
  supplierId?: string;
  supplierName?: string;
  productName?: string;
  productCode?: string;

  purchaseManager?: string;
  page?: number;
  pageSize?: number;
}

// 供应商价格表统计接口
export interface SupplierPriceStats {
  total: number;
  bySupplier: Record<string, number>;
  avgTaxInclusivePrice: number;
  avgTaxExclusivePrice: number;
  avgVatRate: number;
}