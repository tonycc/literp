// 产品类目枚举
export enum ProductType {
  RAW_MATERIAL = 'raw_material',     // 原料
  SEMI_FINISHED = 'semi_finished',   // 半成品
  FINISHED_PRODUCT = 'finished_product', // 产成品
  CONSUMABLE = 'consumable',         // 消耗品
  TOOL = 'tool',                     // 工具
  EQUIPMENT = 'equipment'            // 设备
}

// 库存状态枚举
export enum InventoryStatus {
  NORMAL = 'normal',           // 正常
  LOW_STOCK = 'low_stock',     // 库存不足
  OUT_OF_STOCK = 'out_of_stock', // 缺货
  OVERSTOCKED = 'overstocked', // 库存过多
  RESERVED = 'reserved',       // 已预留
  DAMAGED = 'damaged',         // 损坏
  EXPIRED = 'expired'          // 过期
}

// 库存变动类型枚举
export enum InventoryTransactionType {
  PURCHASE_IN = 'purchase_in',         // 采购入库
  SALES_OUT = 'sales_out',             // 销售出库
  PRODUCTION_IN = 'production_in',     // 生产入库
  PRODUCTION_OUT = 'production_out',   // 生产出库
  TRANSFER_IN = 'transfer_in',         // 调拨入库
  TRANSFER_OUT = 'transfer_out',       // 调拨出库
  ADJUSTMENT_IN = 'adjustment_in',     // 盘盈
  ADJUSTMENT_OUT = 'adjustment_out',   // 盘亏
  RETURN_IN = 'return_in',             // 退货入库
  RETURN_OUT = 'return_out',           // 退货出库
  DAMAGE_OUT = 'damage_out',           // 报损出库
  OTHER_IN = 'other_in',               // 其他入库
  OTHER_OUT = 'other_out'              // 其他出库
}

// 仓库信息接口
export interface Warehouse {
  id: string;
  code: string;                // 仓库编码
  name: string;                // 仓库名称
  type: string;                // 仓库类型
  location: string;            // 仓库位置
  manager: string;             // 仓库管理员
  capacity: number;            // 仓库容量
  status: 'active' | 'inactive'; // 仓库状态
  description?: string;        // 仓库描述
  createdAt: string;
  updatedAt: string;
}

// 库位信息接口
export interface StorageLocation {
  id: string;
  warehouseId: string;         // 所属仓库ID
  warehouseName: string;       // 所属仓库名称
  code: string;                // 库位编码
  name: string;                // 库位名称
  type: string;                // 库位类型
  capacity: number;            // 库位容量
  currentUsage: number;        // 当前使用量
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'; // 库位状态
  description?: string;        // 库位描述
}

// 产品库存信息接口
export interface ProductInventory {
  id: string;
  productId: string;           // 产品ID
  productCode: string;         // 产品编码
  productName: string;         // 产品名称
  productType: ProductType;    // 产品类目
  specification: string;       // 规格型号
  unit: string;                // 计量单位
  warehouseId: string;         // 仓库ID
  warehouseName: string;       // 仓库名称
  locationId?: string;         // 库位ID
  locationName?: string;       // 库位名称
  currentStock: number;        // 当前库存
  availableStock: number;      // 可用库存
  reservedStock: number;       // 预留库存
  minStock: number;            // 最小库存
  maxStock: number;            // 最大库存
  safetyStock: number;         // 安全库存
  reorderPoint: number;        // 再订货点
  averageCost: number;         // 平均成本
  totalValue: number;          // 库存总价值
  status: InventoryStatus;     // 库存状态
  lastInDate?: string;         // 最后入库日期
  lastOutDate?: string;        // 最后出库日期
  expiryDate?: string;         // 过期日期
  batchNumber?: string;        // 批次号
  serialNumber?: string;       // 序列号
  supplier?: string;           // 供应商
  remark?: string;             // 备注
  createdAt: string;
  updatedAt: string;
}

