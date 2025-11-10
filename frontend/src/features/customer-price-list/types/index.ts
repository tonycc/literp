/**
 * 客户价格表相关类型定义
 */

// 价格表状态枚举
export enum PriceListStatus {
  ACTIVE = 'active',              // 生效
  INACTIVE = 'inactive',          // 失效
  PENDING = 'pending',            // 待生效
  EXPIRED = 'expired',            // 已过期
}

// 增值税税率枚举
export enum VATRate {
  RATE_0 = 0,                     // 0%
  RATE_3 = 3,                     // 3%
  RATE_6 = 6,                     // 6%
  RATE_9 = 9,                     // 9%
  RATE_13 = 13,                   // 13%
}

// 单位枚举
export enum Unit {
  PCS = 'pcs',                    // 件
  SET = 'set',                    // 套
  BOX = 'box',                    // 箱
  KG = 'kg',                      // 千克
  G = 'g',                        // 克
  M = 'm',                        // 米
  CM = 'cm',                      // 厘米
  M2 = 'm2',                      // 平方米
  M3 = 'm3',                      // 立方米
  L = 'l',                        // 升
  ML = 'ml',                      // 毫升
  PAIR = 'pair',                  // 对
  DOZEN = 'dozen',                // 打
}

// 客户价格表接口
export interface CustomerPriceList {
  id: string;
  customerId: string;             // 客户ID
  customerName: string;           // 客户名称
  productName: string;            // 产品名称
  productImage?: string;          // 产品图片
  productCode: string;            // 产品编码
  customerProductCode?: string;   // 客户产品编码

  specification?: string;         // 规格型号
  unit: Unit;                     // 单位
  priceIncludingTax: number;      // 销售单价(含税)
  vatRate: VATRate;               // 增值税税率
  priceExcludingTax: number;      // 销售单价（不含税）
  taxAmount: number;              // 税额
  effectiveDate: string;          // 生效日期
  expiryDate?: string;            // 失效日期
  status: PriceListStatus;        // 状态
  salesManager: string;           // 销售负责人
  submittedBy: string;            // 提交人
  createdAt: string;              // 创建时间
  updatedAt: string;              // 更新时间
  createdBy: string;              // 创建人
  updatedBy: string;              // 更新人
}

// 创建客户价格表数据接口
export interface CreateCustomerPriceListData {
  customerId: string;
  productName: string;
  productImage?: string;
  productCode: string;
  customerProductCode?: string;

  specification?: string;
  unit: Unit;
  priceIncludingTax: number;
  vatRate: VATRate;
  effectiveDate: string;
  expiryDate?: string;
  status: PriceListStatus;
  salesManager: string;
}

// 更新客户价格表数据接口
export interface UpdateCustomerPriceListData extends Partial<CreateCustomerPriceListData> {
  id: string;
}

// 客户价格表列表查询参数
export interface CustomerPriceListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;              // 关键词搜索
  customerId?: string;           // 客户筛选
  productCode?: string;          // 产品编码筛选

  status?: PriceListStatus;      // 状态筛选
  salesManager?: string;         // 销售负责人筛选
  effectiveDateStart?: string;   // 生效日期开始
  effectiveDateEnd?: string;     // 生效日期结束
  sortBy?: string;               // 排序字段
  sortOrder?: 'asc' | 'desc';    // 排序方向
}

// 客户价格表列表响应接口
export interface CustomerPriceListResponse {
  data: CustomerPriceList[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 客户价格表统计接口
export interface CustomerPriceListStats {
  totalPriceLists: number;       // 总价格表数
  activePriceLists: number;      // 生效价格表数
  expiringSoon: number;          // 即将过期数量
  statusDistribution: {         // 状态分布
    [key in PriceListStatus]: number;
  };

}

// 表单验证规则接口
export interface FormRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  type?: string;
  validator?: (rule: FormRule, value: unknown) => Promise<void>;
}

// 客户价格表表单验证规则
export interface CustomerPriceListFormRules {
  customerId: FormRule[];
  productName: FormRule[];
  productCode: FormRule[];
  customerProductCode?: FormRule[];

  specification?: FormRule[];
  unit: FormRule[];
  priceIncludingTax: FormRule[];
  vatRate: FormRule[];
  effectiveDate: FormRule[];
  expiryDate?: FormRule[];
  status: FormRule[];
  salesManager: FormRule[];
}

// 客户选项接口
export interface CustomerOption {
  value: string;
  label: string;
}

// 销售负责人选项接口
export interface SalesManagerOption {
  value: string;
  label: string;
}

// 产品选项接口
export interface ProductOption {
  value: string;
  label: string;
  code: string;

  specification?: string;
  image?: string;
}