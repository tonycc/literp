import type { ApiResponse, PaginatedResponse } from '../types/common'
import type { Customer, CreateCustomerData, UpdateCustomerData, CustomerListParams } from '../types/customer'

export interface CustomerApi {
  getCustomerList(params?: CustomerListParams): Promise<PaginatedResponse<Customer>>
  getById(id: string): Promise<ApiResponse<Customer>>
  create(data: CreateCustomerData): Promise<ApiResponse<Customer>>
  update(id: string, data: UpdateCustomerData): Promise<ApiResponse<Customer>>
  delete(id: string): Promise<ApiResponse<void>>
}