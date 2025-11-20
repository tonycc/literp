import type { ApiResponse } from '../types/common'
import type { ManufacturingOrder, ManufacturingOrderCreateFromPlanRequest, ManufacturingOrderListParams, WorkOrder, WorkOrderListParams, GenerateWorkOrdersRequest } from '../types/mo'

export interface ManufacturingOrderApi {
  createFromPlan(data: ManufacturingOrderCreateFromPlanRequest): Promise<ApiResponse<ManufacturingOrder[]>>
  getList(params: ManufacturingOrderListParams): Promise<ApiResponse<{ data: ManufacturingOrder[]; total: number; page: number; pageSize: number; totalPages: number }>>
  getById(id: string): Promise<ApiResponse<ManufacturingOrder>>
  confirm(id: string): Promise<ApiResponse<void>>
  cancel(id: string): Promise<ApiResponse<void>>
  generateWorkOrders(id: string, data?: GenerateWorkOrdersRequest): Promise<ApiResponse<WorkOrder[]>>
  getWorkOrders(id: string): Promise<ApiResponse<WorkOrder[]>>
  listWorkOrders(params: WorkOrderListParams): Promise<ApiResponse<{ data: WorkOrder[]; total: number; page: number; pageSize: number; totalPages: number }>>
  delete(id: string): Promise<ApiResponse<void>>
}