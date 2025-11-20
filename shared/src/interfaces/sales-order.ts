import type { SalesOrder, SalesOrderItem, SalesOrderListParams } from '../types/sales-order'
import type { PaginatedResponse, ApiResponse } from '../types/common'

export type { SalesOrder, SalesOrderItem, SalesOrderListParams }

export type SalesOrderListApiResponse = ApiResponse<PaginatedResponse<SalesOrder>>