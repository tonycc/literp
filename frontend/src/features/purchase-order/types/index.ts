export {
  PurchaseOrderStatus,
  type PurchaseOrder,
  type PurchaseOrderItem,
  type PurchaseOrderDetail,
  type PurchaseOrderFormData,
  type PurchaseOrderListParams,
} from '@zyerp/shared';

export interface PurchaseOrderStats {
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  completedOrders: number;
}