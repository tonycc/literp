/**
 * 客户类型定义（共享）
 */

// 客户分类枚举
export enum CustomerCategory {
  ENTERPRISE = 'enterprise',
  INDIVIDUAL = 'individual',
  GOVERNMENT = 'government',
  INSTITUTION = 'institution',
}

// 客户状态枚举
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
}

// 信用等级枚举
export enum CreditLevel {
  AAA = 'AAA',
  AA = 'AA',
  A = 'A',
  BBB = 'BBB',
  BB = 'BB',
  B = 'B',
  C = 'C',
}

// 客户信息接口
export interface Customer {
  id: string;
  code: string;
  name: string;
  category: CustomerCategory;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  creditLevel: CreditLevel;
  creditLimit?: number;
  status: CustomerStatus;
  taxNumber?: string;
  bankAccount?: string;
  bankName?: string;
  website?: string;
  industry?: string;
  establishedDate?: string; // ISO 日期字符串
  registeredCapital?: number;
  businessLicense?: string;
  legalRepresentative?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// 创建客户数据接口
export interface CreateCustomerData {
  code: string;
  name: string;
  category: CustomerCategory;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  creditLevel: CreditLevel;
  creditLimit?: number;
  status: CustomerStatus;
  taxNumber?: string;
  bankAccount?: string;
  bankName?: string;
  website?: string;
  industry?: string;
  establishedDate?: string; // ISO 日期字符串
  registeredCapital?: number;
  businessLicense?: string;
  legalRepresentative?: string;
  remark?: string;
}

// 更新客户数据接口
export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string;
}

// 客户列表查询参数
export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: CustomerCategory;
  status?: CustomerStatus;
  creditLevel?: CreditLevel;
  industry?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 客户列表响应接口
export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 客户选项接口
export interface CustomerOption {
  id: string;
  name: string;
  code?: string;
}
