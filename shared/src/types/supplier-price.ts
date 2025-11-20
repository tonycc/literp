export interface SupplierPrice {
  id: string
  supplierId: string
  variantId?: string
  productName: string
  productCode: string
  unitId?: string
  unit?: string
  taxInclusivePrice: number
  vatRate: number
  taxExclusivePrice: number
  currency?: string
  effectiveDate?: string
  expiryDate?: string
  minOrderQty?: number
  purchaseManager?: string
  submittedBy?: string
  submittedAt?: string
  remark?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface CreateSupplierPriceData {
  supplierId: string
  variantId?: string
  productName: string
  productCode: string
  unitId?: string
  unit?: string
  taxInclusivePrice: number
  vatRate: number
  currency?: string
  effectiveDate?: string
  expiryDate?: string
  minOrderQty?: number
  purchaseManager?: string
  remark?: string
}

export interface UpdateSupplierPriceData extends Partial<CreateSupplierPriceData> {
  id: string
}

export interface SupplierPriceListParams {
  page?: number
  pageSize?: number
  supplierId?: string
  supplierName?: string
  productName?: string
  productCode?: string
  vatRate?: number
  startDate?: string
  endDate?: string
}

export interface SupplierPriceListResponse {
  data: SupplierPrice[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}