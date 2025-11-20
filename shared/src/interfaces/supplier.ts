import type { ApiResponse, PaginatedResponse } from '../types/common'
import type { Supplier, CreateSupplierData, UpdateSupplierData, SupplierListParams } from '../types/supplier'

export interface SupplierApi {
  getSupplierList(params?: SupplierListParams): Promise<PaginatedResponse<Supplier>>
  getById(id: string): Promise<ApiResponse<Supplier>>
  create(data: CreateSupplierData): Promise<ApiResponse<Supplier>>
  update(id: string, data: UpdateSupplierData): Promise<ApiResponse<Supplier>>
  delete(id: string): Promise<ApiResponse<void>>
}