// 生产记录状态枚举
export enum ProductionRecordStatus {
  PENDING = 'pending',           // 待开始
  IN_PROGRESS = 'in_progress',   // 进行中
  COMPLETED = 'completed',       // 已完成
  CANCELLED = 'cancelled'        // 已取消
}

// 生产记录状态配置
export const PRODUCTION_RECORD_STATUS_CONFIG = {
  [ProductionRecordStatus.PENDING]: {
    text: '待开始',
    color: 'orange',
    badge: 'warning'
  },
  [ProductionRecordStatus.IN_PROGRESS]: {
    text: '进行中',
    color: 'blue',
    badge: 'processing'
  },
  [ProductionRecordStatus.COMPLETED]: {
    text: '已完成',
    color: 'green',
    badge: 'success'
  },
  [ProductionRecordStatus.CANCELLED]: {
    text: '已取消',
    color: 'red',
    badge: 'error'
  }
};

// 物料信息接口
export interface MaterialInfo {
  id: string;
  code: string;        // 物料编码
  name: string;        // 物料名称
  specification?: string; // 规格
  unit: string;        // 单位
  category?: string;   // 分类
}

// 员工信息接口
export interface EmployeeInfo {
  id: string;
  name: string;        // 员工姓名
  employeeNumber: string; // 员工编号
  department?: string; // 部门
}

// 生产记录接口
export interface ProductionRecord {
  id: string;
  recordNumber: string;          // 生产记录编号
  batchNumber: string;           // 产品批次号
  productionOrderNumber: string; // 生产工单编号
  productName: string;           // 产品名称
  materialInfo: MaterialInfo;    // 领取物料信息
  materialQuantity: number;      // 领取数量
  productionQuantity: number;    // 生产数量
  materialEmployee: EmployeeInfo; // 领料员工
  productionEmployee: EmployeeInfo; // 生产员工
  materialTime: string;          // 领料时间
  completionTime?: string;       // 完工时间
  status: ProductionRecordStatus; // 状态
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
  createdBy: string;            // 创建人
  updatedBy?: string;           // 更新人
  remark?: string;              // 备注
}

// 生产记录查询参数接口
export interface ProductionRecordQueryParams {
  page?: number;
  pageSize?: number;
  recordNumber?: string;         // 生产记录编号
  batchNumber?: string;          // 产品批次号
  productionOrderNumber?: string; // 生产工单编号
  productName?: string;          // 产品名称
  materialEmployeeName?: string; // 领料员工
  productionEmployeeName?: string; // 生产员工
  status?: ProductionRecordStatus; // 状态
  materialTimeStart?: string;    // 领料时间（开始）
  materialTimeEnd?: string;      // 领料时间（结束）
  completionTimeStart?: string;  // 完工时间（开始）
  completionTimeEnd?: string;    // 完工时间（结束）
  createdAtStart?: string;       // 创建时间（开始）
  createdAtEnd?: string;         // 创建时间（结束）
  sortBy?: string;              // 排序字段
  sortOrder?: 'asc' | 'desc';   // 排序方向
}

// 生产记录统计信息接口
export interface ProductionRecordStatistics {
  total: number;           // 总数
  pending: number;         // 待开始
  inProgress: number;      // 进行中
  completed: number;       // 已完成
  cancelled: number;       // 已取消
  todayCreated: number;    // 今日新增
  todayCompleted: number;  // 今日完成
}

// 生产记录列表响应接口
export interface ProductionRecordListResponse {
  data: ProductionRecord[];
  total: number;
  page: number;
  pageSize: number;
  statistics: ProductionRecordStatistics;
}

// 生产记录表单数据接口
export interface ProductionRecordFormData {
  recordNumber: string;
  batchNumber: string;
  productionOrderNumber: string;
  productName: string;
  materialId: string;
  materialQuantity: number;
  productionQuantity: number;
  materialEmployeeId: string;
  productionEmployeeId: string;
  materialTime: string;
  completionTime?: string;
  status: ProductionRecordStatus;
  remark?: string;
}