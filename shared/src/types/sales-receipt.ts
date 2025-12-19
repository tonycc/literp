import type { SalesOrder } from './sales-order';

export enum SalesReceiptStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export interface SalesReceiptItem {
  id: string;
  receiptId: string;
  salesOrderItemId: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  warehouseId?: string;
  remarks?: string;
}

export interface SalesReceiptInfo {
  id: string;
  receiptNo: string;
  salesOrderId: string;
  salesOrderNo: string;
  customerName: string;
  status: SalesReceiptStatus;
  receiptDate: string;
  handler?: string;
  remarks?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  items?: SalesReceiptItem[];
  salesOrder?: SalesOrder;
}

export interface CreateSalesReceiptItemDto {
  salesOrderItemId: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  warehouseId?: string;
  remarks?: string;
}

export interface CreateSalesReceiptDto {
  salesOrderId: string;
  salesOrderNo: string;
  customerName: string;
  receiptDate: string;
  handler?: string;
  remarks?: string;
  items: CreateSalesReceiptItemDto[];
}

export interface UpdateSalesReceiptDto {
  receiptDate?: string;
  handler?: string;
  remarks?: string;
  items?: CreateSalesReceiptItemDto[];
}

export interface SalesReceiptQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  customerName?: string;
  status?: SalesReceiptStatus;
  startDate?: string;
  endDate?: string;
  salesOrderId?: string;
}
