/**
 * 客户管理相关类型定义
 */

// 客户分类枚举
export enum CustomerCategory {
  ENTERPRISE = 'enterprise',      // 企业客户
  INDIVIDUAL = 'individual',      // 个人客户
  GOVERNMENT = 'government',      // 政府客户
  INSTITUTION = 'institution',    // 机构客户
}

// 客户状态枚举
export enum CustomerStatus {
  ACTIVE = 'active',              // 活跃
  INACTIVE = 'inactive',          // 非活跃
  SUSPENDED = 'suspended',        // 暂停
  BLACKLISTED = 'blacklisted',    // 黑名单
}

// 信用等级枚举
export enum CreditLevel {
  AAA = 'AAA',                    // 最高信用
  AA = 'AA',                      // 高信用
  A = 'A',                        // 良好信用
  BBB = 'BBB',                    // 一般信用
  BB = 'BB',                      // 较差信用
  B = 'B',                        // 差信用
  C = 'C',                        // 最差信用
}

// 客户信息接口
export interface Customer {
  id: string;
  code: string;                   // 客户编码
  name: string;                   // 客户名称
  category: CustomerCategory;     // 客户分类
  contactPerson: string;          // 联系人
  phone: string;                  // 联系电话
  email?: string;                 // 邮箱
  address: string;                // 地址
  creditLevel: CreditLevel;       // 信用等级
  creditLimit?: number;           // 信用额度
  status: CustomerStatus;         // 状态
  taxNumber?: string;             // 税号
  bankAccount?: string;           // 银行账户
  bankName?: string;              // 开户银行
  website?: string;               // 网站
  industry?: string;              // 行业
  establishedDate?: string;       // 成立日期
  registeredCapital?: number;     // 注册资本
  businessLicense?: string;       // 营业执照号
  legalRepresentative?: string;   // 法定代表人
  remark?: string;                // 备注
  createdAt: string;              // 创建时间
  updatedAt: string;              // 更新时间
  createdBy: string;              // 创建人
  updatedBy: string;              // 更新人
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
  establishedDate?: string;
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
  keyword?: string;              // 关键词搜索
  category?: CustomerCategory;   // 客户分类筛选
  status?: CustomerStatus;       // 状态筛选
  creditLevel?: CreditLevel;     // 信用等级筛选
  industry?: string;             // 行业筛选
  sortBy?: string;               // 排序字段
  sortOrder?: 'asc' | 'desc';    // 排序方向
}

// 客户列表响应接口
export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 客户统计信息
export interface CustomerStats {
  totalCustomers: number;        // 总客户数
  activeCustomers: number;       // 活跃客户数
  newCustomersThisMonth: number; // 本月新增客户数
  topCreditLevelCount: number;   // 高信用等级客户数
  categoryDistribution: {       // 客户分类分布
    [key in CustomerCategory]: number;
  };
  creditLevelDistribution: {    // 信用等级分布
    [key in CreditLevel]: number;
  };
}

// 表单验证规则类型
export interface FormRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  type?: string;
  validator?: (rule: FormRule, value: unknown) => Promise<void>;
}

// 客户表单验证规则
export interface CustomerFormRules {
  code: FormRule[];
  name: FormRule[];
  category: FormRule[];
  contactPerson: FormRule[];
  phone: FormRule[];
  email?: FormRule[];
  address: FormRule[];
  creditLevel: FormRule[];
  creditLimit?: FormRule[];
  status: FormRule[];
  taxNumber?: FormRule[];
  bankAccount?: FormRule[];
  bankName?: FormRule[];
  website?: FormRule[];
  industry?: FormRule[];
  establishedDate?: FormRule[];
  registeredCapital?: FormRule[];
  businessLicense?: FormRule[];
  legalRepresentative?: FormRule[];
}

// 客户选项接口（用于下拉选择）
export interface CustomerOption {
  value: string;
  label: string;
  category: CustomerCategory;
  status: CustomerStatus;
}