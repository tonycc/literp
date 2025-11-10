// 生产入库相关类型定义

// 生产入库状态枚举
export enum ProductionInboundStatus {
  PENDING = 'pending',      // 待入库
  COMPLETED = 'completed',  // 已入库
  CANCELLED = 'cancelled'   // 已取消
}

// 为生产入库创建简化的产品信息类型
export interface ProductSummary {
  id: string;
  code: string;
  name: string;
  specification: string;
  unit: string;
  category: string;
}

// 生产订单信息
export interface ProductionOrderInfo {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  plannedQuantity: number;
  completedQuantity: number;
  status: string;
}

// 生产入库记录
export interface ProductionInboundRecord {
  id: string;
  inboundNumber: string;           // 入库单号
  productionOrderId: string;       // 生产订单ID
  productionOrderNumber: string;   // 生产订单号
  productInfo: ProductSummary;     // 产品信息
  inboundQuantity: number;         // 入库数量
  qualifiedQuantity: number;       // 合格数量
  defectiveQuantity: number;       // 不合格数量
  batchNumber: string;             // 批次号
  warehouseId: string;             // 仓库ID
  warehouseName: string;           // 仓库名称
  locationId?: string;             // 库位ID
  locationName?: string;           // 库位名称
  status: ProductionInboundStatus; // 入库状态
  operatorId: string;              // 操作员ID
  operatorName: string;            // 操作员姓名
  qualityInspectorId?: string;     // 质检员ID
  qualityInspectorName?: string;   // 质检员姓名
  inboundDate: string;             // 入库日期
  remarks?: string;                // 备注
  createdAt: string;               // 创建时间
  updatedAt: string;               // 更新时间
  createdBy: string;               // 创建人
  updatedBy: string;               // 更新人
}

// 生产入库查询参数
export interface ProductionInboundQueryParams {
  inboundNumber?: string;          // 入库单号
  productionOrderNumber?: string;  // 生产订单号
  productName?: string;            // 产品名称
  batchNumber?: string;            // 批次号
  warehouseId?: string;            // 仓库ID
  status?: ProductionInboundStatus; // 入库状态
  operatorId?: string;             // 操作员ID
  startDate?: string;              // 开始日期
  endDate?: string;                // 结束日期
  page?: number;                   // 页码
  pageSize?: number;               // 每页数量
}

// 生产入库表单数据
export interface ProductionInboundFormData {
  productionOrderId: string;       // 生产订单ID
  inboundQuantity: number;         // 入库数量
  qualifiedQuantity: number;       // 合格数量
  defectiveQuantity: number;       // 不合格数量
  batchNumber: string;             // 批次号
  warehouseId: string;             // 仓库ID
  locationId?: string;             // 库位ID
  qualityInspectorId?: string;     // 质检员ID
  inboundDate: string;             // 入库日期
  remarks?: string;                // 备注
}

// 仓库信息
export interface WarehouseInfo {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
}

// 库位信息
export interface LocationInfo {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  status: string;
}

// 员工信息
export interface EmployeeInfo {
  id: string;
  code: string;
  name: string;
  department: string;
  position: string;
}

// 生产入库统计信息
export interface ProductionInboundStatistics {
  totalRecords: number;            // 总记录数
  pendingCount: number;            // 待入库数量
  completedCount: number;          // 已入库数量
  cancelledCount: number;          // 已取消数量
  totalInboundQuantity: number;    // 总入库数量
  totalQualifiedQuantity: number;  // 总合格数量
  totalDefectiveQuantity: number;  // 总不合格数量
  qualificationRate: number;       // 合格率
}

// API 响应类型
export interface ProductionInboundListResponse {
  data: ProductionInboundRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductionInboundDetailResponse {
  data: ProductionInboundRecord;
}

export interface ProductionInboundCreateResponse {
  data: ProductionInboundRecord;
  message: string;
}

export interface ProductionInboundUpdateResponse {
  data: ProductionInboundRecord;
  message: string;
}