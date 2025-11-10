/**
 * 计量单位管理相关类型定义
 */

/**
 * 单位分类枚举
 */
export enum UnitCategory {
  QUANTITY = 'quantity',     // 数量
  WEIGHT = 'weight',         // 重量
  LENGTH = 'length',         // 长度
  AREA = 'area',             // 面积
  VOLUME = 'volume',         // 体积
  TIME = 'time',             // 时间
  TEMPERATURE = 'temperature', // 温度
  PRESSURE = 'pressure',     // 压力
  POWER = 'power',           // 功率
  ENERGY = 'energy',         // 能量
  CURRENCY = 'currency',     // 货币
  OTHER = 'other'            // 其他
}

/**
 * 计量单位信息接口
 */
export interface UnitInfo {
  id: string;
  name: string;           // 单位名称，如：个、千克、米
  symbol: string;         // 单位符号，如：pcs、kg、m
  category: UnitCategory; // 单位分类
  baseUnitId?: string;    // 基础单位ID（用于换算）
  conversionRate?: number; // 换算比率
  precision: number;      // 精度（小数位数）
  description?: string;   // 单位描述
  remark?: string;        // 备注
  isActive: boolean;      // 是否启用
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  
  // 关联数据
  baseUnit?: UnitInfo;    // 基础单位信息
}

/**
 * 计量单位表单数据接口
 */
export interface UnitFormData {
  name: string;
  symbol: string;
  category: UnitCategory;
  baseUnitId?: string;
  conversionRate?: number;
  precision: number;
  description?: string;
  remark?: string;
  isActive: boolean;
}

/**
 * 计量单位查询参数接口
 */
export interface UnitQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  name?: string;
  symbol?: string;
  category?: UnitCategory;
  baseUnitId?: string;
  isActive?: boolean;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 计量单位列表响应接口
 */
export interface UnitListResponse {
  success: boolean;
  data: UnitInfo[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  message?: string;
  timestamp: Date;
}

/**
 * 单位换算接口
 */
export interface UnitConversion {
  fromUnitId: string;
  toUnitId: string;
  fromUnit?: UnitInfo;
  toUnit?: UnitInfo;
  conversionRate: number;
  formula?: string;       // 换算公式描述
}

/**
 * 单位换算计算接口
 */
export interface UnitConversionCalculation {
  fromValue: number;
  fromUnitId: string;
  toUnitId: string;
  toValue: number;
  conversionRate: number;
  success: boolean;
  message?: string;
}