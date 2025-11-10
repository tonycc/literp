/**
 * 销售订单相关类型定义
 */

// 订单状态枚举
export enum SalesOrderStatus {
  DRAFT = 'draft',           // 草稿
  CONFIRMED = 'confirmed',   // 已确认
  PRODUCTION = 'production', // 生产中
  SHIPPED = 'shipped',       // 已发货
  DELIVERED = 'delivered',   // 已交付
  COMPLETED = 'completed',   // 已完成
  CANCELLED = 'cancelled'    // 已取消
}

// 收款方式枚举
export enum PaymentMethod {
  CASH = 'cash',                    // 现金
  BANK_TRANSFER = 'bank_transfer',  // 银行转账
  CREDIT_CARD = 'credit_card',      // 信用卡
  CHECK = 'check',                  // 支票
  INSTALLMENT = 'installment',      // 分期付款
  ADVANCE = 'advance'               // 预付款
}

// 生产状态枚举
export enum ProductionStatus {
  NOT_STARTED = 'not_started',     // 未开始
  IN_PROGRESS = 'in_progress',     // 进行中
  PAUSED = 'paused',               // 暂停
  COMPLETED = 'completed',         // 已完成
  CANCELLED = 'cancelled'          // 已取消
}

// 生产记录接口
export interface ProductionRecord {
  id: string;                      // 生产记录ID
  salesOrderId: string;            // 关联的销售订单ID
  productionOrderNumber: string;   // 生产订单号
  productName: string;             // 产品名称
  productCode: string;             // 产品编码
  plannedQuantity: number;         // 计划生产数量
  actualQuantity: number;          // 实际生产数量
  startDate: string;               // 开始生产日期
  endDate?: string;                // 结束生产日期
  plannedEndDate: string;          // 计划完成日期
  productionManager: string;       // 生产负责人
  productionLine: string;          // 生产线
  status: ProductionStatus;        // 生产状态
  progress: number;                // 生产进度(%)
  qualityCheckPassed: number;      // 质检通过数量
  defectiveQuantity: number;       // 不良品数量
  materialCost: number;            // 材料成本
  laborCost: number;               // 人工成本
  totalCost: number;               // 总成本
  remark?: string;                 // 备注
  createdAt: string;               // 创建时间
  updatedAt: string;               // 更新时间
}

// 销售订单接口
export interface SalesOrder {
  id: string;                    // 订单ID
  customerName?: string;         // 客户名称
  orderDate: string;             // 下单日期
  status: SalesOrderStatus;      // 订单状态
  totalAmount?: number;          // 总金额（含税）
  currency?: string;             // 币种
  remark?: string;               // 备注
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  items: SalesOrderItem[];       // 订单明细
}

// 销售订单明细（与后端 sales_order_items 对齐）
export interface SalesOrderItem {
  id: string;
  orderId: string;
  productId: string;
  unitId?: string;
  warehouseId?: string;
  quantity: number;
  price: number;
  amount: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; code?: string; name: string };
  unit?: { id: string; name: string; symbol?: string };
  warehouse?: { id: string; code?: string; name: string };
}

// 销售订单查询参数
export interface SalesOrderQueryParams {
  page?: number;
  pageSize?: number;
  orderNumber?: string;          // 订单编号搜索
  customerName?: string;         // 客户名称搜索
  productName?: string;          // 产品名称搜索
  salesManager?: string;         // 销售负责人搜索
  status?: SalesOrderStatus;     // 状态筛选
  startDate?: string;            // 开始日期
  endDate?: string;              // 结束日期
  paymentMethod?: PaymentMethod; // 收款方式筛选
}

// 销售订单表单数据
export interface SalesOrderFormData {
  customerName: string;
  contactInfo: string;
  orderDate: string;
  deliveryDate: string;
  salesManager: string;
  productName: string;
  productCode: string;
  customerProductCode?: string;
  specification: string;
  unit: string;
  quantity: number;
  unitPriceWithTax: number;
  taxRate: number;
  paymentMethod: PaymentMethod;
  plannedPaymentDate: string;
  remark?: string;
}

// 销售订单统计数据
export interface SalesOrderStats {
  totalOrders: number;           // 总订单数
  pendingOrders: number;         // 待处理订单数
  completedOrders: number;       // 已完成订单数
  totalSalesAmount: number;      // 总销售金额
  monthlyGrowth: number;         // 月度增长率
}

