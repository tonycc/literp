/**
 * 销售订单相关类型定义
 */
import { SalesOrderPaymentMethod as PaymentMethod } from '@/shared/constants/sales-order'
import type { SalesOrderListParams } from '@zyerp/shared'

export { SalesOrderStatus } from '@zyerp/shared'
export type { SalesOrder, SalesOrderItem, SalesOrderListParams } from '@zyerp/shared'
export { SalesOrderPaymentMethod as PaymentMethod } from '@/shared/constants/sales-order'

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

 

// 销售订单查询参数统一为共享的 SalesOrderListParams
export type SalesOrderQueryParams = SalesOrderListParams

// 销售订单表单数据
export interface SalesOrderFormData {
  productId?: string;
  customerName: string;
  contactInfo: string;
  contactPerson?: string;
  contactPhone?: string;
  orderDate: string;
  deliveryDate: string;
  salesManager: string;
  productName?: string;
  productCode?: string;
  customerProductCode?: string;
  specification?: string;
  unit?: string;
  quantity?: number;
  unitPriceWithTax?: number;
  unitPriceWithoutTax?: number;
  taxRate: number;
  paymentMethod: PaymentMethod;
  plannedPaymentDate: string;
  remark?: string;
  totalPriceWithTax?: number;
  items?: Array<{ productId: string; productName?: string; productCode?: string; specification?: string; unit?: string; quantity: number; unitPriceWithTax: number }>;
}

// 销售订单统计数据
export interface SalesOrderStats {
  totalOrders: number;           // 总订单数
  pendingOrders: number;         // 待处理订单数
  completedOrders: number;       // 已完成订单数
  totalSalesAmount: number;      // 总销售金额
  monthlyGrowth: number;         // 月度增长率
}