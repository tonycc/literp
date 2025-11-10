/**
 * 采购退货状态枚举
 */
export enum PurchaseReturnStatus {
  PENDING = 'pending',           // 待审核
  APPROVED = 'approved',         // 已审核
  PROCESSING = 'processing',     // 处理中
  COMPLETED = 'completed',       // 已完成
  REJECTED = 'rejected',         // 已拒绝
  CANCELLED = 'cancelled'        // 已取消
}

/**
 * 采购退货接口
 */
export interface PurchaseReturn {
  id: string;                    // 退货编号
  purchaseOrderId: string;       // 采购订单编号
  supplierName: string;          // 供应商名称
  supplierContact: string;       // 供应商联系人
  purchaseManager: string;       // 采购负责人
  returnDate: string;            // 退货申请日期
  returnReason: string;          // 退货原因
  totalQuantity: number;         // 退货总数量
  totalAmount: number;           // 退货总金额
  status: PurchaseReturnStatus;  // 状态
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  remark?: string;               // 备注
}

/**
 * 采购退货查询参数
 */
export interface PurchaseReturnQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;              // 关键词搜索（退货编号、采购订单编号、供应商名称）
  status?: PurchaseReturnStatus; // 状态筛选
  startDate?: string;            // 开始日期
  endDate?: string;              // 结束日期
  supplierName?: string;         // 供应商名称筛选
  purchaseManager?: string;      // 采购负责人筛选
}

/**
 * 采购退货表单数据
 */
export interface PurchaseReturnFormData {
  purchaseOrderId: string;       // 采购订单编号
  supplierName: string;          // 供应商名称
  supplierContact: string;       // 供应商联系人
  purchaseManager: string;       // 采购负责人
  returnDate: string;            // 退货申请日期
  returnReason: string;          // 退货原因
  totalQuantity: number;         // 退货总数量
  totalAmount: number;           // 退货总金额
  remark?: string;               // 备注
}

/**
 * 采购退货统计信息
 */
export interface PurchaseReturnStats {
  totalReturns: number;          // 总退货数
  pendingReturns: number;        // 待审核退货数
  completedReturns: number;      // 已完成退货数
  totalReturnAmount: number;     // 总退货金额
}

/**
 * 采购退货状态标签配置
 */
export const PURCHASE_RETURN_STATUS_CONFIG = {
  [PurchaseReturnStatus.PENDING]: {
    text: '待审核',
    color: 'orange'
  },
  [PurchaseReturnStatus.APPROVED]: {
    text: '已审核',
    color: 'blue'
  },
  [PurchaseReturnStatus.PROCESSING]: {
    text: '处理中',
    color: 'purple'
  },
  [PurchaseReturnStatus.COMPLETED]: {
    text: '已完成',
    color: 'green'
  },
  [PurchaseReturnStatus.REJECTED]: {
    text: '已拒绝',
    color: 'red'
  },
  [PurchaseReturnStatus.CANCELLED]: {
    text: '已取消',
    color: 'gray'
  }
} as const;