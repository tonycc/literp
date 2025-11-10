// 收货状态枚举
export enum ReceiptStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected'
}

// 销售出库接口
export interface SalesReceipt {
  id: string;
  receiptNumber: string; // 出库单编号
  salesOrderNumber: string; // 销售订单编号
  customerName: string; // 客户名称
  customerContact: string; // 客户联系人
  productName: string; // 产品名称
  productCode: string; // 产品编码
  specification: string; // 规格型号
  unit: string; // 单位
  salesQuantity: number; // 销售数量
  currentReceiptQuantity: number; // 本次出库数量
  totalReceiptQuantity: number; // 出库产品总数
  totalSalesPrice: number; // 产品合计售价
  receiptStatus: ReceiptStatus; // 收货状态
  receiptConfirmTime?: string; // 收货确认时间
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// 查询参数接口
export interface SalesReceiptQueryParams {
  page: number;
  pageSize: number;
  receiptNumber?: string; // 出库单编号
  salesOrderNumber?: string; // 销售订单编号
  customerName?: string; // 客户名称
  productName?: string; // 产品名称
  receiptStatus?: ReceiptStatus; // 收货状态
  startDate?: string; // 开始日期
  endDate?: string; // 结束日期
}

// 表单数据接口
export interface SalesReceiptFormData {
  salesOrderNumber: string; // 销售订单编号
  customerName: string; // 客户名称
  customerContact: string; // 客户联系人
  productName: string; // 产品名称
  productCode: string; // 产品编码
  specification: string; // 规格型号
  unit: string; // 单位
  salesQuantity: number; // 销售数量
  currentReceiptQuantity: number; // 本次出库数量
  totalSalesPrice: number; // 产品合计售价
  remark?: string; // 备注
}

// 收货状态配置
export const RECEIPT_STATUS_CONFIG = {
  [ReceiptStatus.PENDING]: {
    text: '待收货',
    color: 'orange'
  },
  [ReceiptStatus.CONFIRMED]: {
    text: '已收货',
    color: 'green'
  },
  [ReceiptStatus.REJECTED]: {
    text: '拒收',
    color: 'red'
  }
} as const;