// 库存变动记录接口
export interface InventoryTransaction {
  id: string;
  transactionNumber: string;   // 变动单号
  productId: string;           // 产品ID
  productCode: string;         // 产品编码
  productName: string;         // 产品名称
  warehouseId: string;         // 仓库ID
  warehouseName: string;       // 仓库名称
  locationId?: string;         // 库位ID
  locationName?: string;       // 库位名称
  type: InventoryTransactionType; // 变动类型
  quantity: number;            // 变动数量
  unitPrice: number;           // 单价
  totalAmount: number;         // 总金额
  beforeStock: number;         // 变动前库存
  afterStock: number;          // 变动后库存
  batchNumber?: string;        // 批次号
  serialNumber?: string;       // 序列号
  relatedOrderId?: string;     // 关联单据ID
  relatedOrderNumber?: string; // 关联单据号
  operator: string;            // 操作人
  operatorId: string;          // 操作人ID
  reason?: string;             // 变动原因
  remark?: string;             // 备注
  transactionDate: string;     // 变动日期
  createdAt: string;
  updatedAt: string;
}

// 库存查询参数接口
export interface InventoryQueryParams {
  page?: number;
  pageSize?: number;
  productCode?: string;        // 产品编码
  productName?: string;        // 产品名称
  productType?: ProductType;   // 产品类目
  warehouseId?: string;        // 仓库ID
  locationId?: string;         // 库位ID
  status?: InventoryStatus;    // 库存状态
  minStock?: number;           // 最小库存
  maxStock?: number;           // 最大库存
  supplier?: string;           // 供应商
  batchNumber?: string;        // 批次号
  expiryDateStart?: string;    // 过期日期开始
  expiryDateEnd?: string;      // 过期日期结束
  lastInDateStart?: string;    // 最后入库日期开始
  lastInDateEnd?: string;      // 最后入库日期结束
}

// 库存变动查询参数接口
export interface InventoryTransactionQueryParams {
  page?: number;
  pageSize?: number;
  transactionNumber?: string;  // 变动单号
  productCode?: string;        // 产品编码
  productName?: string;        // 产品名称
  warehouseId?: string;        // 仓库ID
  type?: InventoryTransactionType; // 变动类型
  operator?: string;           // 操作人
  relatedOrderNumber?: string; // 关联单据号
  transactionDateStart?: string; // 变动日期开始
  transactionDateEnd?: string; // 变动日期结束
}

// 库存统计信息接口
export interface InventoryStatistics {
  totalProducts: number;       // 总产品数
  totalValue: number;          // 总库存价值
  lowStockCount: number;       // 库存不足数量
  outOfStockCount: number;     // 缺货数量
  overStockedCount: number;    // 库存过多数量
  expiringSoonCount: number;   // 即将过期数量
  byProductType: {
    [key in ProductType]: {
      count: number;
      value: number;
    }
  };
  byWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    productCount: number;
    totalValue: number;
  }>;
  byStatus: {
    [key in InventoryStatus]: number;
  };
}

// 批次状态枚举
export enum BatchStatus {
  NORMAL = 'normal',           // 正常
  EXPIRED = 'expired',         // 已过期
  EXPIRING_SOON = 'expiring_soon', // 即将过期
  DAMAGED = 'damaged',         // 损坏
  QUARANTINE = 'quarantine',   // 隔离
  RESERVED = 'reserved'        // 已预留
}

// 批次库存信息接口
export interface BatchInventory {
  id: string;
  productId: string;           // 产品ID
  productCode: string;         // 产品编码
  productName: string;         // 产品名称
  warehouseId: string;         // 仓库ID
  warehouseName: string;       // 仓库名称
  locationId?: string;         // 库位ID
  locationName?: string;       // 库位名称
  batchNumber: string;         // 批次号
  lotNumber?: string;          // 批号
  serialNumber?: string;       // 序列号
  quantity: number;            // 批次数量
  availableQuantity: number;   // 可用数量
  reservedQuantity: number;    // 预留数量
  unitCost: number;            // 单位成本
  totalCost: number;           // 总成本
  status: BatchStatus;         // 批次状态
  productionDate?: string;     // 生产日期
  expiryDate?: string;         // 过期日期
  receivedDate: string;        // 入库日期
  supplier?: string;           // 供应商
  supplierBatchNumber?: string; // 供应商批次号
  qualityStatus?: 'passed' | 'failed' | 'pending'; // 质检状态
  storageConditions?: string;  // 存储条件
  remark?: string;             // 备注
  createdAt: string;
  updatedAt: string;
}