// 销售订单状态配置
export const SALES_ORDER_STATUS_CONFIG = {
  [SalesOrderStatus.DRAFT]: {
    text: '草稿',
    color: 'default'
  },
  [SalesOrderStatus.CONFIRMED]: {
    text: '已确认',
    color: 'blue'
  },
  [SalesOrderStatus.PRODUCTION]: {
    text: '生产中',
    color: 'orange'
  },
  [SalesOrderStatus.SHIPPED]: {
    text: '已发货',
    color: 'purple'
  },
  [SalesOrderStatus.DELIVERED]: {
    text: '已交付',
    color: 'cyan'
  },
  [SalesOrderStatus.COMPLETED]: {
    text: '已完成',
    color: 'green'
  },
  [SalesOrderStatus.CANCELLED]: {
    text: '已取消',
    color: 'red'
  }
} as const;

// 收款方式配置
export const PAYMENT_METHOD_CONFIG = {
  [PaymentMethod.CASH]: {
    text: '现金',
    color: 'green'
  },
  [PaymentMethod.BANK_TRANSFER]: {
    text: '银行转账',
    color: 'blue'
  },
  [PaymentMethod.CREDIT_CARD]: {
    text: '信用卡',
    color: 'purple'
  },
  [PaymentMethod.CHECK]: {
    text: '支票',
    color: 'orange'
  },
  [PaymentMethod.INSTALLMENT]: {
    text: '分期付款',
    color: 'cyan'
  },
  [PaymentMethod.ADVANCE]: {
    text: '预付款',
    color: 'gold'
  }
} as const;

// 生产状态配置
export const PRODUCTION_STATUS_CONFIG = {
  [ProductionStatus.NOT_STARTED]: {
    text: '未开始',
    color: 'default'
  },
  [ProductionStatus.IN_PROGRESS]: {
    text: '进行中',
    color: 'blue'
  },
  [ProductionStatus.PAUSED]: {
    text: '暂停',
    color: 'orange'
  },
  [ProductionStatus.COMPLETED]: {
    text: '已完成',
    color: 'green'
  },
  [ProductionStatus.CANCELLED]: {
    text: '已取消',
    color: 'red'
  }
} as const;

// 成本类型枚举
export enum CostType {
  MATERIAL = 'material',        // 物料成本
  LABOR = 'labor',             // 人工成本
  OVERHEAD = 'overhead',       // 制造费用
  OTHER = 'other'              // 其他成本
}

// 物料成本明细接口
export interface MaterialCostDetail {
  id: string;                  // 物料ID
  materialCode: string;        // 物料编码
  materialName: string;        // 物料名称
  specification: string;       // 规格型号
  unit: string;               // 单位
  unitPrice: number;          // 单价
  quantity: number;           // 使用数量
  totalCost: number;          // 总成本
  supplier: string;           // 供应商
  category: string;           // 物料分类
}

// 人工成本明细接口
export interface LaborCostDetail {
  id: string;                 // 工序ID
  processName: string;        // 工序名称
  workerName: string;         // 工人姓名
  workHours: number;          // 工时
  hourlyRate: number;         // 小时工资
  totalCost: number;          // 总成本
  department: string;         // 部门
  skillLevel: string;         // 技能等级
}

// 成本分析汇总接口
export interface CostAnalysis {
  salesOrderId: string;       // 销售订单ID
  productionOrderId: string;  // 生产订单ID
  totalMaterialCost: number;  // 物料总成本
  totalLaborCost: number;     // 人工总成本
  totalOverheadCost: number;  // 制造费用总成本
  totalCost: number;          // 总成本
  salesPrice: number;         // 销售价格
  grossProfit: number;        // 毛利润
  grossProfitMargin: number;  // 毛利率(%)
  materialCostDetails: MaterialCostDetail[];  // 物料成本明细
  laborCostDetails: LaborCostDetail[];        // 人工成本明细
  costBreakdown: {            // 成本占比分析
    materialPercentage: number;  // 物料成本占比
    laborPercentage: number;     // 人工成本占比
    overheadPercentage: number;  // 制造费用占比
  };
  createdAt: string;          // 创建时间
  updatedAt: string;          // 更新时间
}

// 成本类型配置
export const COST_TYPE_CONFIG = {
  [CostType.MATERIAL]: {
    text: '物料成本',
    color: 'blue',
    icon: 'InboxOutlined'
  },
  [CostType.LABOR]: {
    text: '人工成本',
    color: 'green',
    icon: 'UserOutlined'
  },
  [CostType.OVERHEAD]: {
    text: '制造费用',
    color: 'orange',
    icon: 'SettingOutlined'
  },
  [CostType.OTHER]: {
    text: '其他成本',
    color: 'purple',
    icon: 'EllipsisOutlined'
  }
} as const;