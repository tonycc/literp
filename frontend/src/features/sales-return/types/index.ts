// 销售退货状态枚举
export enum ReturnStatus {
  PENDING = 'pending',           // 待处理
  APPROVED = 'approved',         // 已批准
  PROCESSING = 'processing',     // 处理中
  COMPLETED = 'completed',       // 已完成
  REJECTED = 'rejected',         // 已拒绝
  CANCELLED = 'cancelled'        // 已取消
}

// 退货原因枚举
export enum ReturnReason {
  QUALITY_ISSUE = 'quality_issue',           // 质量问题
  WRONG_PRODUCT = 'wrong_product',           // 发错货
  DAMAGED = 'damaged',                       // 运输损坏
  NOT_AS_DESCRIBED = 'not_as_described',     // 与描述不符
  CUSTOMER_CHANGE = 'customer_change',       // 客户变更需求
  OVERSTOCK = 'overstock',                   // 库存过多
  OTHER = 'other'                            // 其他原因
}

// 退货产品信息接口
export interface ReturnProduct {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  specification: string;
  unit: string;
  originalQuantity: number;      // 原销售数量
  returnQuantity: number;        // 退货数量
  unitPrice: number;             // 单价
  totalAmount: number;           // 退货金额
  reason: ReturnReason;          // 退货原因
  remark?: string;               // 备注
}

// 销售退货单接口
export interface SalesReturn {
  id: string;
  returnNumber: string;          // 退货单号
  originalSalesNumber: string;   // 原销售单号
  customerId: string;            // 客户ID
  customerName: string;          // 客户名称
  customerContact: string;       // 客户联系方式
  returnDate: string;            // 退货日期
  status: ReturnStatus;          // 退货状态
  totalAmount: number;           // 退货总金额
  products: ReturnProduct[];     // 退货产品列表
  reason: ReturnReason;          // 主要退货原因
  description?: string;          // 退货说明
  approvedBy?: string;           // 审批人
  approvedAt?: string;           // 审批时间
  processedBy?: string;          // 处理人
  processedAt?: string;          // 处理时间
  remark?: string;               // 备注
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}

// 销售退货查询参数接口
export interface SalesReturnQueryParams {
  page?: number;
  pageSize?: number;
  returnNumber?: string;         // 退货单号
  originalSalesNumber?: string;  // 原销售单号
  customerName?: string;         // 客户名称
  status?: ReturnStatus;         // 退货状态
  reason?: ReturnReason;         // 退货原因
  startDate?: string;            // 开始日期
  endDate?: string;              // 结束日期
  approvedBy?: string;           // 审批人
  processedBy?: string;          // 处理人
}

// 销售退货表单数据接口
export interface SalesReturnFormData {
  returnNumber: string;
  originalSalesNumber: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  returnDate: string;
  reason: ReturnReason;
  description?: string;
  products: Omit<ReturnProduct, 'id'>[];
  remark?: string;
}

// 退货状态配置
export const RETURN_STATUS_CONFIG = {
  [ReturnStatus.PENDING]: {
    label: '待处理',
    color: 'orange',
    bgColor: '#fff7e6',
    borderColor: '#ffd591'
  },
  [ReturnStatus.APPROVED]: {
    label: '已批准',
    color: 'blue',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  },
  [ReturnStatus.PROCESSING]: {
    label: '处理中',
    color: 'purple',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  },
  [ReturnStatus.COMPLETED]: {
    label: '已完成',
    color: 'green',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  [ReturnStatus.REJECTED]: {
    label: '已拒绝',
    color: 'red',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7'
  },
  [ReturnStatus.CANCELLED]: {
    label: '已取消',
    color: 'default',
    bgColor: '#f5f5f5',
    borderColor: '#d9d9d9'
  }
} as const;

// 退货原因配置
export const RETURN_REASON_CONFIG = {
  [ReturnReason.QUALITY_ISSUE]: {
    label: '质量问题',
    color: 'red'
  },
  [ReturnReason.WRONG_PRODUCT]: {
    label: '发错货',
    color: 'orange'
  },
  [ReturnReason.DAMAGED]: {
    label: '运输损坏',
    color: 'volcano'
  },
  [ReturnReason.NOT_AS_DESCRIBED]: {
    label: '与描述不符',
    color: 'magenta'
  },
  [ReturnReason.CUSTOMER_CHANGE]: {
    label: '客户变更需求',
    color: 'blue'
  },
  [ReturnReason.OVERSTOCK]: {
    label: '库存过多',
    color: 'cyan'
  },
  [ReturnReason.OTHER]: {
    label: '其他原因',
    color: 'default'
  }
} as const;

// 原销售单信息接口（用于选择）
export interface OriginalSalesOrder {
  id: string;
  salesNumber: string;
  customerId: string;
  customerName: string;
  customerContact: string;
  salesDate: string;
  totalAmount: number;
  products: Array<{
    id: string;
    productId: string;
    productName: string;
    productCode: string;
    specification: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
  }>;
}