// 批次库存查询参数接口
export interface BatchInventoryQueryParams {
  page?: number;
  pageSize?: number;
  productId?: string;          // 产品ID
  productCode?: string;        // 产品编码
  productName?: string;        // 产品名称
  warehouseId?: string;        // 仓库ID
  locationId?: string;         // 库位ID
  batchNumber?: string;        // 批次号
  status?: BatchStatus;        // 批次状态
  supplier?: string;           // 供应商
  qualityStatus?: 'passed' | 'failed' | 'pending'; // 质检状态
  productionDateStart?: string; // 生产日期开始
  productionDateEnd?: string;  // 生产日期结束
  expiryDateStart?: string;    // 过期日期开始
  expiryDateEnd?: string;      // 过期日期结束
  receivedDateStart?: string;  // 入库日期开始
  receivedDateEnd?: string;    // 入库日期结束
}

// 批次操作记录接口
export interface BatchOperation {
  id: string;
  batchId: string;             // 批次ID
  batchNumber: string;         // 批次号
  operationType: 'in' | 'out' | 'transfer' | 'adjust' | 'reserve' | 'unreserve'; // 操作类型
  quantity: number;            // 操作数量
  beforeQuantity: number;      // 操作前数量
  afterQuantity: number;       // 操作后数量
  relatedOrderId?: string;     // 关联单据ID
  relatedOrderNumber?: string; // 关联单据号
  operator: string;            // 操作人
  operatorId: string;          // 操作人ID
  reason?: string;             // 操作原因
  remark?: string;             // 备注
  operationDate: string;       // 操作日期
  createdAt: string;
}

// 产品类目配置
export const PRODUCT_TYPE_CONFIG = {
  [ProductType.RAW_MATERIAL]: {
    label: '原料',
    color: 'blue',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  },
  [ProductType.SEMI_FINISHED]: {
    label: '半成品',
    color: 'orange',
    bgColor: '#fff7e6',
    borderColor: '#ffd591'
  },
  [ProductType.FINISHED_PRODUCT]: {
    label: '产成品',
    color: 'green',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  [ProductType.CONSUMABLE]: {
    label: '消耗品',
    color: 'purple',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  },
  [ProductType.TOOL]: {
    label: '工具',
    color: 'cyan',
    bgColor: '#e6fffb',
    borderColor: '#87e8de'
  },
  [ProductType.EQUIPMENT]: {
    label: '设备',
    color: 'magenta',
    bgColor: '#fff0f6',
    borderColor: '#ffadd2'
  }
} as const;

// 出库类型枚举
export enum OutboundType {
  SALES = 'sales',                 // 销售出库
  PRODUCTION = 'production',       // 生产领料
  TRANSFER = 'transfer',           // 调拨出库
  RETURN = 'return',               // 退货出库
  DAMAGE = 'damage',               // 报损出库
  SAMPLE = 'sample',               // 样品出库
  MAINTENANCE = 'maintenance',     // 维修领料
  RESEARCH = 'research',           // 研发领料
  OTHER = 'other'                  // 其他出库
}

// 出库单状态枚举
export enum OutboundOrderStatus {
  PENDING = 'pending',             // 待审核
  APPROVED = 'approved',           // 已审核
  PICKING = 'picking',             // 拣货中
  PICKED = 'picked',               // 已拣货
  SHIPPED = 'shipped',             // 已出库
  CANCELLED = 'cancelled',         // 已取消
  REJECTED = 'rejected'            // 已拒绝
}

// 出库单接口
export interface OutboundOrder {
  id: string;
  orderNumber: string;             // 出库单编号
  productId: string;               // 产品ID
  productCode: string;             // 产品编码
  productName: string;             // 物料名称
  productType: ProductType;        // 产品类目
  specification: string;           // 规格型号
  unit: string;                    // 单位
  warehouseId: string;             // 仓库ID
  warehouseName: string;           // 仓库名称
  locationId?: string;             // 库位ID
  locationName?: string;           // 库位名称
  batchNumber: string;             // 物料批次号
  outboundType: OutboundType;      // 出库类型
  requestedQuantity: number;       // 申请数量
  actualQuantity: number;          // 出库数量
  unitPrice: number;               // 单价
  totalAmount: number;             // 总金额
  applicant: string;               // 申请人
  applicantId: string;             // 申请人ID
  recipient: string;               // 领料人
  recipientId: string;             // 领料人ID
  department?: string;             // 申请部门
  purpose: string;                 // 用途
  status: OutboundOrderStatus;     // 状态
  priority: 'low' | 'normal' | 'high' | 'urgent'; // 优先级
  requestDate: string;             // 申请时间
  approvedDate?: string;           // 审核时间
  approver?: string;               // 审核人
  approverId?: string;             // 审核人ID
  pickedDate?: string;             // 拣货时间
  picker?: string;                 // 拣货人
  pickerId?: string;               // 拣货人ID
  shippedDate?: string;            // 出库时间
  shipper?: string;                // 出库人
  shipperId?: string;              // 出库人ID
  expectedDate?: string;           // 预计出库时间
  actualDate?: string;             // 实际出库时间
  relatedOrderId?: string;         // 关联单据ID
  relatedOrderNumber?: string;     // 关联单据号
  remark?: string;                 // 备注
  attachments?: string[];          // 附件
  createdAt: string;
  updatedAt: string;
}

// 出库单查询参数接口
export interface OutboundOrderQueryParams {
  page?: number;
  pageSize?: number;
  orderNumber?: string;            // 出库单编号
  productCode?: string;            // 产品编码
  productName?: string;            // 物料名称
  productType?: ProductType;       // 产品类目
  warehouseId?: string;            // 仓库ID
  batchNumber?: string;            // 批次号
  outboundType?: OutboundType;     // 出库类型
  status?: OutboundOrderStatus;    // 状态
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // 优先级
  applicant?: string;              // 申请人
  recipient?: string;              // 领料人
  department?: string;             // 申请部门
  purpose?: string;                // 用途
  requestDateStart?: string;       // 申请时间开始
  requestDateEnd?: string;         // 申请时间结束
  expectedDateStart?: string;      // 预计出库时间开始
  expectedDateEnd?: string;        // 预计出库时间结束
  actualDateStart?: string;        // 实际出库时间开始
  actualDateEnd?: string;          // 实际出库时间结束
}

// 出库单统计接口
export interface OutboundOrderStatistics {
  totalOrders: number;             // 总出库单数
  totalQuantity: number;           // 总出库数量
  totalAmount: number;             // 总出库金额
  pendingCount: number;            // 待审核数量
  approvedCount: number;           // 已审核数量
  pickingCount: number;            // 拣货中数量
  shippedCount: number;            // 已出库数量
  cancelledCount: number;          // 已取消数量
  byOutboundType: {
    [key in OutboundType]: {
      count: number;
      quantity: number;
      amount: number;
    }
  };
  byStatus: {
    [key in OutboundOrderStatus]: number;
  };
  byWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    orderCount: number;
    totalQuantity: number;
    totalAmount: number;
  }>;
}

