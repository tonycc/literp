import type { SalesOrder } from '../types/sales-order'
import type { PaginatedResponse, ApiResponse } from '../types/common'

export type SalesOrderListApiResponse = ApiResponse<PaginatedResponse<SalesOrder>>