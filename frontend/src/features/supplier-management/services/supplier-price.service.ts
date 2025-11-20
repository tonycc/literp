import apiClient from '@/shared/services/api'
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared'
import type { SupplierPrice, CreateSupplierPriceData, UpdateSupplierPriceData, SupplierPriceListParams } from '@zyerp/shared'

export class SupplierPriceService {
  async getList(params: { current?: number; pageSize?: number; dateRange?: [string, string] } & Partial<SupplierPriceListParams>): Promise<{ data: SupplierPrice[]; success: boolean; total: number; }> {
    const page = params.current ?? params.page ?? 1
    const pageSize = params.pageSize ?? params.pageSize ?? 10
    const range = params.dateRange
    const query: SupplierPriceListParams = {
      page,
      pageSize,
      supplierId: params.supplierId,
      supplierName: params.supplierName,
      productName: params.productName,
      productCode: params.productCode,
      vatRate: params.vatRate,
      startDate: range?.[0],
      endDate: range?.[1],
    }
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SupplierPrice>>>('/supplier-prices', { params: query })
    const wrapped = response.data
    const payload = wrapped.data
    const list = (payload?.data ?? []) as SupplierPrice[]
    const pagination = payload?.pagination
    const total = pagination?.total ?? 0
    return { data: list, success: wrapped.success, total }
  }

  async getById(id: string): Promise<ApiResponse<SupplierPrice>> {
    const response = await apiClient.get<ApiResponse<SupplierPrice>>(`/supplier-prices/${id}`)
    return response.data
  }

  async create(data: CreateSupplierPriceData): Promise<ApiResponse<SupplierPrice>> {
    const response = await apiClient.post<ApiResponse<SupplierPrice>>('/supplier-prices', data)
    return response.data
  }

  async update(id: string, data: UpdateSupplierPriceData): Promise<ApiResponse<SupplierPrice>> {
    const response = await apiClient.put<ApiResponse<SupplierPrice>>(`/supplier-prices/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/supplier-prices/${id}`)
    return response.data
  }
}

export const supplierPriceService = new SupplierPriceService()