// 出库类型配置
export const OUTBOUND_TYPE_CONFIG = {
  [OutboundType.SALES]: {
    label: '销售出库',
    color: 'green',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  [OutboundType.PRODUCTION]: {
    label: '生产领料',
    color: 'blue',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  },
  [OutboundType.TRANSFER]: {
    label: '调拨出库',
    color: 'purple',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  },
  [OutboundType.RETURN]: {
    label: '退货出库',
    color: 'orange',
    bgColor: '#fff7e6',
    borderColor: '#ffd591'
  },
  [OutboundType.DAMAGE]: {
    label: '报损出库',
    color: 'red',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7'
  },
  [OutboundType.SAMPLE]: {
    label: '样品出库',
    color: 'cyan',
    bgColor: '#e6fffb',
    borderColor: '#87e8de'
  },
  [OutboundType.MAINTENANCE]: {
    label: '维修领料',
    color: 'volcano',
    bgColor: '#fff2e8',
    borderColor: '#ffbb96'
  },
  [OutboundType.RESEARCH]: {
    label: '研发领料',
    color: 'magenta',
    bgColor: '#fff0f6',
    borderColor: '#ffadd2'
  },
  [OutboundType.OTHER]: {
    label: '其他出库',
    color: 'default',
    bgColor: '#fafafa',
    borderColor: '#d9d9d9'
  }
} as const;

// 出库单状态配置
export const OUTBOUND_ORDER_STATUS_CONFIG = {
  [OutboundOrderStatus.PENDING]: {
    label: '待审核',
    color: 'orange',
    bgColor: '#fff7e6',
    borderColor: '#ffd591'
  },
  [OutboundOrderStatus.APPROVED]: {
    label: '已审核',
    color: 'blue',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  },
  [OutboundOrderStatus.PICKING]: {
    label: '拣货中',
    color: 'purple',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  },
  [OutboundOrderStatus.PICKED]: {
    label: '已拣货',
    color: 'cyan',
    bgColor: '#e6fffb',
    borderColor: '#87e8de'
  },
  [OutboundOrderStatus.SHIPPED]: {
    label: '已出库',
    color: 'green',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  [OutboundOrderStatus.CANCELLED]: {
    label: '已取消',
    color: 'default',
    bgColor: '#fafafa',
    borderColor: '#d9d9d9'
  },
  [OutboundOrderStatus.REJECTED]: {
    label: '已拒绝',
    color: 'red',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7'
  }
} as const;

// 库存状态配置
export const INVENTORY_STATUS_CONFIG = {
  [InventoryStatus.NORMAL]: {
    label: '正常',
    color: 'green',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  [InventoryStatus.LOW_STOCK]: {
    label: '库存不足',
    color: 'orange',
    bgColor: '#fff7e6',
    borderColor: '#ffd591'
  },
  [InventoryStatus.OUT_OF_STOCK]: {
    label: '缺货',
    color: 'red',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7'
  },
  [InventoryStatus.OVERSTOCKED]: {
    label: '库存过多',
    color: 'purple',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  },
  [InventoryStatus.RESERVED]: {
    label: '已预留',
    color: 'blue',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  },
  [InventoryStatus.DAMAGED]: {
    label: '损坏',
    color: 'volcano',
    bgColor: '#fff2e8',
    borderColor: '#ffbb96'
  },
  [InventoryStatus.EXPIRED]: {
    label: '过期',
    color: 'magenta',
    bgColor: '#fff0f6',
    borderColor: '#ffadd2'
  }
} as const;

// 库存变动类型配置
export const INVENTORY_TRANSACTION_TYPE_CONFIG = {
  [InventoryTransactionType.PURCHASE_IN]: {
    label: '采购入库',
    color: 'green',
    direction: 'in'
  },
  [InventoryTransactionType.SALES_OUT]: {
    label: '销售出库',
    color: 'red',
    direction: 'out'
  },
  [InventoryTransactionType.PRODUCTION_IN]: {
    label: '生产入库',
    color: 'blue',
    direction: 'in'
  },
  [InventoryTransactionType.PRODUCTION_OUT]: {
    label: '生产出库',
    color: 'orange',
    direction: 'out'
  },
  [InventoryTransactionType.TRANSFER_IN]: {
    label: '调拨入库',
    color: 'cyan',
    direction: 'in'
  },
  [InventoryTransactionType.TRANSFER_OUT]: {
    label: '调拨出库',
    color: 'purple',
    direction: 'out'
  },
  [InventoryTransactionType.ADJUSTMENT_IN]: {
    label: '盘盈',
    color: 'lime',
    direction: 'in'
  },
  [InventoryTransactionType.ADJUSTMENT_OUT]: {
    label: '盘亏',
    color: 'volcano',
    direction: 'out'
  },
  [InventoryTransactionType.RETURN_IN]: {
    label: '退货入库',
    color: 'geekblue',
    direction: 'in'
  },
  [InventoryTransactionType.RETURN_OUT]: {
    label: '退货出库',
    color: 'magenta',
    direction: 'out'
  },
  [InventoryTransactionType.DAMAGE_OUT]: {
    label: '报损出库',
    color: 'red',
    direction: 'out'
  },
  [InventoryTransactionType.OTHER_IN]: {
    label: '其他入库',
    color: 'default',
    direction: 'in'
  },
  [InventoryTransactionType.OTHER_OUT]: {
    label: '其他出库',
    color: 'default',
    direction: 'out'
  }
} as const;

// 批次状态配置
export const BATCH_STATUS_CONFIG = {
  [BatchStatus.NORMAL]: {
    label: '正常',
    color: 'green',
    bgColor: '#f6ffed',
    borderColor: '#b7eb8f'
  },
  [BatchStatus.EXPIRED]: {
    label: '已过期',
    color: 'red',
    bgColor: '#fff2f0',
    borderColor: '#ffccc7'
  },
  [BatchStatus.EXPIRING_SOON]: {
    label: '即将过期',
    color: 'orange',
    bgColor: '#fff7e6',
    borderColor: '#ffd591'
  },
  [BatchStatus.DAMAGED]: {
    label: '损坏',
    color: 'volcano',
    bgColor: '#fff2e8',
    borderColor: '#ffbb96'
  },
  [BatchStatus.QUARANTINE]: {
    label: '隔离',
    color: 'purple',
    bgColor: '#f9f0ff',
    borderColor: '#d3adf7'
  },
  [BatchStatus.RESERVED]: {
    label: '已预留',
    color: 'blue',
    bgColor: '#e6f7ff',
    borderColor: '#91d5ff'
  }
} as const;