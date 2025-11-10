// 采购订单状态枚举
export enum PurchaseOrderStatus {
  DRAFT = 'draft',           // 草稿
  PENDING = 'pending',       // 待审核
  APPROVED = 'approved',     // 已审核
  ORDERED = 'ordered',       // 已下单
  PARTIAL_RECEIVED = 'partial_received', // 部分收货
  RECEIVED = 'received',     // 已收货
  COMPLETED = 'completed',   // 已完成
  CANCELLED = 'cancelled'    // 已取消
}

// 采购订单产品项接口
export interface PurchaseOrderItem {
  id?: string;                // 产品项ID（可选，用于编辑时）
  productCode: string;        // 产品编码
  productName: string;        // 产品名称
  specification: string;      // 规格
  quantity: number;           // 数量
  unit: string;               // 单位
  unitPrice: number;          // 单价
  subtotal: number;           // 小计
  batchNumber: string;        // 产品批次号
  remark?: string;            // 产品备注
}

// 采购订单接口
export interface PurchaseOrder {
  id: string;
  orderNumber: string;        // 订单号
  supplierId: string;         // 供应商ID
  supplierName: string;       // 供应商名称
  items: PurchaseOrderItem[]; // 产品项列表
  orderAmount: number;        // 订单金额
  orderDate: string;          // 订单日期
  expectedDeliveryDate: string; // 预期交付日期
  status: PurchaseOrderStatus; // 订单状态
  createdAt: string;          // 创建时间
  updatedAt: string;          // 更新时间
  createdBy?: string;         // 创建人
  updatedBy?: string;         // 更新人
  remark?: string;            // 备注
}

// 兼容性接口：用于显示单个产品的采购订单（用于表格显示）
export interface PurchaseOrderDisplay extends Omit<PurchaseOrder, 'items'> {
  productName: string;        // 产品名称
  productCode: string;        // 产品编码
  specification: string;      // 规格
  quantity: number;           // 数量
  unit: string;               // 单位
  unitPrice: number;          // 单价
  subtotal: number;           // 小计
  batchNumber: string;        // 产品批次号
}

// 采购订单查询参数
export interface PurchaseOrderQueryParams {
  page?: number;
  pageSize?: number;
  orderNumber?: string;       // 订单号搜索
  supplierName?: string;      // 供应商名称搜索
  productName?: string;       // 产品名称搜索
  productCode?: string;       // 产品编码搜索
  status?: PurchaseOrderStatus; // 状态筛选
  startDate?: string;         // 开始日期
  endDate?: string;           // 结束日期
}

// 采购订单表单数据
export interface PurchaseOrderFormData {
  orderNumber?: string;       // 订单号（新增时可选，系统自动生成）
  supplierId: string;         // 供应商ID
  items: PurchaseOrderItem[]; // 产品项列表
  orderDate: string;          // 订单日期
  expectedDeliveryDate: string; // 预期交付日期
  remark?: string;            // 备注
}

// 采购订单统计数据
export interface PurchaseOrderStats {
  totalOrders: number;        // 总订单数
  totalAmount: number;        // 总金额
  pendingOrders: number;      // 待处理订单数
  completedOrders: number;    // 已完成订单数
}