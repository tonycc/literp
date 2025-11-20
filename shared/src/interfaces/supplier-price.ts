import type { ApiResponse, PaginatedResponse } from '../types/common'
import type { SupplierPrice, CreateSupplierPriceData, UpdateSupplierPriceData, SupplierPriceListParams } from '../types/supplier-price'

export interface SupplierPriceApi {
  getList(params?: SupplierPriceListParams): Promise<PaginatedResponse<SupplierPrice>>
  getById(id: string): Promise<ApiResponse<SupplierPrice>>
  create(data: CreateSupplierPriceData): Promise<ApiResponse<SupplierPrice>>
  update(id: string, data: UpdateSupplierPriceData): Promise<ApiResponse<SupplierPrice>>
  delete(id: string): Promise<ApiResponse<void>>
}