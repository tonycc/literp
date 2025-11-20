import apiClient from '@/shared/services/api'
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared'
import type { Supplier, CreateSupplierData, UpdateSupplierData, SupplierListParams } from '@zyerp/shared'

export class SupplierService {
  async getList(params: { current?: number; pageSize?: number } & Partial<SupplierListParams>): Promise<{ data: Supplier[]; success: boolean; total: number; }> {
    const page = params.current ?? params.page ?? 1
    const pageSize = params.pageSize ?? params.pageSize ?? 10
    const query: SupplierListParams = {
      page,
      pageSize,
      keyword: params.keyword,
      status: params.status,
      category: params.category,
    }

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Supplier>>>('/suppliers', { params: query })
    const wrapped = response.data
    const payload = wrapped.data
    const list = (payload?.data ?? []) as Supplier[]
    const pagination = payload?.pagination
    const total = pagination?.total ?? 0
    return { data: list, success: wrapped.success, total }
  }

  async getById(id: string): Promise<ApiResponse<Supplier>> {
    const response = await apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`)
    return response.data
  }

  async create(data: CreateSupplierData): Promise<ApiResponse<Supplier>> {
    const response = await apiClient.post<ApiResponse<Supplier>>('/suppliers', data)
    return response.data
  }

  async update(id: string, data: UpdateSupplierData): Promise<ApiResponse<Supplier>> {
    const response = await apiClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/suppliers/${id}`)
    return response.data
  }
}

export const supplierService = new SupplierService()