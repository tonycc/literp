import type { ApiResponse, PaginatedResponse } from './common'

export type MoStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export interface ManufacturingOrder {
  id: string
  orderNo: string
  sourceType?: string | null
  sourceRefId?: string | null
  sourceOrderNo?: string | null
  productId: string
  productCode?: string | null
  productName?: string | null
  variantId?: string | null
  bomId?: string | null
  bomCode?: string | null
  routingId?: string | null
  routingCode?: string | null
  unitId?: string | null
  unit?: string | null
  quantity: number
  warehouseId?: string | null
  plannedStart?: string | Date | null
  plannedFinish?: string | Date | null
  dueDate?: string | Date | null
  priority?: number | null
  status: MoStatus
  parentMoId?: string | null
  parentMoOrderNo?: string | null
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
  scheduledQuantity?: number
  pendingQuantity?: number
}

export interface ManufacturingOrderListParams {
  page?: number
  pageSize?: number
  status?: MoStatus | string
  productCode?: string
  orderNo?: string
  sourceOrderNo?: string
}

export interface ManufacturingOrderCreateFromPlanRequest {
  orderId: string
  warehouseId?: string
  dueDate?: string
  plannedStart?: string
  plannedFinish?: string
  products: Array<{
    productId: string
    productCode: string
    productName: string
    quantity: number
    unit?: string | null
    bomId?: string | null
    bomCode?: string | null
    routingId?: string | null
    routingCode?: string | null
    source?: 'bom' | 'child_bom' | 'bom_child'
    parentProductId?: string | null
  }>
}

export type ManufacturingOrderListResponse = PaginatedResponse<ManufacturingOrder>
export type ManufacturingOrderResponse = ApiResponse<ManufacturingOrder>
export type ManufacturingOrderCreateResponse = ApiResponse<ManufacturingOrder[]>

export type WorkOrderStatus = 'draft' | 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled'

export interface WorkOrder {
  id: string
  orderNo?: string
  moId: string
  operationId: string
  name?: string | null
  sequence: number
  workcenterId?: string | null
  ownerId?: string | null
  routingWorkcenterIds?: string[]
  sequenceStart?: number
  sequenceEnd?: number
  operationsLabel?: string | null
  batchNo?: string | null
  quantity?: number
  plannedStart?: string | Date | null
  plannedFinish?: string | Date | null
  issueWarehouseId?: string | null
  finishedWarehouseId?: string | null
  status: WorkOrderStatus
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  updatedBy?: string | null
}

export type WorkOrderDetail = WorkOrder & {
  moOrderNo?: string
  productId?: string
  productCode?: string | null
  productName?: string | null
  moQuantity?: number
  moUnit?: string | null
  moPlannedStart?: string | Date | null
  moPlannedFinish?: string | Date | null
  sourceType?: string | null
  sourceRefId?: string | null
  moRoutingCode?: string | null
  moBomCode?: string | null
  materialsCount?: number
  materialsSummary?: string | null
  materials?: WorkOrderMaterialLine[]
  materialsKinds?: number
  needsSubcontracting?: boolean
  outsourcedOperationCount?: number
  subcontractOrderId?: string
  subcontractOrderNo?: string | null
}

export interface WorkOrderMaterial {
  id: string
  workOrderId: string
  materialId: string
  unitId: string
  quantity: number
  warehouseId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface WorkOrderMaterialLine {
  materialId: string
  materialCode?: string | null
  materialName?: string | null
  unitId: string
  unit?: string | null
  quantity: number
  warehouseId?: string | null
  issued?: boolean
}

export interface CreateWorkOrderMaterialInput {
  materialId: string
  unitId: string
  quantity: number
  warehouseId?: string
}

export interface CreateWorkOrderOperationInput {
  routingWorkcenterId: string
}

export interface CreateWorkOrderRequest {
  moId: string
  quantity: number
  workcenterId?: string
  ownerId?: string
  plannedStart?: string
  plannedFinish?: string
  issueWarehouseId?: string
  finishedWarehouseId?: string
  materials?: CreateWorkOrderMaterialInput[]
  operations?: CreateWorkOrderOperationInput[]
}

export interface WorkOrderListParams {
  page?: number
  pageSize?: number
  status?: WorkOrderStatus | string
  workcenterId?: string
  moId?: string
  start?: string
  end?: string
}

export type GenerateMode = 'operation' | 'workcenter'

export interface GenerateWorkOrdersItem {
  routingWorkcenterId?: string
  routingWorkcenterIds?: string[]
  operationId: string
  sequence?: number
  sequenceStart?: number
  sequenceEnd?: number
  workcenterId?: string | null
  name?: string | null
  plannedStart?: string
  plannedFinish?: string
}

export interface GenerateWorkOrdersRequest {
  quantity: number
  mode: GenerateMode
  issueWarehouseId?: string
  finishedWarehouseId?: string
  baselineStart?: string
  baselineFinish?: string
  items?: GenerateWorkOrdersItem[]
}
