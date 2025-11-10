// 采购入库状态枚举
export enum PurchaseReceiptStatus {
  PENDING = 'pending',       // 待入库
  PARTIAL = 'partial',       // 部分入库
  COMPLETED = 'completed',   // 已完成
  CANCELLED = 'cancelled'    // 已取消
}

// 采购入库接口
export interface PurchaseReceipt {
  id: string;
  receiptNumber: string;      // 入库单编号
  purchaseOrderNumber: string; // 采购订单编号
  productName: string;        // 产品名称
  productCode: string;        // 产品编码
  specification: string;      // 规格型号
  batchNumber: string;        // 物料批次号
  purchaseQuantity: number;   // 采购数量
  arrivedQuantity: number;    // 到货数量
  receivedQuantity: number;   // 已入库数量
  unit: string;               // 单位
  orderDate: string;          // 订单签订日期
  deliveryDate: string;       // 订单交付日期
  receivedBy: string;         // 入库员
  registrationTime: string;   // 登记时间
  remark?: string;            // 备注
  status: PurchaseReceiptStatus; // 入库状态
  createdAt: string;          // 创建时间
  updatedAt: string;          // 更新时间
  createdBy?: string;         // 创建人
  updatedBy?: string;         // 更新人
}

// 采购入库查询参数接口
export interface PurchaseReceiptQueryParams {
  page?: number;
  pageSize?: number;
  receiptNumber?: string;     // 入库单编号搜索
  purchaseOrderNumber?: string; // 采购订单编号搜索
  productName?: string;       // 产品名称搜索
  productCode?: string;       // 产品编码搜索
  batchNumber?: string;       // 批次号搜索
  receivedBy?: string;        // 入库员搜索
  status?: PurchaseReceiptStatus; // 状态筛选
  startDate?: string;         // 开始日期
  endDate?: string;           // 结束日期
}

// 采购入库表单数据接口
export interface PurchaseReceiptFormData {
  receiptNumber?: string;     // 入库单编号（新增时可选，系统自动生成）
  purchaseOrderNumber: string; // 采购订单编号
  productName: string;        // 产品名称
  productCode: string;        // 产品编码
  specification: string;      // 规格型号
  batchNumber: string;        // 物料批次号
  purchaseQuantity: number;   // 采购数量
  arrivedQuantity: number;    // 到货数量
  receivedQuantity: number;   // 已入库数量
  unit: string;               // 单位
  orderDate: string;          // 订单签订日期
  deliveryDate: string;       // 订单交付日期
  receivedBy: string;         // 入库员
  remark?: string;            // 备注
}

// 采购入库统计接口
export interface PurchaseReceiptStats {
  totalReceipts: number;      // 总入库单数
  pendingReceipts: number;    // 待入库数量
  completedReceipts: number;  // 已完成数量
  totalReceivedQuantity: number; // 总入库数量
}