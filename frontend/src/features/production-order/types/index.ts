// 生产工单状态枚举
export enum ProductionOrderStatus {
  PENDING = 'pending',           // 待生产
  IN_PROGRESS = 'in_progress',   // 生产中
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled',       // 已取消
  PAUSED = 'paused'             // 已暂停
}

// 生产工单状态配置
export const PRODUCTION_ORDER_STATUS_CONFIG = {
  [ProductionOrderStatus.PENDING]: {
    text: '待生产',
    color: 'orange',
    badge: 'warning'
  },
  [ProductionOrderStatus.IN_PROGRESS]: {
    text: '生产中',
    color: 'blue',
    badge: 'processing'
  },
  [ProductionOrderStatus.COMPLETED]: {
    text: '已完成',
    color: 'green',
    badge: 'success'
  },
  [ProductionOrderStatus.CANCELLED]: {
    text: '已取消',
    color: 'red',
    badge: 'error'
  },
  [ProductionOrderStatus.PAUSED]: {
    text: '已暂停',
    color: 'gray',
    badge: 'default'
  }
};

// 产品信息接口

// 为生产工单创建简化的产品信息类型
export interface ProductSummary {
  id: string;
  code: string;        // 产品编码
  name: string;        // 产品名称
  specification?: string; // 规格
  unit: string;        // 单位
  category?: string;   // 分类
}

// 销售订单信息接口
export interface SalesOrderInfo {
  id: string;
  orderNumber: string; // 销售订单号
  customerName: string; // 客户名称
  orderDate: string;   // 订单日期
}

// 生产工单接口
export interface ProductionOrder {
  id: string;
  orderNumber: string;           // 工单号
  productInfo: ProductSummary;   // 产品信息
  salesOrder?: SalesOrderInfo;   // 销售订单（可选）
  customerName: string;          // 客户名称
  plannedQuantity: number;       // 计划数量
  producedQuantity: number;      // 生产数量
  status: ProductionOrderStatus; // 状态
  plannedStartDate: string;      // 计划开始时间
  plannedEndDate: string;        // 计划结束时间
  expectedDeliveryDate?: string; // 期望交付日期
  actualStartDate?: string;      // 实际开始时间
  actualEndDate?: string;        // 实际结束时间
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
  createdBy: string;            // 创建人
  updatedBy?: string;           // 更新人
  remark?: string;              // 备注
}

// 生产工单查询参数接口
export interface ProductionOrderQueryParams {
  page?: number;
  pageSize?: number;
  orderNumber?: string;          // 工单号
  productName?: string;          // 产品名称
  customerName?: string;         // 客户名称
  status?: ProductionOrderStatus; // 状态
  plannedStartDate?: string;     // 计划开始时间（开始）
  plannedEndDate?: string;       // 计划开始时间（结束）
  createdAtStart?: string;       // 创建时间（开始）
  createdAtEnd?: string;         // 创建时间（结束）
  sortBy?: string;              // 排序字段
  sortOrder?: 'asc' | 'desc';   // 排序方向
}

// 生产工单统计信息接口
export interface ProductionOrderStatistics {
  total: number;           // 总数
  pending: number;         // 待生产
  inProgress: number;      // 生产中
  completed: number;       // 已完成
  cancelled: number;       // 已取消
  paused: number;         // 已暂停
  todayCreated: number;   // 今日新增
  overdueCount: number;   // 逾期数量
}

// 生产工单列表响应接口
export interface ProductionOrderListResponse {
  data: ProductionOrder[];
  total: number;
  page: number;
  pageSize: number;
  statistics: ProductionOrderStatistics;
}